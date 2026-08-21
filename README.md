# StudyQuest

A gamified study tracker: focus timer → XP & badges → leaderboard → daily streaks.

## Stack

Vite + React + React Router + Tailwind CSS + lucide-react. All game state
(`XP`, streak, sessions, badges) is persisted to `localStorage` through a
single adapter in `src/lib/storage.js`, so swapping in Firebase/Supabase
later only means reimplementing that one file.

## Getting started

```bash
npm install
npm run dev
```

Open the printed `localhost` URL. Everything works immediately — no backend,
no `.env`, no signup.

## Building for deployment

```bash
npm run build
npm run preview   # sanity-check the production build locally
```

The app uses `HashRouter` (URLs look like `/#/study-room`) and a relative
Vite `base: './'`, so the contents of `dist/` can be dropped onto **any**
static host — `localhost`, a subpath, or a root custom domain like
`roronoa.site` — with zero server configuration. If you'd rather have clean
URLs (`/study-room` with no `#`) on a host that supports SPA rewrites
(Vercel, Netlify, etc.), switch `HashRouter` to `BrowserRouter` in
`src/App.jsx` — the included `vercel.json` and `public/_redirects` already
handle the rewrite on those platforms.

## Project structure

```
src/
  data/        static catalogs: subjects, badges, quests
  lib/         pure logic: storage adapter, XP engine, streak calc, audio engine, formatters
  context/     StudyContext — the single source of app state
  hooks/       useTimer (pomodoro/stopwatch engine), useLocalStorage
  components/  layout, common, timer, badges, leaderboard, quests
  pages/       Dashboard, StudyRoom, Badges, Leaderboard, Profile
```

## Game design notes

- **XP formula** — `src/lib/xpEngine.js` → `calculateSessionXP()`. Base rate
  is 2 XP/minute, multiplied by stacking bonuses for streak length (up to
  +50%), finishing a full Pomodoro phase (+15%), marathon sessions of 2h+
  (+10%), and off-hours focus before 6 AM / after 11 PM (+10%).
- **Badge unlocking** — `checkNewBadges()` in the same file evaluates every
  badge's declarative `criteria` (see `src/data/badges.js`) against the
  user's freshly-updated stats each time a session completes.
- **Streaks** — a day only counts once 25+ cumulative minutes are logged on
  it (`src/lib/streak.js`), matching the "burning fire" rule in the spec.
- **Boss & quests** — both are derived live from the session log instead of
  stored separately, so they can never drift out of sync
  (`src/data/quests.js`, used inside `StudyContext`).
- **Soundscapes** — generated procedurally with the Web Audio API
  (`src/lib/audioEngine.js`) so there are zero audio files to host or
  license.
