# Scaffold the PoC shell and deploy it to Netlify

Labels: wayfinder:task
Status: open
Assignee:
Blocked by: [Should the PoC be a plain web page or an Expo app?](03-poc-tech.md)
Parent: [Map](../MAP.md)

## Question

Stand up the empty PoC shell with the stack chosen in [Should the PoC be a plain web page or an Expo app?](03-poc-tech.md), and get a link she can open on her main device. There's no problem content or guided flow yet. The shell gives the build tickets a base, and gives the prototype tickets a link to show her on the real device.

- [ ] React + Vite + TS app in `poc/`, with `lang="uk"` and a font that renders Cyrillic well
- [ ] Web manifest and icon, so it can be added to the home screen and opens full-screen
- [ ] On-screen keypad component: digits, `,` and backspace, with big touch targets. It also accepts the laptop's physical keys, showing a typed `.` as `,`
- [ ] Decimal helpers that parse `12,442` and compare answers exactly, with no floating-point error (e.g. `0,1 + 0,2` must equal `0,3`)
- [ ] A small `localStorage` progress module (save, load, reset) that later tickets fill in
- [ ] One placeholder screen showing the keypad, so it can be tried on the device
- [ ] Deployed with `netlify deploy --prod --dir dist`. **HITL step**: the parent runs `netlify login` once (in Claude Code: `! netlify login`)
- [ ] Parent names her main device, adds the link to its home screen, and confirms the keypad works there

Resolved when the link opens on her main device. The resolution records the Netlify URL, the site name, which device is her main device, and the deploy command.

## Comments

### Note (2026-10-03)

The `netlify login` HITL step is done. The parent logged in with `npx netlify-cli login` (netlify-cli 27.10.2); the CLI is not installed globally, so use `npx netlify-cli deploy --prod --dir dist` to deploy.
