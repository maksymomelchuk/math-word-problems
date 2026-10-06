import confetti from 'canvas-confetti'
import { useEffect, useRef } from 'react'

const COLOURS = ['#58cc02', '#1cb0f6', '#ff9600', '#ce82ff', '#ffc800', '#ff4b4b']

/**
 * A small burst of confetti from behind the bird, once, when the screen opens.
 * Drawn on its own canvas, so it stays with the bird as the page scrolls.
 * Nothing at all with reduced motion.
 */
export function Confetti({ size = 'small' }: { size?: 'small' | 'big' }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const fire = confetti.create(canvas, { resize: true, disableForReducedMotion: true })
    const burst = (angle: number, count: number) =>
      fire({ particleCount: count, angle, spread: 62, startVelocity: size === 'big' ? 34 : 26, gravity: 0.9, ticks: 150, scalar: 0.85, origin: { x: 0.5, y: 0.62 }, colors: COLOURS })
    void burst(90, size === 'big' ? 70 : 36)
    let late: number | undefined
    if (size === 'big') {
      late = window.setTimeout(() => {
        void burst(60, 34)
        void burst(120, 34)
      }, 260)
    }
    return () => {
      window.clearTimeout(late)
      fire.reset()
    }
  }, [size])

  return <canvas className="st-confetti" ref={ref} aria-hidden="true" />
}
