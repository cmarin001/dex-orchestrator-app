# dex-orchestrator-app

Standalone Vite, React, and TypeScript dashboard for the
[dex-orchestrator backend](https://github.com/cmarin001/dex-orchestrator).
The landing page opens in sample mode so you can inspect the chart, risk
settings, and history without credentials. Sample data is read-only and
does not call the backend. Select **Connect to backend** for worker data.

## Development

Use Node 20.19 or later. Run `npm install` and `npm run dev`. Vite proxies
development API requests to the Hono server at `localhost:8787` by default.
Start the API and worker from the backend repository.

## Vercel

Deploy this repository as Vite with `npm run build` and output directory
`dist`. Sample mode works with no variables. To connect worker data, set
`VITE_DASHBOARD_API_URL` to the HTTPS Hono API base or to the backend Vercel
function URL ending in `/api/dashboard-data`. Set `DASHBOARD_ORIGIN` on the
backend to the exact frontend origin, redeploy both projects, and enter the
dashboard bearer token when connecting.

The API URL is public build configuration. Keep provider keys, signing
keys, and the dashboard bearer token out of frontend project variables.
The browser holds the operator-entered token in memory for the session.
The frontend models the backend's [dashboard API v1 contract](https://github.com/cmarin001/dex-orchestrator/blob/dashboard-tradekeel/docs/dashboard-api.md).
