# Deployment Guide

1. Connect the GitHub repository to Render.
2. Use the included `render.yaml` blueprint.
3. Configure production environment variables:
   - `APP_ENV=production`
   - `VITE_API_BASE_URL=<backend-url>`
4. Deploy backend first, then frontend.
5. Verify:
   - Frontend URL loads.
   - Backend `/api/v1/health` returns healthy.
   - Swagger opens at `/docs`.
