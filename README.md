# Release Sentinel Dashboard

React dashboard for the Release Sentinel API, showing release readiness, test execution health, and defect-driven quality gate status.

Backend API: [https://release-sentinel-api.onrender.com](https://release-sentinel-api.onrender.com)

API repository: [https://github.com/RafBro8/release-sentinel-api](https://github.com/RafBro8/release-sentinel-api)

## Purpose

This dashboard is the frontend companion to the Release Sentinel API portfolio project.
It gives reviewers a quick product-style view of the backend domain: releases, test runs, defects, and quality gate recommendations.

## Current Scope

Stage 13.2 adds the first live browser integration:

- React + TypeScript + Vite
- Tailwind CSS build integration
- Release readiness dashboard shell
- Portfolio-friendly API links
- Render API base URL configuration
- Live `/api/status` read from the deployed Spring Boot backend
- API connection state for loading, online, and offline cases

The release quality cards still use representative dashboard data.
The next product increment can add live quality-summary reads and a guided demo workflow.

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
| 13.4 | UI testing | Playwright smoke tests |
| 13.5 | Vercel deployment | Public dashboard deployment |
