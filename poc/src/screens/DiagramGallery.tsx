import { useState } from 'react'
import { Diagrams } from '../diagrams/Diagrams'
import { findProblem } from '../problems/problems'
import type { DiagramData } from '../problems/types'
import { Chip } from '../guided/layout/controls'
import './screens.css'

/**
 * Samples for the parent and for whoever writes the other problems' data,
 * at `#/diagrams`: every diagram family, the shared chain diagram and a
 * stacked pair, each one tappable. The 1.3, 1.4, 2.4 and 2.5 samples are
 * sketches from problem-set.md, not problem data.
 */
const SAMPLES: { title: string; note: string; data: DiagramData }[] = [
  {
    title: '4.7 Трикутник: відрізки, спільна схема ланцюжка',
    note: 'Три відрізки від одного лівого краю, у масштабі, і фігурна дужка праворуч для периметра.',
    data: findProblem('4.7')!.steps.typeDiagram!.diagram,
  },
  {
    title: '2.3 Хлопчик: таблиця трьох величин',
    note: "Один рядок на кожен зв'язок.",
    data: findProblem('2.3')!.steps.typeDiagram!.diagram,
  },
  {
    title: '1.3 Вареники: у … разів',
    note: 'Більший відрізок — це три копії меншого.',
    data: {
      title: '',
      prompt: '',
      diagrams: [
        {
          family: 'bars',
          rows: [
            { label: 'Злата', pieces: [{ length: 16, label: { slot: 'zlata' } }] },
            { label: 'Бабуся', pieces: [{ length: 16 }, { length: 16 }, { length: 16 }], end: '?' },
          ],
        },
      ],
      slots: { zlata: '16' },
      chips: ['16', '3'],
      hint: '',
    },
  },
  {
    title: '1.4 Книжка: частини і ціле',
    note: 'Один відрізок, поділений на частини; ціле — під дужкою знизу.',
    data: {
      title: '',
      prompt: '',
      diagrams: [
        {
          family: 'parts',
          pieces: [{ length: 75 }, { length: 57 }],
          above: [
            { from: 0, label: { slot: 'read' }, caption: 'прочитала' },
            { from: 1, label: '?', caption: 'залишилося' },
          ],
          whole: { label: { slot: 'all' }, caption: 'усього' },
        },
      ],
      slots: { read: '75 с.', all: '132 с.' },
      chips: ['132 с.', '75 с.'],
      hint: '',
    },
  },
  {
    title: '2.5 Стрічка: дріб від числа',
    note: 'Ціле поділене на 8 рівних частин, 5 зафарбовано; над кількома частинами — своя дужка.',
    data: {
      title: '',
      prompt: '',
      diagrams: [
        {
          family: 'parts',
          pieces: Array.from({ length: 8 }, (_, i) => (i < 5 ? { length: 4, marked: true as const } : { length: 4 })),
          above: [
            { from: 0, to: 4, label: '?', caption: 'на банти' },
            { from: 5, to: 7, label: '?', caption: 'залишилося' },
          ],
          whole: { label: { slot: 'all' }, caption: 'було' },
        },
      ],
      slots: { all: '32 м' },
      chips: ['32 м', '5/8'],
      hint: '',
    },
  },
  {
    title: '2.4 Сік і решта: дві схеми одна під одною',
    note: 'Задача змішує родини схем, тож кожна має свою схему з підписом; місця і числа спільні.',
    data: {
      title: '',
      prompt: '',
      diagrams: [
        {
          family: 'table',
          caption: 'Покупка',
          columns: ['Ціна', 'Кількість', 'Вартість'],
          rows: [{ label: 'Сік', cells: [{ slot: 'price' }, { slot: 'count' }, '?'] }],
        },
        {
          family: 'parts',
          caption: 'Решта',
          pieces: [{ length: 114 }, { length: 86 }],
          above: [
            { from: 0, label: '?', caption: 'вартість' },
            { from: 1, label: '?', caption: 'решта' },
          ],
          whole: { label: { slot: 'paid' }, caption: 'заплатив' },
        },
      ],
      slots: { price: '38 грн', count: '3 пак.', paid: '200 грн' },
      chips: ['38 грн', '3 пак.', '200 грн'],
      hint: '',
    },
  },
]

function Sample({ title, note, data }: (typeof SAMPLES)[number]) {
  const order = Object.keys(data.slots)
  const firstSlot = order[0] ?? null
  const [fill, setFill] = useState<Record<string, string>>({})
  const [selected, setSelected] = useState<string | null>(firstSlot)

  function place(chip: string) {
    if (!selected) return
    const filled = { ...fill, [selected]: chip }
    setFill(filled)
    setSelected(order.find((slot) => !filled[slot]) ?? selected)
  }

  function clear() {
    setFill({})
    setSelected(firstSlot)
  }

  return (
    <section className="sample">
      <h2 className="record-title">{title}</h2>
      <p className="page-lead">{note}</p>
      <div className="diagram-card">
        <Diagrams diagrams={data.diagrams} fill={fill} control={{ selected, wrong: [], right: false, onSlot: setSelected }} />
      </div>
      <div className="chips">
        {data.chips.map((chip) => (
          <Chip key={chip} onClick={() => place(chip)}>
            {chip}
          </Chip>
        ))}
        <Chip kind="tool" onClick={() => setFill({ ...data.slots })}>
          Заповнити
        </Chip>
        <Chip kind="tool" onClick={clear}>
          Очистити
        </Chip>
      </div>
    </section>
  )
}

export function DiagramGallery() {
  return (
    <div className="page page--parent">
      <header className="page-header">
        <a className="page-back" href="#/parent">
          <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.5 6 8.5 12l6 6" />
          </svg>
          Для батьків
        </a>
        <h1 className="page-title">Зразки схем</h1>
        <p className="page-lead">Торкнись порожнього місця, потім числа.</p>
      </header>
      <main>
        {SAMPLES.map((sample) => (
          <Sample key={sample.title} {...sample} />
        ))}
        <div className="parent-actions">
          <a className="text-link" href="#/parent">
            Для батьків
          </a>
          <a className="text-link" href="#/">
            До задач
          </a>
        </div>
      </main>
    </div>
  )
}
