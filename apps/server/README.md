# WebSocket Server with OpenAI Integration

## Environment Variables

Set the following environment variables:

- `OPENAI_API_KEY` – Your OpenAI API key (required for AI features)
- `DATABASE_URL` – Supabase pooled connection string (used by Prisma client)
- `DIRECT_URL` – Direct Postgres connection string (used for migrations)

For local development, create a `.env` file in `apps/server` (or copy `.env.example`):

```
OPENAI_API_KEY=your-api-key-here
DATABASE_URL=postgresql://postgres.edbttiapccshyuminziq:YOUR_PASSWORD@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.edbttiapccshyuminziq:YOUR_PASSWORD@aws-1-eu-west-1.pooler.supabase.com:5432/postgres
```

The server loads `.env` automatically on startup via `import 'dotenv/config'`.

For production deployment (e.g., Render), add the environment variables in your deployment platform's dashboard.

## Prisma + Supabase

Prisma is configured in `prisma/schema.prisma` with a sample `Task` model. Helpful scripts:

- `pnpm prisma:generate` – regenerate the Prisma client
- `pnpm prisma:migrate` – run `prisma migrate dev` to apply schema changes
- `pnpm prisma:studio` – open Prisma Studio for inspecting the database

After setting real Supabase credentials, run:

```
pnpm prisma:generate
pnpm prisma:migrate --name init
```

The repository already contains the SQL for the initial migration (`prisma/migrations/20251115_init/migration.sql`). Apply it to Supabase once valid credentials are available.

## Features

- WebSocket server for real-time messaging
- Image and text message broadcasting
- OpenAI GPT-4o-mini integration for automatic responses to questions (messages ending with `?`)

## Usage

The server automatically processes text messages that end with `?` and generates AI responses using GPT-4o-mini.

