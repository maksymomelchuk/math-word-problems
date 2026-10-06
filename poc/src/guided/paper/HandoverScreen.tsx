import { HandoverDressing } from '../../game'
import { useFlow } from '../context'
import { Dock } from '../layout/Dock'
import { FlowLayout } from '../layout/FlowLayout'
import { ProblemText } from '../layout/ProblemText'
import './paper.css'

/**
 * The handover at a stage's first problem, before its first step: what she
 * now does in her notebook, dressed by the game layer.
 */
export function HandoverScreen() {
  const { problem, notebook, play, next } = useFlow()
  return (
    <FlowLayout
      text={<ProblemText parts={problem.text} questionFound={notebook.questionFound} />}
      task={<HandoverDressing problem={problem} play={play} />}
      dock={<Dock feedback={{ tone: 'none', message: '' }} label="Почати" onMain={next} quiet />}
    />
  )
}
