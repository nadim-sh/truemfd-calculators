# calculators@TrueMFD

A modular calculator suite for TrueMFD wealth advisory experiences. The repository is structured as a production baseline with a React/Vite frontend and FastAPI backend sharing one financial model.

## Applications

- `apps/frontend`: React, TypeScript, Vite, TailwindCSS, React Router, React Hook Form, Recharts, Framer Motion.
- `apps/backend`: FastAPI, Pydantic, NumPy-ready financial APIs and Swagger documentation.

## Run Locally

```powershell
pnpm install
pnpm --filter @truemfd/frontend dev
pnpm --filter @truemfd/backend dev
```

Frontend: `http://localhost:5173`
Backend: `http://localhost:8000`
Swagger: `http://localhost:8000/docs`

## Calculator Coverage

Standard SIP, Step Up SIP, Lumpsum, Goal SIP, SWP, PPF, SIP vs Lumpsum, XIRR, and IRR are implemented through shared calculation modules. Each calculator supports validation, charts, URL state, copy/share/print/reset actions, export actions, educational guidance, and API parity.

## Deployment

`render.yaml` defines a Render web service for the FastAPI backend and a static site for the Vite frontend.

See `docs/` for architecture, formula, API, deployment, QA, and roadmap notes.
