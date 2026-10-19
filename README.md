# Lamsa Cosmetics — Admin Dashboard

Separate Next.js admin frontend for Lamsa Cosmetics. Reuses the existing Express + PostgreSQL API. Does not talk to the database directly.

## Stack

- Next.js App Router, React, TypeScript, Tailwind CSS
- Zod (validation helpers), TanStack Table, Recharts, Lucide icons
- Secure BFF: HttpOnly `lamsa_admin_session` cookie, Bearer forwarding to Express

## Setup

```powershell
copy .env.example .env.local
# set API_URL=http://localhost:4000
npm install
npm run dev
```

App runs on [http://localhost:3001](http://localhost:3001).

Only **ADMIN** users can sign in. CUSTOMER logins are revoked and rejected.

## Scripts

- `npm run dev` — development server (port 3001)
- `npm run typecheck`
- `npm run lint`
- `npm run build`
