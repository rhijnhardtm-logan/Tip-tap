# TipTap - Setup Guide

## Day 1: Foundation & Backend Schema - COMPLETE ✅

This document guides you through setting up TipTap for local development.

### Prerequisites

- Node.js 18+ installed
- npm or yarn
- Supabase account (free tier available)
- Git

### Step 1: Clone & Install Dependencies

```bash
git clone https://github.com/rhijnhardtm-logan/Tip-tap.git
cd Tip-tap
npm install
```

### Step 2: Set Up Supabase

1. **Create a Supabase project**
   - Go to [supabase.com](https://supabase.com)
   - Click "New Project"
   - Choose a name, region (suggest: Cape Town for ZA), and password
   - Wait for project to initialize (5-10 minutes)

2. **Get your credentials**
   - Go to Settings → API
   - Copy `Project URL` and `anon (public) key`
   - Copy `Service Role Key` (from the same page, scroll down)

3. **Configure environment variables**
   - Open `.env.local` in the project root
   - Fill in your Supabase credentials:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your_project_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
     SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
     BETTER_AUTH_SECRET=your_secret_here (run: openssl rand -base64 32)
     ```

### Step 3: Deploy Database Schema

1. **Open Supabase SQL Editor**
   - In your Supabase project dashboard
   - Go to SQL Editor
   - Click "New Query"

2. **Run the migration**
   - Copy entire contents of `supabase/migrations/001_tiptap_schema.sql`
   - Paste into the SQL editor
   - Click "Run"
   - Wait for completion (schema includes 8 tables + RLS policies)

3. **Verify**
   - Go to "Table Editor" in Supabase
   - You should see: `users`, `workers`, `wallets`, `payment_methods`, `transactions`, `settlements`, `audit_logs`

### Step 4: Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Step 5: Test the Application

1. **Visit home page** - See landing page with hero section
2. **Click "Get Started"** - Go to registration page (Days 2-3)
3. **Current status** - Foundation only; auth pages & APIs in progress

---

## Architecture Overview

### Database Schema (8 tables + RLS)

```
┌─────────────────────────────────────────────────────┐
│ USERS (Core Auth)                                   │
├─────────────────────────────────────────────────────┤
│ id (UUID) | email | phone | created_at | updated_at │
└─────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ WORKERS (Worker Profiles)                                   │
├─────────────────────────────────────────────────────────────┤
│ id | user_id | first_name | last_name | location | rating  │
└─────────────────────────────────────────────────────────────┘
       ↙              ↙              ↙
┌─────────────────┐ ┌──────────────────┐ ┌─────────────────────┐
│ WALLETS         │ │ PAYMENT_METHODS  │ │ TRANSACTIONS        │
├─────────────────┤ ├──────────────────┤ ├─────────────────────┤
│ id | worker_id  │ │ id | worker_id   │ │ id | worker_id      │
│ balance | curr  │ │ type | account_id│ │ amount | method_type│
└─────────────────┘ └──────────────────┘ └─────────────────────┘

┌─────────────────┐ ┌──────────────────┐
│ SETTLEMENTS     │ │ AUDIT_LOGS       │
├─────────────────┤ ├──────────────────┤
│ id | worker_id  │ │ id | user_id     │
│ amount | status │ │ action | details │
└─────────────────┘ └──────────────────┘
```

### Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS v4, shadcn/ui components
- **Backend**: Next.js API Routes, Server Actions
- **Database**: Supabase PostgreSQL
- **Auth**: Better Auth + Supabase Auth
- **Validation**: Zod
- **HTTP Client**: SWR, Axios

### Folder Structure

```
tiptap/
├── app/
│   ├── layout.tsx          (Root layout)
│   ├── page.tsx            (Home/landing page)
│   ├── globals.css         (Tailwind + design tokens)
│   ├── login/              (Day 2: Login page)
│   ├── register/           (Day 2: Registration)
│   ├── dashboard/          (Day 2: Worker dashboard)
│   ├── wallet/             (Day 2: Wallet management)
│   └── api/                (Day 3: API routes)
├── components/             (Reusable UI components)
├── lib/
│   ├── supabase/           (DB clients + types)
│   ├── auth.ts             (Auth helpers)
│   └── schemas.ts          (Zod validation)
├── supabase/
│   └── migrations/         (SQL schema files)
├── next.config.js          (Next.js config)
├── tailwind.config.ts      (Tailwind config)
├── tsconfig.json           (TypeScript config)
└── .env.local              (Environment variables)
```

---

## Common Issues

### "Cannot find module '@supabase/supabase-js'"
- Run `npm install` again
- Delete `node_modules` and `package-lock.json`, then reinstall

### "Database connection failed"
- Check `.env.local` has correct Supabase URL and keys
- Verify Supabase project is active
- Ensure migration SQL ran successfully

### "RLS policy violation"
- Supabase RLS is working correctly! (This is expected during auth setup)
- Login with valid credentials to bypass RLS

### Port 3000 already in use
- Run: `npm run dev -- -p 3001`
- Or kill the process: `lsof -ti:3000 | xargs kill -9`

---

## Next Steps (Days 2-3)

**Day 2: Frontend Components & Authentication**
- Create login/register pages with Better Auth
- Build worker dashboard with profile, balance, recent transactions
- Implement tip selector interface (R1-R20 buttons + custom input)
- Add wallet management (view payment methods, add new ones)

**Day 3: API Layer & Integration**
- Create 15+ API endpoints for auth, workers, wallets, transactions
- Implement server actions for form submissions
- Connect frontend to backend
- Full end-to-end testing

---

## Support & Documentation

- **Supabase Docs**: https://supabase.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Tailwind Docs**: https://tailwindcss.com/docs

---

## Commits

```
Day 1: git commit -m "feat: Foundation setup - Next.js, Supabase schema, DB clients"
```

---

Last Updated: Day 1 Complete
Next: Day 2 - Frontend Components & Authentication
