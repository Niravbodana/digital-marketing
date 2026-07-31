# Bodana Creation Machine — SuperCool Parity Architecture (A–Z)

## Vision
One autonomous creation platform: user types one sentence → system understands → gathers context → plans tools → produces downloadable assets. No digital-marketing agency positioning.

## User Journey Map

```
LANDING → SIGNUP/LOGIN → CREATION MACHINE → OUTPUT → REFINE → EXPORT/SCHEDULE
   │            │                │              │         │
 Homepage    Animated auth    Agent core      Files     Chat refine
 94 tools    Free credits     4-step mind     Preview   PDF/DOCX
 Pricing     OAuth-ready      Tool pick       Download  Autonomy
```

## Page Architecture

| Route | Role | SuperCool Equivalent |
|-------|------|---------------------|
| `/` | Marketing + conversion | go.supercool.com |
| `/login` `/signup` | Animated auth | SuperCool sign-in |
| `/studio` | Creation Machine (core) | SuperCool workspace |
| `/tools` | 94 capabilities catalog | Tool browser |
| `/pricing` | Plans + credits | Pricing |
| `/features` | Capability matrix | Features |
| `/gallery` | Showcase outputs | Gallery |
| `/admin` | Keys, config, showcase | Admin (white-label) |
| `/credits` | Buy credits | Billing |

## Creation Machine Flow (4 Steps)

1. **Understand** — Parse intent, language, output type
2. **Gather** — Research/context via LLM (when needed)
3. **Create** — Pick tool → execute → credits
4. **Deliver** — Output panel + refine loop

API: `POST /api/agent/run` → `AgentRun` + `AgentStep` records

## Tool System (94 Tools)

- Registry: `src/lib/tools.ts` → `AGENT_TOOLS`
- Picker: `src/lib/agent.ts` → `pickToolWithAI()`
- Executor: `src/lib/tool-executor.ts`
- Output types: text, image, video, audio, document, code, spreadsheet

## AI Router (Multi-Key)

- `src/lib/ai-router.ts` — OpenAI, Groq, Gemini, Claude failover
- Admin vault: paste key → auto-detect → background rotation

## Data Models (Prisma)

User, AgentRun, AgentStep, ApiKeyEntry, SiteConfig, ShowcaseItem, CreditPackage, SubscriptionPlan, PromoCode, Conversation, Message, ScheduledJob, Post, Team

## Performance Rules

- No mass video autoplay (lazy + IntersectionObserver)
- Single showcase fetch per page
- Client auth animations use CSS only (no heavy JS)
- `prisma db push` only in dev script, not every navigation
- Images: lazy loading, poster for videos

## Removed (Digital Marketing Layer)

- Agency components (Hero, Services, SEO copy)
- Instagram-first studio UX (moved to Publish panel)
- Metadata keywords: SEO, PPC, SMM

## File Map

```
src/
  app/
    page.tsx              # Homepage
    studio/page.tsx       # Creation Machine
    login/ signup/        # Auth
    admin/                # Admin console
  components/
    auth/AuthShell.tsx    # Animated auth layout
    studio/CreationMachine.tsx
    studio/AgentMind.tsx
    super/                # Marketing sections
  lib/
    brand.ts              # Copy + constants
    agent.ts              # Tool picking
    ai-router.ts          # LLM failover
    tool-executor.ts      # Asset generation
```
