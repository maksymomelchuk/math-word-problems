import { useLayoutEffect, type RefObject } from 'react'

export function prefersReducedMotion(): boolean {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
}

/** Scrolls an element just into view, below the top bar and above the dock (see `scroll-margin` in CSS). */
export function bringIntoView(element: Element | null, block: ScrollLogicalPosition = 'nearest'): void {
  element?.scrollIntoView({ block, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
}

/**
 * Keeps `--{name}` on the root set to an element's height, so the rest of the
 * layout (scroll margins, the sticky side column) can leave room for it.
 */
export function useHeightVariable(ref: RefObject<HTMLElement | null>, name: string): void {
  useLayoutEffect(() => {
    const element = ref.current
    if (!element) return
    const root = document.documentElement
    const set = () => root.style.setProperty(`--${name}`, `${Math.ceil(element.getBoundingClientRect().height)}px`)
    set()
    if (typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(set)
    observer.observe(element)
    return () => observer.disconnect()
  }, [ref, name])
}
