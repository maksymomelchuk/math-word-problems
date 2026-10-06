# Homework bot

She sends a photo of a word problem from her homework to a Telegram bot, with the problem's number as the caption (`6.2`). A few minutes later it's in her app, at the top of the home screen under «Домашнє завдання», with every step of the routine on screen.

## How it works

- **The bot** (`bot.ts`) asks Telegram for new messages (long polling), so the server needs no open port, domain or tunnel. It only listens to the Telegram users in `ALLOWED_USER_IDS`, and works through photos one at a time.
- **Each photo** (`job.ts`):
  1. The bot brings its own clone of this repo up to date with GitHub.
  2. It runs Claude Code headless with [`add-homework.md`](add-homework.md) as its instructions. Claude Code reads the photo, copies the problem word for word, and writes `poc/src/problems/homework/hw-<day>-<number>.ts`, modelled on `hw-6.2.ts`. It runs the tests, types and lint until they pass.
  3. The bot checks that only that file changed, runs the tests, lint and build again, and commits.
  4. It pushes to `main` on GitHub and deploys to Netlify.
- **Replies:** she gets a reply, and you get a note with the problem's answer. When the photo can't be used (blurry, wrong number, not a word problem), she's told why and what to send instead.
- **Contained:** Claude Code gets only the file tools and the three check commands, can read only the repo and that photo's folder, and holds no Netlify or GitHub credentials.

Each problem takes about 5–10 minutes and uses your Claude subscription. Problem 6.1 took 6 minutes, about $2 at API prices.

What it doesn't check: whether a hint is well put for her. The checker proves the arithmetic and the data's links, and the instructions set the bar for the rest, but nobody reviews it before she sees it. Read a few of the notes you get.

## Setting it up on Proxmox

### 1. A container

Create an unprivileged LXC from the Debian 12 template: 2 cores, 2 GB RAM, 12 GB disk, network by DHCP. Then, in its console as root:

```sh
apt update && apt install -y git curl ca-certificates
curl -fsSL https://deb.nodesource.com/setup_24.x | bash -
apt install -y nodejs
npm install -g netlify-cli
adduser --disabled-password --gecos '' homework
```

### 2. Claude Code, the clone and a deploy key

As the bot's user (`su - homework`):

```sh
curl -fsSL https://claude.ai/install.sh | bash
ssh-keygen -t ed25519 -N '' -f ~/.ssh/id_ed25519 -C homework-bot
cat ~/.ssh/id_ed25519.pub
```

Add that key on GitHub: the repo → Settings → Deploy keys → Add deploy key, and tick **Allow write access**. Then:

```sh
ssh -o StrictHostKeyChecking=accept-new -T git@github.com   # "You've successfully authenticated"
git clone git@github.com:maksymomelchuk/math-word-problems.git ~/math
cd ~/math
git config user.name "Homework bot"
git config user.email "homework-bot@users.noreply.github.com"
npm --prefix poc ci
```

### 3. The tokens

- **Telegram:** in Telegram, message @BotFather, send `/newbot`, and copy the token it gives.
- **Claude:** on your laptop (logged in to your subscription), run `claude setup-token` and copy the token.
- **Netlify:** app.netlify.com → User settings → Applications → Personal access tokens → New access token.

As root, create the settings file from [`env.example`](env.example), readable by root only, and fill it in. Leave `ALLOWED_USER_IDS` and `PARENT_CHAT_ID` empty for now, and set `DRY_RUN=1` for the first try:

```sh
install -m 600 /home/homework/math/homework-bot/env.example /etc/homework-bot.env
nano /etc/homework-bot.env
```

### 4. The service

As root:

```sh
cp /home/homework/math/homework-bot/homework-bot.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable --now homework-bot
```

### 5. Who may use it

Both of you send the bot any message. Its log shows each sender's ID:

```sh
journalctl -u homework-bot -n 20     # Ignored a message from Telegram user 123456789 (…)
```

Put both IDs in `ALLOWED_USER_IDS` (comma-separated) and yours in `PARENT_CHAT_ID`, then `systemctl restart homework-bot`.

### 6. A first try, then for real

With `DRY_RUN=1`, send a photo with its number. Follow along with `journalctl -fu homework-bot`. You get a note when it's done. In a dry run the problem is written and checked, but nothing is saved or published, and her app doesn't change.

Then set `DRY_RUN=0` and `systemctl restart homework-bot`. From now on each photo goes live.

## Day to day

- **You and the bot share `main` on GitHub.** `git pull` before you work on the app, and push when you're done: the bot builds on what's on GitHub.
- **After changing the bot's own code**, push it, then `systemctl restart homework-bot`. The bot's clone updates itself with every photo, but the running bot keeps its old code until it restarts.
- **When something fails**, your note has the end of the output. Claude Code's whole answer for each problem is in `~/.homework-bot/logs/` on the server.
- **To remove a problem**, delete its file in `poc/src/problems/homework/`, commit, push, and `cd poc && npm run deploy`.

## Trying it without Telegram

On any machine with Claude Code logged in, from a clone with nothing uncommitted:

```sh
node homework-bot/add.ts path/to/photo.jpg 6.1            # writes, checks and commits locally
node homework-bot/add.ts path/to/photo.jpg 6.1 --push --deploy
```

`npm test` and `npm run typecheck` in this folder check the bot itself (`npm install` first, for TypeScript). Node runs the `.ts` files as they are: Node 22.18 or later.
