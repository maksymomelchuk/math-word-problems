import { useState } from 'react'
import type { SelfCheck } from '../../fading/paperChecks'
import type { StepId } from '../../problems/types'
import { useFlow } from '../context'

/** Her yes/no answers to self-checks beside a model, each recorded. */
export function useSelfChecks(checks: readonly SelfCheck[]) {
  const { log } = useFlow()
  const [answers, setAnswers] = useState<Record<string, boolean>>({})

  function answer(id: string, yes: boolean) {
    if (answers[id] === yes) return
    setAnswers((current) => ({ ...current, [id]: yes }))
    log({ kind: 'selfCheck', step: stepOfCheck(id), check: id, yes })
  }

  return {
    answers,
    answer,
    complete: checks.every((check) => answers[check.id] !== undefined),
    anyNo: checks.some((check) => answers[check.id] === false),
  }
}

function stepOfCheck(id: string): StepId {
  if (id === 'answer') return 'answer'
  if (id === 'diagram') return 'typeDiagram'
  return 'given'
}

