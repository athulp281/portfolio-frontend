<<<<<<< HEAD
# Athion · Frontend

AI-native developer portfolio for Athul P. React (Vite) + Tailwind + Zustand + Framer Motion + React Three Fiber, talking to the Express/RAG backend in `../backend`.

## Quick start

```bash
cp .env.example .env
# fill VITE_API_KEY with the same value as backend/.env API_KEY

npm install
npm run dev          # http://localhost:3000
```

Backend must be running:

```bash
cd ../backend
npm install
npm run dev          # http://localhost:5000
```

## Scripts

| command           | what it does                          |
| ----------------- | ------------------------------------- |
| `npm run dev`     | Vite dev server (port 3000, fixed)    |
| `npm run build`   | production build                      |
| `npm run preview` | serve the production build locally    |
| `npm run lint`    | ESLint                                |

## Routes

- `/` — landing (hero 3D scene, intro, skills, projects, CTA)
- `/chat` — Athion AI chat (markdown, code blocks, typed-out reveal)

## Folder map

```
src/
├── assets/
├── components/      # ui primitives, three/, common/
├── features/        # chat/, portfolio/, auth/
├── hooks/
├── layouts/         # PublicLayout, ChatLayout
├── pages/           # LandingPage, ChatPage
├── routes/          # AppRoutes
├── services/        # axios instance + endpoint wrappers
├── store/           # zustand slices
└── utils/           # cn, motion variants
```

See `CLAUDE.md` for the deeper architecture notes.
=======
# portfolio-frontend
>>>>>>> 87b1e06b0159e4a1eded2ec4e9bd429821e51c1b
