# AI Editorial Blog Platform

This project now runs as a small full-stack setup with:

- `React + Vite` frontend
- `Express + PostgreSQL` backend
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

## Run with Docker

```bash
docker compose up --build
```

App URLs:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`
- PostgreSQL: `postgresql://postgres:postgres@localhost:5432/ai_editorial`

The server container runs:

- `prisma generate`
- `prisma db push`
- `npm run dev`

so the PostgreSQL schema is applied automatically during local startup.
