# Bodana Digital — Full AI Marketing Platform

Landing page + **AI Studio Dashboard** with prompt-driven tasks, Instagram preview, and end-to-end account connect.

## Features (A to Z)

| Feature | Status |
|---|---|
| AI prompt → auto task start | ✅ |
| Caption & hashtag generation | ✅ |
| Instagram live preview | ✅ |
| Quick tools panel | ✅ |
| Demo Instagram connect | ✅ |
| Real Instagram OAuth (Meta) | ✅ (needs Meta App) |
| Publish to Instagram | ✅ |
| Task history | ✅ |
| Postiz cross-post API | ✅ (optional) |

## Quick Start

```bash
npm install
cp .env.example .env
# Add your OPENAI_API_KEY in .env
npm run dev
```

Open:
- **Landing:** http://localhost:3000
- **AI Studio:** http://localhost:3000/dashboard

## Environment Variables

```env
DATABASE_URL="file:./dev.db"
OPENAI_API_KEY="sk-..."          # Your AI API key
OPENAI_MODEL="gpt-4o-mini"

# Real Instagram OAuth (optional)
META_APP_ID=""
META_APP_SECRET=""
META_REDIRECT_URI="http://localhost:3000/api/instagram/callback"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Postiz (optional)
POSTIZ_API_KEY=""
POSTIZ_URL="http://localhost:4007"
```

## How to Use (Prompt Only)

Go to `/dashboard` and type:

- `Instagram ke liye fitness post banao`
- `Kal subah 10 baje motivational post schedule karo`
- `Digital marketing hashtags generate karo`
- `Instagram account connect karo`
- `Post publish karo`

## Instagram Real Connect Setup

1. Create app at [developers.facebook.com](https://developers.facebook.com)
2. Add **Instagram Graph API** product
3. Add OAuth redirect: `http://localhost:3000/api/instagram/callback`
4. Set `META_APP_ID` and `META_APP_SECRET` in `.env`
5. Click **Connect Instagram (Real)** in dashboard

> Instagram account must be **Business** or **Creator**, linked to a Facebook Page.

## Demo Mode

Without Meta credentials, click **Demo Account Connect** — full flow works (generate, preview, publish simulated).

## Deploy

```bash
npm run build
npm start
```

Deploy to Vercel — add env vars in dashboard.

## Tech Stack

- Next.js 16 · TypeScript · Tailwind CSS v4
- Prisma · SQLite
- OpenAI API
- Meta Instagram Graph API
