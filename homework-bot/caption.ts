/**
 * What her photo's caption (or her next message) says: which problems to add,
 * and how each is named and filed. Pure, no I/O.
 */

/** The problem numbers in a caption: «6.2» and «6,2» → 6.2; «№ 512» → 512; «6.1 і 6.2» → both. */
export function problemNumbers(text: string | undefined): string[] {
  const found = [...(text ?? '').matchAll(/(\d{1,4})(?:[.,/](\d{1,3}))?/g)].map(([, exercise, problem]) => (problem ? `${exercise}.${problem}` : exercise))
  return [...new Set(found)]
}

/** How her home screen names it: «Завдання 6, задача 2», or «Задача 512». The space before the last number doesn't break. */
export function homeworkTitle(number: string): string {
  const [exercise, problem] = number.split('.')
  return problem ? `Завдання ${exercise}, задача ${problem}` : `Задача ${exercise}`
}

/** The local calendar day of a time: `2026-10-06`. */
export function localDay(time: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${time.getFullYear()}-${pad(time.getMonth() + 1)}-${pad(time.getDate())}`
}

/** The id of a homework problem: `hw-2026-10-06-6.2`, then `-2`, `-3` … if that is taken. */
export function homeworkId(day: string, number: string, taken: ReadonlySet<string>): string {
  const base = `hw-${day}-${number}`
  let id = base
  for (let n = 2; taken.has(id); n++) id = `${base}-${n}`
  return id
}
