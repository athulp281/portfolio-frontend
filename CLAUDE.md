# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

`frontend/` is the React (Vite) client for an AI-native developer portfolio. The companion `../backend/` is a Node/Express service that exposes a small AI portfolio API:

- `POST /api/chat/ask` — RAG-grounded answer from "Athion AI" (gpt-4o-mini + local embeddings via `@xenova/transformers`)
- `GET /api/profile/get-personal-details` — static `PersonalData[]`
- `GET /api/profile/get-social-details` — static `SocialData[]`

All backend routes require an `x-api-key` header (`validateApiKey` middleware) and are rate-limited (30 req / 15 min). The backend wraps every response as `{ status, message, data, meta }` — see `src/services/axios.js` `unwrap()`.

The backend's `/chat/ask` is **not streamed on the wire** — it returns the full reply in one POST response. The chat store (`src/store/useChatStore.js`) simulates a token-by-token reveal client-side (`revealText`) to give a streaming feel. If the backend later exposes SSE, replace the body of `sendMessage` after `askQuestion` with an EventSource reader; the rest of the UI already treats `streaming: true` as a per-message flag.

## Commands

```bash
npm install          # first time
npm run dev          # Vite dev server on http://localhost:3000  (matches backend CORS allow-list)
npm run build        # production build → dist/
npm run preview      # serve the built bundle
npm run lint         # eslint
```

The dev port is **pinned to 3000 in `vite.config.js`** because `backend/app.js` hardcodes `cors({ origin: "http://localhost:3000" })`. Don't change one without the other.

Backend must be running on `http://localhost:5000` before the chat works. From repo root:

```bash
cd ../backend && npm run dev
```

## Required env

Copy `.env.example` → `.env` and fill in:

- `VITE_API_BASE_URL` — defaults to `http://localhost:5000/api`
- `VITE_API_KEY` — must equal `API_KEY` in `backend/.env` (the static `x-api-key` the backend validates)

The api key is sent on every request via the axios request interceptor (`src/services/axios.js`).

## Architecture (the parts that aren't obvious from the file tree)

**Single source of truth = Zustand stores**, organized like Redux slices under `src/store/`:

- `useAuthStore` — holds `apiKey` (seeded from `VITE_API_KEY`) and a placeholder `token`. Persisted to `localStorage` under `athion.auth`. The axios interceptor reads from this store at request time, so updating the key at runtime takes effect immediately without re-creating the axios instance.
- `useChatStore` — chat messages, send/cancel, status machine (`idle | sending | streaming | error`), client-side reveal animation. Holds an `AbortController` so the user can stop generation mid-stream.
- `useUIStore` — toasts and command palette open-state. The axios response interceptor pushes errors here, so feature code does not need its own try/catch for user feedback.
- `useProjectStore` — loads `personal` + `social` from the backend; `projects` is a **curated local list** (`FEATURED_PROJECTS`) because the backend's RAG corpus is unstructured text, not a project table. To update the landing showcase, edit that array.
- `useBootStore` — one-shot intro/boot gate keyed in `sessionStorage` under `athion.boot`. `finishBoot` flips `ready: true` so the intro animation only plays once per tab; `replayBoot` clears it for testing.

**API layer** (`src/services/`):
- `axios.js` exports `api` (single instance, baseURL from env) and `unwrap(res)` which pulls `res.data.data` out of the backend's envelope. Every service should call `unwrap` on success — components don't see the wrapper.
- Request interceptor injects `x-api-key` from the auth store on every call.
- Response interceptor pushes a toast and clears auth on 401/403, so feature code can stay focused on the happy path.

**Routing** (`src/routes/AppRoutes.jsx`) uses React Router v6 nested routes with two layouts:
- `PublicLayout` for the landing page (fixed glass header, footer, page-level Framer Motion enter/exit).
- `ChatLayout` for `/chat` (full-height shell, locked to `100dvh`).
Pages are lazy-loaded; `Loader` is the suspense fallback. `AnimatePresence mode="wait"` drives cinematic page transitions.

**3D & motion**:
- Hero uses `@react-three/fiber` + `drei` (`Float`, `MeshDistortMaterial`, `Stars`, `Environment`). Wrapped in `<Suspense>` and lazy-loaded so the first paint isn't blocked by Three.
- Project cards do mouse-tracked 3D tilt with `useMotionValue` + `useSpring` + `useTransform` (no extra lib).
- `ScrollProgress` is a top gradient bar driven by `useScroll`. `Cursor` is a custom pointer that grows on `[data-cursor="hover"]` elements (skip with `pointer: coarse`).

**Tailwind theme** (`tailwind.config.js`) defines the project's design tokens: `bg/ink/neon` palettes, `font-display = Space Grotesk`, custom keyframes (`float`, `shimmer`, `pulseRing`), and shadows (`neon`, `glass`). Reusable patterns live in `@layer components` in `src/index.css` — `glass`, `neon-border`, `text-gradient`, `grid-bg`. Prefer composing those over re-deriving the gradients inline.

**Code splitting**: `vite.config.js` `manualChunks` separates `three`, `framer-motion`, and the markdown stack into their own bundles so the chat page doesn't pay for the 3D scene and vice-versa.

## Conventions

- Path alias `@/` → `src/` (configured in both `vite.config.js` and `jsconfig.json`).
- Components are `.jsx`, named exports, PascalCase. Pages use `default` export so they can be `lazy()`-imported.
- Feature code lives in `src/features/<domain>/`; pages are thin compositions of feature components.
- Markdown rendering uses `react-markdown` + `remark-gfm` + Prism (`oneDark` theme). The `CodeBlock` component in `Markdown.jsx` adds a copy button — wire any new code-rendering needs through it.

## Gotchas

- The hero's R3F scene runs continuously; if you add another always-animating Canvas, profile mobile first.
- `useChatStore.sendMessage` early-returns if `status !== "idle"`. To queue messages you'd need a small queue around it — don't just remove the guard.
- The cursor and hero scene assume `pointer: fine` and a non-touch device respectively. Don't break that on mobile.
- Backend rate limit is 30 req / 15 min per IP — easy to trip during dev. The 429 will show as a toast.
