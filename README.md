# Financial dashboard app

_Automatically synced with your [v0.app](https://v0.app) deployments_

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/chathura-madhushankas-projects/v0-financial-dashboard-app)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/projects/38S3mLXhM9W)

## Overview

This repository will stay in sync with your deployed chats on [v0.app](https://v0.app).
Any changes you make to your deployed app will be automatically pushed to this repository from [v0.app](https://v0.app).

## Deployment

Your project is live at:

**[https://vercel.com/chathura-madhushankas-projects/v0-financial-dashboard-app](https://vercel.com/chathura-madhushankas-projects/v0-financial-dashboard-app)**

## Build your app

Continue building your app on:

**[https://v0.app/chat/projects/38S3mLXhM9W](https://v0.app/chat/projects/38S3mLXhM9W)**

## How It Works

1. Create and modify your project using [v0.app](https://v0.app)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository

## What's new (Savings page revamp)

The dashboard's Savings page was recently revamped to provide richer analytics and a better user experience. Highlights:

- Smart goal prioritization (urgent / high / medium / low) based on progress and target dates
- Completion forecasting for each active goal (months to complete)
- Improved charts: savings progress trend, category distribution, and goal forecast
- Privacy mode to obfuscate monetary values in the UI
- Faster, more informative summary cards (Total Saved, Monthly Velocity, Remaining Amount, etc.)

How to test locally:

1. Ensure dependencies are installed:

```bash
npm install
```

2. Create `.env.local` with a valid `DATABASE_URL` (Neon/Postgres) — the app will fail to build API-related routes without it.

3. Start the dev server and open http://localhost:3000:

```bash
npm run dev
```

4. Visit Dashboard → Savings to view the new UI. Use the Privacy Mode toggle in the header to hide/show monetary amounts.

Build notes:

- Run `npm run build` to build the app for production. The project requires `DATABASE_URL` during build if API routes depend on DB access.
- Run `npm run lint` after your first install to initialize ESLint config (this may take a couple minutes on first run).

If you want screenshots or a short demo GIF added to the README, tell me which views to capture and I will add them.
