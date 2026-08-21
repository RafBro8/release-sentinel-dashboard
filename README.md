# Release Sentinel Dashboard

React dashboard for the Release Sentinel API, showing release readiness, test execution health, and defect-driven quality gate status.

Backend API: [https://release-sentinel-api.onrender.com](https://release-sentinel-api.onrender.com)

API repository: [https://github.com/RafBro8/release-sentinel-api](https://github.com/RafBro8/release-sentinel-api)

## Purpose

This dashboard is the frontend companion to the Release Sentinel API portfolio project.
It gives reviewers a quick product-style view of the backend domain: releases, test runs, defects, and quality gate recommendations.

## Current Scope

Stage 13.6 adds dashboard CI validation:

- React + TypeScript + Vite
- Tailwind CSS build integration
- Multi-view dashboard navigation instead of anchor scrolling
- Dedicated views for readiness, demo workflow, API-backed workflow, and API status
- Live `/api/status` read from the deployed Spring Boot backend
- Guided demo button that creates release-readiness data through the API
- Real quality summary rendering from the deployed backend
- Playwright browser tests with mocked API responses for stable local and CI runs
- GitHub Actions workflow for lint, build, and Playwright validation

The demo workflow creates a project, environment, release, test case, test run, failed execution, critical defect, and then fetches the quality summary.

## Local Development

Install dependencies:

```bash
npm install
```

Run locally:

```bash
npm run dev
```

Build:

```bash
npm run build
```

Lint:

```bash
npm run lint
```

Run Playwright tests:

```bash
npm run test:e2e
```

Open Playwright UI mode:

```bash
npm run test:e2e:ui
```

Install the local Playwright browser once if needed:

```bash
npx playwright install chromium
```

## Continuous Integration

GitHub Actions validates the dashboard on pushes and pull requests to `main`.

The CI workflow runs:

- `npm ci`
- `npm run lint`
- `npm run build`
- `npx playwright install --with-deps chromium`
- `npm run test:e2e`

If Playwright fails in CI, the workflow uploads the HTML report as an artifact.

## Environment Configuration

The dashboard reads the backend URL from:

```text
VITE_RELEASE_SENTINEL_API_URL
```

Default:

```text
https://release-sentinel-api.onrender.com
```

Create `.env.local` for local overrides:

```bash
VITE_RELEASE_SENTINEL_API_URL=http://localhost:8080
```

## Backend CORS Requirement

The Release Sentinel API must allow the dashboard origin through:

```text
RELEASE_SENTINEL_CORS_ALLOWED_ORIGINS
```

Local dashboard origin:

```text
http://localhost:5173
```

When the dashboard is deployed to Vercel, add the Vercel URL to the same comma-separated backend environment variable.

## Planned Stages

| Stage | Focus | Outcome |
| --- | --- | --- |
| 13.1 | Frontend foundation | React dashboard shell and project setup |
| 13.2 | Live API integration | CORS-enabled status read |
| 13.3 | Demo workflow | Guided create release/test/defect flow |
| 13.4 | UI/UX refactor | Multi-view dashboard navigation |
| 13.5 | UI testing | Playwright smoke tests with mocked API routes |
| 13.6 | Dashboard CI | GitHub Actions build, lint, and Playwright checks |
| 13.7 | Vercel deployment | Public dashboard deployment |
