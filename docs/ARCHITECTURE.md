# Architecture

The suite is intentionally split by responsibility.

## Frontend

- `src/core`: application shell, routes, SEO, URL state, export helpers.
- `src/engine`: TypeScript financial engine used by every calculator view.
- `src/calculators`: calculator definitions, forms, education blocks, and page composition.
- `src/components`: shared UI primitives, charts, result panels, toolbars.
- `src/theme`: TrueMFD brand tokens and Tailwind theme mapping.

## Backend

- `app/financial_engine`: canonical Python formulas.
- `app/api`: versioned REST routes.
- `app/schemas`: request and response validation.
- `app/services`: export and utility services.
- `app/tests`: API and formula regression tests.

Future authentication, CMS, analytics, AI APIs, and advisor tools can be added as separate modules without moving calculator business logic.
