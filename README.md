# Bodana Digital — AI Command Centre

Premium marketing platform with login, AI agent, 50 tools, Instagram connect, live preview.

## Fix: "Task table does not exist" error

```bash
npm run setup
# OR
npx prisma db push
npm run dev
```

The `dev` script now auto-runs `prisma db push` before starting.

## Quick Start

```bash
npm install
cp .env.example .env
npm run dev
```

| Page | URL |
|---|---|
| Sign Up | http://localhost:3000/signup |
| Login | http://localhost:3000/login |
| **Command Centre** | http://localhost:3000/dashboard |
| Admin (API Keys) | http://localhost:3000/admin |

## Features

- **Login / Signup** — full auth flow
- **Command Prompt** — type anything, agent thinks → plans → executes
- **Thinking Panel** — live thinking/planning/executing boxes
- **50 Agent Tools** — content, image, video, SEO, code, strategy
- **Instagram Connect** — username + password login modal
- **Account Details** — followers, posts, bio, full stats
- **Live Preview** — Instagram post preview
- **Admin Panel** — API keys with ONLINE/OFFLINE status
- **Publish** — demo + real Meta OAuth

## Environment

```env
DATABASE_URL="file:./dev.db"
OPENAI_API_KEY="sk-..."       # Optional — mock AI works without
JWT_SECRET="your-secret"
META_APP_ID=""                # Optional — for real Instagram OAuth
META_APP_SECRET=""
```

## Flow

1. **Sign up** at `/signup`
2. **Login** → `/dashboard`
3. **Connect Instagram** — username + password
4. **Type prompt** — "Instagram post banao"
5. Watch **Agent Intelligence** panel (thinking → planning → executing)
6. See **Live Preview** → **Publish**

## Admin API Keys

Go to `/admin` → add OpenAI key → shows **● ONLINE** if working.
