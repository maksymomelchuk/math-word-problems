# Should the PoC be a plain web page or an Expo app?

Labels: wayfinder:grilling
Status: closed
Assignee: maksymomelchuk
Blocked by: —
Parent: [Map](../MAP.md)

## Question

What should the PoC be built with? Constraints: it has to run on a mix of phones, tablets and laptops, show Ukrainian text, accept decimal-comma input (`12,442`), and may later grow into the mobile app.

Options to weigh:

- **A single static web page**: fastest to build, easy to throw away
- **A React/Vite web app**: more structure, still web-only
- **Expo** (web, iOS and Android from one codebase): reusable for the app, but slower to get started

Also decide:

- How she opens it on each device (hosted link, home-screen icon, local network)
- Whether her progress has to follow her between devices, or can stay on each device for the PoC

## Comments

### Resolution

**Answer.** A **React + Vite + TypeScript** web app, built to static files and hosted on **Netlify**.

- **What carries over to the app.** If the verdict is positive, only the problem data and the core loop carry over into the mobile app, and the PoC code is thrown away. So Expo is out: the native app is a separate effort, started only after a positive verdict, and the trial may change the loop anyway. Keep the problems and their guided-step data in a plain typed data file (JSON or TS), separate from the UI, so the app can reuse them as they are.
- **Stack.** React + Vite + TS, not a single static page. The guided flow, tappable problem text, SVG diagrams, keypad, saved progress and game layer hold too much state for vanilla JS in one file. No server is needed, so Next.js would be overkill. The app goes in a `poc/` folder in this repo.
- **How she opens it.** A hosted, unlisted link on Netlify, deployed with the CLI (`netlify deploy --prod --dir dist`), so only the built `dist/` is public. There's no git remote, so nothing in `.scratch/` is published. HTTPS comes for free. A web manifest lets her add it to the home screen of her phone or tablet so it opens full-screen; on the laptop it's a bookmark. No offline support. The other options:
  - GitHub Pages: rejected, because the free plan needs a public repo and `.scratch/` holds notes about her.
  - The home server: rejected, because it would need a public domain and TLS.
- **Progress.** Kept in `localStorage` on the device; nothing syncs between devices. She does the trial on **one main device**, so her progress and the fading schedule build up in one place. There are no accounts. If the trial ticket later wants her attempts logged, Netlify Functions can receive them without changing host.
- **Number input.** An on-screen keypad (digits, `,`, backspace, big Duolingo-style buttons) on every device, so the problem text and diagram stay visible on a phone. The laptop's physical keyboard also works, with a typed `.` shown as `,`. The phone's own decimal keyboard was rejected for two reasons:
  - Its separator follows the device's region setting, so an English region shows `.` instead of `,`.
  - It covers about half of a phone screen.
- **Stylus.** Web Pointer Events support a stylus (e.g. Apple Pencil), so tablet sketching is still open for [How does the guidance fade across the problem set?](08-guidance-fading.md).

**New ticket:** [Scaffold the PoC shell and deploy it to Netlify](10-scaffold-and-deploy.md).
