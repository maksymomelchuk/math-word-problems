#!/usr/bin/env python3
"""Check problem-set.md against its own write-ups and the number rules.

For every problem it checks:
- each action's arithmetic, and that the result is written the canonical way (0,4 not 0,40);
- that every operand is a number from the text, a unit change, or an earlier result;
- that every number in the text is used by the main plan;
- that the short record only uses numbers from the text and unit changes;
- that «Відповідь» holds the final result, and that every other plan reaches it;
- that "Order: a) is independent of b)" lines are true;
- the number rules of problem-set-plan.md: whole numbers in Levels 1-2, decimals only
  with + and - (never in a speed), exact whole-number divisions, positive results,
  at most two decimal places, fractions only in problems with a дріб від числа relation,
  and only the catalog's unit changes.

Run: python3 check-problem-set.py [path]   (default: problem-set.md next to it; exits 1 if anything is off)
"""
import re
import sys
from fractions import Fraction
from pathlib import Path

SOURCE = Path(__file__).with_name("problem-set.md")

EXPECTED_SLOTS = [f"{lvl}.{i}" for lvl, n in ((1, 7), (2, 8), (3, 8), (4, 7)) for i in range(1, n + 1)]
UNIT_CHANGES = {("год", "хв"): 60, ("кг", "г"): 1000, ("км", "м"): 1000}
RATE_UNITS = {"км/год", "м/хв"}

NUM = r"\d+(?:,\d+)?"
NUMBER_RE = re.compile(NUM)
FRACTION_RE = re.compile(r"(\d+)/(\d+)")
ACTION_RE = re.compile(rf"^(\d+)\) (.+?) = ({NUM}) \(([^)]+)\) — (.+?)([;.])$")
CONVERSION_RE = re.compile(r"^(\d+) (\S+) = (\d+) (\S+)$")
ORDER_RE = re.compile(r"(\d+)\) is independent of (\d+)\)(?:–(\d+)\))?")
SIGN_SPLIT_RE = re.compile(r" ([+−·:]) ")
CODE_BLOCK_RE = re.compile(r"```text\n(.*?)```", re.S)


def value(s):
    return Fraction(s.replace(",", "."))


def fmt(v):
    """Canonical school form of a number: decimal comma, no trailing zeros."""
    if v.denominator == 1:
        return str(v.numerator)
    for places in range(1, 7):
        scaled = v * 10**places
        if scaled.denominator == 1:
            digits = f"{scaled.numerator:0{places + 1}d}"
            return digits[:-places] + "," + digits[-places:]
    return str(v)


def numbers_in(text):
    """Number values in a piece of text; a fraction m/n gives m and n."""
    found = [value(m) for pair in FRACTION_RE.findall(text) for m in pair]
    found += [value(m) for m in NUMBER_RE.findall(FRACTION_RE.sub(" ", text))]
    return found


def decimal_places(s):
    return len(s.split(",")[1]) if "," in s else 0


def check_plan(lines, base, errors, label, level):
    """Check one plan's solution lines. Returns (results, deps, used_base, last_result)."""
    results, deps, used_base = {}, {}, set()
    actions = []
    for line in lines:
        if not line.strip():
            continue
        conv = CONVERSION_RE.match(line)
        if conv:
            lhs, u1, rhs, u2 = conv.groups()
            factor = UNIT_CHANGES.get((u1, u2))
            if factor is None:
                errors.append(f"{label}: unit change «{line}» is not in the catalog")
            elif int(rhs) != int(lhs) * factor:
                errors.append(f"{label}: unit change «{line}» is wrong")
            if value(lhs) != 1 and value(lhs) not in base:
                errors.append(f"{label}: «{line}» converts a number that isn't in the text")
            used_base.add(value(lhs))
            base = base | {value(rhs)}
            continue
        act = ACTION_RE.match(line)
        if not act:
            errors.append(f"{label}: can't read the line «{line}»")
            continue
        n, expr, stated, unit, expl, end = act.groups()
        n = int(n)
        actions.append((n, end, line))
        if n != len(actions):
            errors.append(f"{label}: action {n}) is out of sequence")
        parts = SIGN_SPLIT_RE.split(expr)
        operands, signs = parts[0::2], set(parts[1::2])
        if len(signs) != 1:
            errors.append(f"{label} {n}): an action must have exactly one sign, got «{expr}»")
            continue
        sign = signs.pop()
        if any(not re.fullmatch(NUM, o) for o in operands):
            errors.append(f"{label} {n}): can't read the operands of «{expr}»")
            continue
        vals = [value(o) for o in operands]
        for o, v in zip(operands, vals):
            if fmt(v) != o:
                errors.append(f"{label} {n}): operand «{o}» should be written «{fmt(v)}»")
        if sign == "+":
            computed = sum(vals)
        elif sign == "−":
            computed = vals[0] - sum(vals[1:])
        elif sign == "·":
            computed = vals[0]
            for v in vals[1:]:
                computed *= v
        else:
            if len(vals) != 2:
                errors.append(f"{label} {n}): a division takes two numbers")
                continue
            computed = vals[0] / vals[1]
        if computed != value(stated):
            errors.append(f"{label} {n}): {expr} is {fmt(computed)}, not {stated}")
        elif fmt(computed) != stated:
            errors.append(f"{label} {n}): write the result as {fmt(computed)}, not {stated}")
        if computed <= 0:
            errors.append(f"{label} {n}): the result must be positive")
        if sign == ":" and computed.denominator != 1:
            errors.append(f"{label} {n}): the division {expr} isn't exact in whole numbers")
        has_decimal = any(v.denominator != 1 for v in vals + [computed])
        if has_decimal:
            if level < 3:
                errors.append(f"{label} {n}): decimals are only allowed in Levels 3-4")
            if sign not in "+−":
                errors.append(f"{label} {n}): decimals only with + and −, got {sign}")
            if unit in RATE_UNITS:
                errors.append(f"{label} {n}): decimals only in на and частини і ціле, not in a speed")
            if decimal_places(stated) > 2:
                errors.append(f"{label} {n}): more than two decimal places")
        deps[n] = set()
        for v in vals:
            if v in base:
                used_base.add(v)
            else:
                earlier = [k for k, r in results.items() if r == v]
                if earlier:
                    deps[n].add(max(earlier))
                else:
                    errors.append(f"{label} {n}): operand {fmt(v)} is not given, converted or found earlier")
        results[n] = computed
    for i, (n, end, line) in enumerate(actions):
        want = "." if i == len(actions) - 1 else ";"
        if end != want:
            errors.append(f"{label} {n}): should end with «{want}»")
    if not actions:
        errors.append(f"{label}: no actions found")
    last = results[actions[-1][0]] if actions else None
    return results, deps, used_base, last


def closure(deps, n):
    seen, todo = set(), list(deps.get(n, ()))
    while todo:
        k = todo.pop()
        if k not in seen:
            seen.add(k)
            todo.extend(deps.get(k, ()))
    return seen


def check_order(order_lines, deps, errors, label):
    for line in order_lines:
        for a, b, c in ORDER_RE.findall(line):
            a, b = int(a), int(b)
            c = int(c) if c else b
            for k in range(b, c + 1):
                if a in closure(deps, k) or k in closure(deps, a):
                    errors.append(f"{label}: «{a}) is independent of {k})» is false")


def check_problem(slot, body, errors):
    level = int(slot[0])
    text = " ".join(l[2:] for l in body.splitlines() if l.startswith("> "))
    if not text:
        errors.append(f"{slot}: no problem text")
        return
    text_strings = FRACTION_RE.sub(" ", text)
    for s in NUMBER_RE.findall(text_strings):
        if decimal_places(s) > 2:
            errors.append(f"{slot}: {s} has more than two decimal places")
    for m in re.finditer(rf"(?:\d+/\d+|{NUM})", text):
        if not re.match(r" [^\W\d_]", text[m.end():m.end() + 2]):
            errors.append(f"{slot}: «{m.group()}» in the text isn't followed by its unit or noun")
    if FRACTION_RE.search(text) and "Дріб від числа" not in body:
        errors.append(f"{slot}: a fraction in the text, but no дріб від числа relation")
    text_nums = set(numbers_in(text))
    if level < 3 and any(v.denominator != 1 for v in text_nums):
        errors.append(f"{slot}: decimals in the text of a Level {level} problem")

    # Split the body into code blocks, each with the Order lines that follow it.
    blocks = []
    for chunk in re.split(r"(```text\n.*?```)", body, flags=re.S):
        m = CODE_BLOCK_RE.fullmatch(chunk)
        if m:
            blocks.append([m.group(1).rstrip("\n").splitlines(), []])
        elif blocks:
            blocks[-1][1] += [l for l in chunk.splitlines() if l.startswith("Order:")]
    if not blocks:
        errors.append(f"{slot}: no write-up")
        return

    main_lines, main_order = blocks[0]
    if "Розв'язання" not in main_lines:
        errors.append(f"{slot}: the write-up has no «Розв'язання»")
        return
    split = main_lines.index("Розв'язання")
    record, solution = main_lines[:split], main_lines[split + 1:]
    answer_lines = [l for l in solution if l.startswith("Відповідь:")]
    if len(answer_lines) != 1 or solution[-1] != answer_lines[0]:
        errors.append(f"{slot}: the write-up must end with one «Відповідь:» line")
        return
    answer = answer_lines[0]
    solution = solution[:-1]

    if not any(l.strip() for l in record):
        errors.append(f"{slot}: no short record")
    conv_values = {value(m.group(3)) for l in solution if (m := CONVERSION_RE.match(l))}
    allowed_in_record = text_nums | conv_values | {Fraction(1)}
    for l in record:
        for v in numbers_in(l):
            if v not in allowed_in_record:
                errors.append(f"{slot}: short record line «{l}» has {fmt(v)}, which isn't in the text")

    results, deps, used, last = check_plan(solution, text_nums, errors, f"{slot} main", level)
    check_order(main_order, deps, errors, f"{slot} main")
    for v in text_nums - used - {Fraction(1)}:  # 1/4 of a number needs no "· 1"
        errors.append(f"{slot}: the text's {fmt(v)} is never used in the main plan")

    answer_nums = set(numbers_in(answer.split(":", 1)[1]))
    result_values = set(results.values())
    for v in answer_nums - result_values - text_nums:
        errors.append(f"{slot}: «Відповідь» has {fmt(v)}, which no action found")
    if last is not None and last not in answer_nums:
        errors.append(f"{slot}: «Відповідь» doesn't contain the final result {fmt(last)}")
    required = answer_nums & result_values

    for i, (alt_lines, alt_order) in enumerate(blocks[1:]):
        label = f"{slot} plan {chr(ord('B') + i)}"
        alt_results, alt_deps, _, alt_last = check_plan(alt_lines, text_nums, errors, label, level)
        check_order(alt_order, alt_deps, errors, label)
        missing = required - set(alt_results.values())
        if missing:
            errors.append(f"{label}: doesn't reach {', '.join(fmt(v) for v in sorted(missing))} from «Відповідь»")
        if alt_last is not None and alt_last not in answer_nums:
            errors.append(f"{label}: ends on {fmt(alt_last)}, which isn't in «Відповідь»")


def main():
    path = Path(sys.argv[1]) if len(sys.argv) > 1 else SOURCE
    source = path.read_text(encoding="utf-8")
    sections = re.split(r"^### ", source, flags=re.M)[1:]
    errors, slots = [], []
    plan_count = 0
    for section in sections:
        heading, _, body = section.partition("\n")
        slot = heading.split()[0]
        slots.append(slot)
        before = len(errors)
        check_problem(slot, body, errors)
        plans = len(CODE_BLOCK_RE.findall(body))
        plan_count += plans
        status = "ok" if len(errors) == before else "PROBLEMS"
        print(f"{slot:4} {heading[len(slot):].strip():45} plans: {plans}  {status}")
    if slots != EXPECTED_SLOTS:
        errors.append(f"slots are {slots}, expected 1.1-1.7, 2.1-2.8, 3.1-3.8, 4.1-4.7")
    print(f"\n{len(slots)} problems, {plan_count} plans checked.")
    if errors:
        print(f"\n{len(errors)} problem(s):")
        for e in errors:
            print(" -", e)
        sys.exit(1)
    print("All arithmetic and number rules check out.")


if __name__ == "__main__":
    main()
