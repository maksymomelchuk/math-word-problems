import { GameHome } from '../game'

/**
 * Her home: the game layer's view of the problem set (`../game/`), with
 * «Для батьків» at the bottom. The parent's page is linked from there: the
 * home-screen app has no address bar, and its storage is its own, so the
 * records can only be read from inside it.
 */
export function Home() {
  return <GameHome />
}
