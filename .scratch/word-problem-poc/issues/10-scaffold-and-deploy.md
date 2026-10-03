# Scaffold the PoC shell and deploy it to Netlify

Labels: wayfinder:task
Status: closed
Assignee: maksymomelchuk
Blocked by: [Should the PoC be a plain web page or an Expo app?](03-poc-tech.md)
Parent: [Map](../MAP.md)

## Question

Stand up the empty PoC shell with the stack chosen in [Should the PoC be a plain web page or an Expo app?](03-poc-tech.md), and get a link she can open on her main device. There's no problem content or guided flow yet. The shell gives the build tickets a base, and gives the prototype tickets a link to show her on the real device.

- [x] React + Vite + TS app in `poc/`, with `lang="uk"` and a font that renders Cyrillic well
- [x] Web manifest and icon, so it can be added to the home screen and opens full-screen
- [x] On-screen keypad component: digits, `,` and backspace, with big touch targets. It also accepts the laptop's physical keys, showing a typed `.` as `,`
- [x] Decimal helpers that parse `12,442` and compare answers exactly, with no floating-point error (e.g. `0,1 + 0,2` must equal `0,3`)
- [x] A small `localStorage` progress module (save, load, reset) that later tickets fill in
- [x] One placeholder screen showing the keypad, so it can be tried on the device
- [x] Deployed with `netlify deploy --prod --dir dist`. **HITL step**: the parent runs `netlify login` once (in Claude Code: `! netlify login`)
- [x] Parent names her main device, adds the link to its home screen, and confirms the keypad works there

Resolved when the link opens on her main device. The resolution records the Netlify URL, the site name, which device is her main device, and the deploy command.

## Comments

### Note (2026-10-03)

The `netlify login` HITL step is done. The parent logged in with `npx netlify-cli login` (netlify-cli 27.10.2); the CLI is not installed globally, so use `npx netlify-cli deploy --prod --dir dist` to deploy.

### Progress (2026-10-03)

The AFK part is done: the shell is built and live. The last item, the device check, is the parent's.

**Live link:** https://reliable-macaron-77e751.netlify.app

- **Netlify site.** Name `reliable-macaron-77e751` (random, chosen by Netlify). Site ID `52f3b429-f358-48d2-aedd-a87116e8a66c`. Team `maksymomelchuk`. Admin: https://app.netlify.com/projects/reliable-macaron-77e751
- **Deploy command.** `cd poc && npm run deploy`. It runs the unit tests, builds, then `npx netlify-cli deploy --prod --dir dist --site 52f3b429-f358-48d2-aedd-a87116e8a66c`. Only `dist/` is published. Every page is sent with `X-Robots-Tag: noindex`.
- **Netlify badge turned off.** Since 2026-08-19, new Free-plan sites show a "Powered by Netlify" badge in the bottom-right corner. It covered the «Перевірити» button and linked out to Netlify's site builder. It's turned off for this site through the API (`built_with_badge_enabled: false`), which matches Project configuration → General → Powered by Netlify badge. Netlify allows that on the Free plan.
- **What's in `poc/`:**
  - `src/components/keypad/`: the `Keypad` component and its input rules. One comma at most, a leading comma becomes `0,`, and backspace works. On a laptop the physical digits, `.`, `,`, Backspace and Enter work too, and a typed `.` shows as `,`. Keys are 56–72 px tall, and double-tapping them doesn't zoom.
  - `src/lib/decimal.ts`: exact BigInt decimals. `parseDecimal`, `formatDecimal`, `add`, `subtract`, `multiply`, `divide` (null if the result doesn't terminate), `compare`, `equals`, and `answersMatch(input, expected)`, under which `12,40` matches `12,4` and `0,1 + 0,2` equals `0,3`.
  - `src/lib/progress.ts`: `loadProgress`, `saveProgress` and `resetProgress` for a versioned `localStorage` record. `ProblemRecord` is a placeholder for the guided-flow ticket to define.
  - `src/App.tsx`: the placeholder screen, «Спробуй клавіатуру: 0,1 + 0,2 = ?». It has «Перевірити», answers «Правильно!» or «Не зовсім. Спробуй ще раз.», and offers «Ще раз» after a right answer.
  - The text font is Nunito, self-hosted with its Cyrillic subset. Design tokens are in `src/index.css`, in the guided-flow mock's colours. The web manifest names the app «Тренажер задач», «Задачі» on the home screen, opens it `standalone`, and has a 180/192/512 px icon (a "?" on a squared notebook page). The icon's source art is `icon-source/icon.svg`.
  - 21 unit tests (`npm test`), TypeScript and lint all pass. The build targets Safari 14+ and Chrome 87+, so older iPads work too.
- **Verified on the live URL** in headless WebKit (iPhone 13 emulation) and Chromium (laptop, tablet, phone in landscape). The page is `lang="uk"`, the Cyrillic Nunito face loads, the wrong and right answer flows work by tapping and by keyboard, there are no console errors, and Chrome reports the manifest installable with no errors.
- **A note for the trial.** On iPhone and iPad, a home-screen app keeps its own storage, separate from Safari. If she sometimes opens the link in Safari instead of from the icon, her progress will seem to be missing. Safari can also clear a site's storage after 7 days without use, while home-screen apps are exempt. So she should always open it from the icon.

**Parent's checklist:**

1. On her main device, open https://reliable-macaron-77e751.netlify.app
2. Add it to the home screen:
   - iPhone or iPad (Safari): Share → "Add to Home Screen" («На екран "Додому"»).
   - Android (Chrome): ⋮ → "Add to Home screen" or "Install app".
   - Laptop: bookmark it.
3. Open it from the new «Задачі» icon. It should open full-screen, with no address bar.
4. Try the keypad:
   1. Tap `0`, `,`, `2`, then «Перевірити». You should see red «Не зовсім. Спробуй ще раз.».
   2. Tap ⌫, then `3`, then «Перевірити». You should see green «Правильно!».
   3. Check that the keys are easy to hit and that fast taps don't zoom the page.
   4. On a laptop, also type `0.3` and press Enter.
5. Report the device's type, model and OS version (e.g. "iPad 9th gen, iPadOS 17"), and anything that looks wrong: letters, the comma, the layout.

### Resolution

The shell is live and works on her main device. The parent added it to the home screen and confirmed the keypad works there on 2026-10-03.

- **Her main device**: an iPad Air on iPadOS 18, opened from the «Задачі» home-screen icon.
- **URL**: https://reliable-macaron-77e751.netlify.app (site `reliable-macaron-77e751`, ID `52f3b429-f358-48d2-aedd-a87116e8a66c`, team `maksymomelchuk`). The name is random and the pages are `noindex`. The "Powered by Netlify" badge is turned off for the site.
- **Deploy command**: `cd poc && npm run deploy` (tests, build, then `npx netlify-cli deploy --prod --dir dist --site <id>`).
- **For the build tickets**: the app is in `poc/`. Use the `Keypad` component, `src/lib/decimal.ts` (`answersMatch`) and `src/lib/progress.ts` (`ProblemRecord` is still a placeholder). The progress comment above has the details.

**Passed to existing tickets:** [Build the guided-problem flow](12-build-guided-flow.md) and [Build the paper steps and the fading schedule](14-build-fading.md): her main device is an iPad Air on iPadOS 18.

**Map fog:** on iPad, a home-screen app keeps its own storage, separate from Safari, so she should always open it from the icon (added to Running the trial).
