/**
 * Leaving a problem goes back in history when the list is the page before it,
 * so the phone's back gesture and the close button agree. Opened any other
 * way (a reload, a bookmark), it replaces the problem with the list.
 */
let cameFromList = false

/** Click handler for links from the list into a problem. */
export function openProblem(): void {
  cameFromList = true
}

export function backToList(): void {
  if (cameFromList) {
    cameFromList = false
    window.history.back()
  } else {
    window.location.replace('#/')
  }
}
