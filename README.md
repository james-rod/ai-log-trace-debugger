# AI Log & Trace Debugger

AI Log & Trace Debugger is a full-stack developer tool for monitoring, inspecting, and debugging AI execution flows.

It helps developers understand what happened during a request by showing a trace timeline, execution steps, performance metrics, and AI-generated diagnosis with recommended actions.

---

## Stack

### Frontend
- Next.js
- TypeScript
- CSS Modules

### Backend
- Node.js
- Express
- TypeScript
- Prisma ORM

### Database
- PostgreSQL

### AI / Analysis
- OpenAI API
- GPT-4o-mini

### Auth
- JWT
- bcryptjs

---

## Architecture

The application is split into two main services:

### Frontend
The frontend provides:
- Landing page
- Login / register flow
- Dashboard for traces
- Trace detail page
- Add Trace modal
- AI diagnosis panel
- Export / delete actions

### Backend
The backend handles:
- Authentication
- Trace ingestion
- Timeline generation
- AI diagnosis generation
- Cached analysis storage
- Soft delete support

### Flow
1. A user signs in
2. A trace is created manually or ingested through the backend
3. The backend parses the trace into structured execution steps
4. The frontend displays the trace timeline and metrics
5. The user runs AI diagnosis
6. The backend stores and caches the diagnosis
7. The frontend shows evidence-linked findings and recommended actions

---

## Features

- JWT-based authentication
- Protected dashboard routes
- Create traces from the UI
- Trace timeline with execution steps
- AI diagnosis with confidence + evidence
- Cached analysis with refresh-live option
- Export trace as JSON
- Soft delete traces
- Tooltips and onboarding-friendly wording

---
