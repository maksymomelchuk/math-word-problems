import { useFlow } from '../context'
import { planLines } from '../flow'
import { Dock } from '../layout/Dock'
import { FlowLayout } from '../layout/FlowLayout'
import { ProblemText } from '../layout/ProblemText'
import { TaskHeading } from '../layout/controls'

/** The closing Розбір: the full write-up stays in the notebook; here are the checks, the key idea and the other plan. */
export function ReviewScreen() {
  const { problem, notebook, finish } = useFlow()
  const followed = notebook.plan?.plan ?? 0
  const others = problem.writeUp.plans.map((_, i) => i).filter((i) => i !== followed)

  return (
    <FlowLayout
      text={<ProblemText parts={problem.text} questionFound={notebook.questionFound} />}
      task={
        <>
          <TaskHeading title="Розбір" />
          <p className="task-prompt">Запис у зошиті готовий: короткий запис, розв'язання по діях з поясненнями і відповідь повним реченням.</p>
          <p className="eyebrow">Перевірка</p>
          <ul className="checks">
            {problem.review.checks.map((check) => (
              <li key={check}>
                <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m5 12.5 4.5 4.5L19 7.5" />
                </svg>
                <span>{check}</span>
              </li>
            ))}
          </ul>
          <div className="key-idea">
            <p className="eyebrow">Головне</p>
            <p>{problem.review.keyIdea}</p>
          </div>
          {others.map((plan) => (
            <div key={plan} className="other-plan">
              <p className="eyebrow">Інший правильний план</p>
              <div className="paper">
                {planLines(problem, plan).map((line) => (
                  <p key={line} className="paper-line">
                    {line}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </>
      }
      dock={<Dock feedback={{ tone: 'ok', message: "Задачу розв'язано!" }} label="Готово" onMain={finish} />}
    />
  )
}
