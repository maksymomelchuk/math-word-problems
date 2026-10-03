import { useEffect, useState } from 'react'

/**
 * The route in the URL hash: `#/problem/2.3` gives `['problem', '2.3']`.
 * A hash keeps the static Netlify site simple, and the phone's back gesture
 * goes back to the list instead of closing the app.
 */
export function useHashRoute(): string[] {
  const [hash, setHash] = useState(() => window.location.hash)
  useEffect(() => {
    const onChange = () => setHash(window.location.hash)
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return hash
    .replace(/^#\/?/, '')
    .split('/')
    .filter(Boolean)
    .map(decodeURIComponent)
}
