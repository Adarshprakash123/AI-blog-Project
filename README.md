# AI Editorial Blog Platform

This project now runs as a small full-stack setup with:

- `React + Vite` frontend
- `Express + PostgreSQL` backend
- `Redis` caching layer
- `OpenAI` blog generation
- `Docker Compose` for local orchestration

## Environment setup

Update these files before running the stack:

- `server/.env`
- `client/.env`

Important values:

- `OPENAI_API_KEY`: required for AI blog generation
- `IMAGEKIT_*`: required for image uploads
- `JWT_SECRET`: used for admin auth
- `ADMIN_EMAIL` and `ADMIN_PASSWORD`: admin login

## Run with Docker

```bash
docker compose up --build
```

App URLs:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`
- PostgreSQL: `postgresql://postgres:postgres@localhost:5432/ai_editorial`
- Redis: `redis://localhost:6379`

The server container runs:

- `prisma generate`
- `prisma db push`
- `npm run dev`

so the PostgreSQL schema is applied automatically during local startup.

## What Redis does here

Redis is used as a cache for:

- published blog listing
- single blog detail pages
- approved comments
- admin dashboards and admin listings

The cache is invalidated automatically whenever blogs or comments are created, updated, approved, or deleted.
