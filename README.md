# BP Training Question Collector

A short, mobile-friendly Next.js survey for collecting BP debate training questions before a Tuesday session. It uses the App Router, Supabase for storage, and is ready to deploy on Vercel.

Created by Zhihao.

## Supabase Table

In your Supabase project, open **SQL Editor** and run:

```sql
create extension if not exists "pgcrypto";

create table public.bp_training_responses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  experience text not null,
  diagnosis text[] not null,
  raw_question text not null,
  scenario text,
  final_question text not null,
  created_at timestamptz default now()
);

alter table public.bp_training_responses enable row level security;
```

No public insert policy is required because inserts happen only in the server-side API route with the service role key.

## Environment Variables

Create a local `.env.local` file:

```bash
cp .env.local.example .env.local
```

Fill in:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

On Vercel, add the same variables in **Project Settings > Environment Variables**.

Use the `service_role` key only for `SUPABASE_SERVICE_ROLE_KEY`. Never expose it in browser code.

## Run Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The admin page is at [http://localhost:3000/admin](http://localhost:3000/admin).

## Deploy on Vercel

1. Push this project to a GitHub repository.
2. Import the repository in Vercel.
3. Add `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.
4. Deploy.

## Notes

- `/api/submit` validates required fields and rejects more than 3 self-diagnosis items.
- Supabase writes happen only inside the server-side route.
- `/admin` lists responses in reverse chronological order and includes a copy button for ChatGPT summaries.
- The admin page is public by default. Add authentication before sharing the app outside your team.
