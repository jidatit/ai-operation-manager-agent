# AI COO — Operations Manager MVP

An AI-powered executive assistant that connects to Google (Gmail + Calendar), Slack, and Asana, collects operational data twice a day (in each user's timezone), generates executive summaries via OpenRouter, and delivers them through a dashboard, email, and Slack.

This is **not** a chatbot. It is a scheduled reporting product with a clean SaaS dashboard.

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React, TypeScript, Vite, TailwindCSS, React Router, TanStack Query, Axios |
| Backend | Node.js, Express, TypeScript, Prisma, node-cron |
| Database | PostgreSQL 16 |
| Auth | Google OAuth + JWT httpOnly cookie |
| AI | OpenRouter API |
| Email | Resend |

## Monorepo layout

```
backend/     Express API, connectors, scheduler, Prisma
frontend/    React dashboard
docker-compose.yml
.env.example
```

## Quick start

### 1. Prerequisites

- Node.js 20+
- Docker (for PostgreSQL)
- OAuth apps for Google, Slack, Asana (optional until you connect them)
- OpenRouter API key (required to generate reports)
- Resend API key (optional for email delivery)

### 2. Configure environment

```bash
cp .env.example .env
# Generate secrets:
# openssl rand -hex 32   → SESSION_SECRET (use a long random string)
# openssl rand -hex 32   → ENCRYPTION_KEY (exactly 64 hex chars)
```

Symlink for Prisma (already created if you followed setup):

```bash
ln -sf ../.env backend/.env
```

### 3. Start database & install

```bash
docker compose up -d
npm install --prefix backend
npm install --prefix frontend
cd backend && npx prisma migrate dev && cd ..
```

### 4. Run apps

```bash
# Terminal 1
npm run dev --prefix backend

# Terminal 2
npm run dev --prefix frontend
```

- Frontend: http://localhost:5173  
- Backend health: http://localhost:3001/health  

## OAuth app setup

### Google Cloud

1. Create a project in [Google Cloud Console](https://console.cloud.google.com/).
2. **Required:** Enable both APIs for the same project as your OAuth client (or reports show empty Emails/Meetings):
   - [Gmail API](https://console.cloud.google.com/apis/library/gmail.googleapis.com)
   - [Google Calendar API](https://console.cloud.google.com/apis/library/calendar-json.googleapis.com)
3. Configure OAuth consent screen (External or Internal).
4. While **Publishing status** is **Testing**, add every account that will sign in under **Test users** (e.g. `jidatemailtester@gmail.com`). Only those emails can authorize until the app is published/verified.
5. Create **OAuth 2.0 Client ID** (Web application).
6. Authorized JavaScript origins (optional for this server-side flow, recommended):
   - `http://localhost:5173`
7. Authorized redirect URIs (required):
   - `http://localhost:3001/auth/google/callback`
   - `http://localhost:3001/connections/google/callback`
8. Copy Client ID / Secret into `.env`.
9. Set **Settings → Timezone** in the app to your local zone (e.g. `Asia/Karachi`) so “today’s meetings” match your calendar.

Scopes used: `openid email profile`, `gmail.readonly`, `calendar.readonly` (offline access).

#### Fix: Empty Emails / Meetings (“API has not been used… or it is disabled”)

If reports say no emails/meetings but Gmail/Calendar have data, check backend logs for  
`Gmail API has not been used…` / `Calendar API has not been used…`. Enable both APIs (step 2), wait a few minutes, then regenerate the report.

#### Fix: Error 403 `access_denied` (verification / testers only)

This is a Google Cloud Console setting, not an app bug.

1. Open **APIs & Services → OAuth consent screen**.
2. Confirm status is **Testing**.
3. **Test users → Add users** → add the Gmail you use to sign in.
4. Save, wait 1–2 minutes, retry http://localhost:5173.

Do **not** publish the app for local MVP unless you need any Google account to sign in. Publishing with Gmail/Calendar scopes often triggers Google’s verification process.

After fixing: run `npm run dev:backend` and `npm run dev:frontend`, then sign in again with an approved test user.

### Slack

AI COO requests **bot scopes** (messages + `chat:write` for report delivery). Your Slack app must have a **Bot User** configured before you can Connect.

1. Create an app at [api.slack.com/apps](https://api.slack.com/apps).
2. Open **App Home** → under **Your App’s Presence in Slack**, enable / add a **Bot User** (e.g. **Add Legacy Bot User** or show bot as online — wording varies).
3. **OAuth & Permissions → Redirect URLs → Add New Redirect URL** (exact, no trailing slash):
   - `http://localhost:3001/connections/slack/callback`
4. Click **Save URLs**.
5. **OAuth & Permissions → Scopes → Bot Token Scopes** — add all of:
   - `channels:history`, `channels:read`
   - `groups:history`, `groups:read`
   - `im:history`, `im:read`
   - `mpim:history`, `mpim:read`
   - `users:read`, `chat:write`  
   Adding Bot Token Scopes also creates the bot if App Home did not.
6. Copy Client ID / Secret into `.env` (`SLACK_CLIENT_ID`, `SLACK_CLIENT_SECRET`).
7. If the app was previously installed without a bot: **Reinstall to Workspace**, or in AI COO disconnect Slack and Connect again.

#### Slack errors

| Error | Fix |
|-------|-----|
| `redirect_uri did not match any configured URIs` | Add `http://localhost:3001/connections/slack/callback` under Redirect URLs and Save. |
| *doesn’t have a bot user to install* | Enable Bot User (App Home) and add the Bot Token Scopes above, then reconnect. |

### Asana

1. Create an app in [Asana Developer Console](https://app.asana.com/0/my-apps).
2. Under **OAuth** / **Redirect URLs**, add exactly:
   - `http://localhost:3001/connections/asana/callback`
3. Save, then copy Client ID / Secret into `.env`.

If you see `redirect_uri parameter does not match a valid url`, the Asana app is missing that exact redirect URL.

### OpenRouter

1. Create a key at [openrouter.ai](https://openrouter.ai/).
2. Set `OPENROUTER_API_KEY`.
3. Set `OPENROUTER_MODEL` to a current model slug (default: `anthropic/claude-sonnet-4.5`).  
   Do **not** use `anthropic/claude-3.5-sonnet` — OpenRouter returns `No endpoints found` for that retired id. Browse models at https://openrouter.ai/models.

### Email (Resend)

1. Create an account at [resend.com](https://resend.com/).
2. Add and verify your sending domain (or use `onboarding@resend.dev` for testing).
3. Create an API key and set `RESEND_API_KEY` in `.env`.
4. Set `EMAIL_FROM` to a verified sender, e.g. `AI COO <reports@yourdomain.com>`.

## Features

- Google Sign-In with secure session cookie
- Connect / reconnect / disconnect Google, Slack, Asana
- Tokens encrypted at rest (AES-256-GCM); never sent to the frontend
- Morning (08:00) and evening (19:00) reports in each user's timezone
- Manual generate + scheduler run endpoints
- Dashboard stats, report history with search/filters
- Email HTML delivery + Slack markdown notification
- Graceful degradation when a single provider fails
- Dark mode toggle in Settings

## API overview

| Method | Path | Description |
|--------|------|-------------|
| GET | `/auth/google` | Start Google login |
| GET | `/auth/me` | Current user |
| POST | `/auth/logout` | Clear session |
| GET | `/connections` | Connection statuses |
| POST | `/connections/:provider` | Start OAuth connect |
| DELETE | `/connections/:provider` | Disconnect |
| GET | `/reports` | List reports |
| GET | `/reports/:id` | Report detail |
| POST | `/reports/generate?type=MORNING\|EVENING` | Manual generate |
| GET | `/dashboard` | Dashboard payload |
| POST | `/scheduler/run-morning` | Force morning for current user |
| POST | `/scheduler/run-evening` | Force evening for current user |
| PATCH | `/users/settings` | Timezone & delivery prefs |

## Scheduler

A global cron runs every 15 minutes. For each user it checks local time:

- **08:00–08:14** → morning report (once per local calendar day)
- **19:00–19:14** → evening report (once per local calendar day)

Timezone is configured under **Settings**.

## Verification checklist

- [ ] `docker compose up -d` + `prisma migrate dev` succeeds
- [ ] Google sign-in creates user + session cookie
- [ ] Connect Google / Slack / Asana; tokens stored encrypted
- [ ] Manual report generates markdown and appears on dashboard
- [ ] Email arrives (when Resend is configured)
- [ ] Slack message posts with dashboard link
- [ ] Cron window respected for user's timezone (or use `/scheduler/run-*`)
- [ ] Disconnect removes OAuth row; report still works with remaining providers

## Security notes

- OAuth tokens are encrypted with `ENCRYPTION_KEY` before database storage
- JWT lives in an httpOnly cookie (`ai_coo_session`)
- CORS allows only `FRONTEND_URL` with credentials
- Auth routes are rate-limited

## Out of scope (MVP)

Multi-agent systems, RAG, vector databases, billing, RBAC, multi-tenancy, and workflow engines are intentionally not included.
