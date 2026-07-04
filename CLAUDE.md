# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running the site

Development is buildless — serve the project root with any static file server and open it in a browser; every `.jsx` file is transpiled in the browser (Babel Standalone) on each reload:

```bash
npm run dev   # esbuild static server on http://localhost:8000 (npm start works too)
```

Opening `index.html` via `file://` does not work: the JSX files are fetched at runtime and blocked by CORS. There is no lint and no tests.

Production is a compiled build (`scripts/build.mjs`, run via `npm run build`): esbuild compiles each JSX file to plain JS into `dist/`, rewrites `index.html` to load production React from the CDN (dev builds + Babel Standalone are dev-only), and copies the CSS/assets. Netlify runs this build on every push to `main` and publishes `dist/` (see `netlify.toml`). The compiled files are still classic scripts in the same order — the global-scope architecture below applies to both modes. If you add/remove a JSX file or reorder script tags in `index.html`, the build script's tag-count assertion will catch a mismatch at build time.

## Architecture

React 18 (UMD) and Babel Standalone load from CDNs in `index.html`; each `.jsx` file is a `<script type="text/babel">` tag transpiled in the browser. There is no module system:

- **No imports/exports anywhere.** Files share top-level declarations through the global scope. `components/hooks.jsx` destructures React hooks (`useState`, `useEffect`, …) once for all files; `app.jsx` exposes `useHashRoute`/`navigate` via `Object.assign(window, …)`.
- **Script order in `index.html` is the dependency graph.** Scripts load in order: `tweaks-panel.jsx` → `components/hooks.jsx` → motion files → section components → `app.jsx` last. A new component needs both its file in `components/` and a script tag in `index.html` placed before `app.jsx` and after anything it uses.
- **`app.jsx` is the composition root**: it defines the hash router, the palette system, and the `App` component that switches pages on route.

### Routing

Hash-based: `#/experience`, `#/projects`, `#/projects/<slug>`, `#/tools`, `#/github`, `#/resume`, `#/contact`, `#/about`; anything else renders the terminal-style `NotFound`. New top-level routes must be added to both the `switch` in `App` and `KNOWN_ROOTS` in `app.jsx`. Use `navigate(id)` (not raw hash assignment) so the route-exit animation plays.

### Theming and tweaks

Colors are CSS custom properties (`--bg`, `--ink`, `--clay`, …) set at runtime by `applyPalette` in `app.jsx` from the `PALETTES` table — stylesheets never hardcode palette colors. The floating tweaks panel (`tweaks-panel.jsx`) persists settings and feeds them through the `useTweaks` hook; defaults live in `TWEAK_DEFAULTS` in `app.jsx` between `/*EDITMODE-BEGIN*/ … /*EDITMODE-END*/` markers — keep those markers intact.

### Motion

Lenis (smooth scroll) and lottie-web load from CDNs. Entrance reveals use IntersectionObserver (`useReveal` in `components/hooks.jsx`, plus `components/motion-fx.jsx`) — there is intentionally no Motion/Framer dependency. Motion code respects `prefers-reduced-motion`; keep that behavior when adding animation.

### Preloader contract

The preloader is inline vanilla JS in `index.html`. It polls for `window.__appReady`, which `App` sets after first render. If `app.jsx`'s boot path changes, that signal must still fire or the preloader stays up until its 6s safety timeout.

### CSS

Styles are hand-written CSS split by concern (`styles.css` base, then `styles-pages/-projects/-about`, `styles-lighten.css` overrides, `styles-extras.css`, `mobile.css`, `motion.css`), loaded in that order in `index.html` — later files intentionally override earlier ones.

### SidClaw chatbot backend

The chatbot (`components/chatbot.jsx`) POSTs to `/.netlify/functions/chat` (`netlify/functions/chat.mjs`), which holds the system prompt (dossier + scope guardrails) and calls the Claude API (`claude-haiku-4-5`) with the `ANTHROPIC_API_KEY` set in Netlify's environment variables — the key is never in the repo or client code. The client sends only the chat history plus a live-context string (GitHub activity + project catalog), which the function wraps as untrusted data. Locally there is no functions runtime (`npm run dev` is a static server), so SidClaw shows its error fallback — test it on a deploy.

## Repo notes

`uploads/` and `.thumbnail` are untracked scratch artifacts (gitignored); nothing in the site references them.
