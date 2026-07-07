# Mock Authentication - Testing Guide

## Overview

TipTap now includes **mock authentication** using browser localStorage. This allows you to test the entire UI/UX without needing Supabase credentials.

## Getting Started

1. **Go to the login page** - Navigate to `http://localhost:3000/login`
2. **Register a new account** - Click "Sign up" and enter:
   - Email: `test@example.com`
   - Password: `password123`
   - Name: Your name
3. **You're logged in!** - The dashboard loads with mock data

## Features

### Authentication
- ✅ Register with email/password
- ✅ Login with email/password
- ✅ Logout
- ✅ Session persistence (stored in localStorage)
- ✅ Automatic redirect to login if not authenticated

### Worker Profile
- ✅ View worker name and profile
- ✅ Display rating (default 4.8)
- ✅ Display total earnings
- ✅ Display today's earnings
- ✅ Edit profile details

### Wallet Management
- ✅ View wallet balance
- ✅ Add multiple payment methods (SnapScan, Zapper, Revolut, Bank Transfer)
- ✅ Set default payment method
- ✅ Delete payment methods
- ✅ Display payment method list

### Transactions
- ✅ Record tips from tip selector
- ✅ Update wallet balance
- ✅ Update worker earnings (daily & total)
- ✅ Mock transaction persistence

## How It Works

### Data Storage

All data is stored in browser localStorage with the following keys:

```javascript
// User authentication
localStorage.getItem('tiptap_user')
// Returns: { id: "user_123", email: "test@example.com", name: "John" }

// Auth credentials
localStorage.getItem('tiptap_mock_auth')
// Returns: { user: {...}, email: "...", password: "..." }

// Worker profiles
localStorage.getItem('tiptap_mock_worker')
// Returns: { "user_123": { id: "worker_123", balance: 0, ... } }

// Wallets
localStorage.getItem('tiptap_mock_wallet')
// Returns: { "user_123": { balance: 100, total_received: 500 } }

// Payment methods (per user)
localStorage.getItem('payment_methods_user_123')
// Returns: [{ id: "pm_123", type: "snapscan", ... }]
```

### Data Flow

```
Register
  ↓
Create user, worker, wallet in localStorage
  ↓
Store session
  ↓
Redirect to dashboard
```

```
Login
  ↓
Check localStorage for credentials
  ↓
Store session
  ↓
Redirect to dashboard
```

```
Record Tip
  ↓
Get user from localStorage
  ↓
Update worker earnings (today + total)
  ↓
Update wallet balance
  ↓
Persist changes
```

## Testing Scenarios

### Scenario 1: New User Registration
1. Go to `/register`
2. Fill out form with unique email
3. Click "Create Account"
4. Should redirect to dashboard with 0 balance

### Scenario 2: Add Payment Method
1. On dashboard, click "Open Wallet"
2. Click "Add Method"
3. Select payment type (SnapScan, etc.)
4. Enter account identifier (phone number, email, etc.)
5. Click "Add Payment Method"
6. Payment method should appear in list

### Scenario 3: Record a Tip
1. On wallet page, find "Record a Tip" section
2. Select a tip amount (R1, R2, R5, R10, R20, or custom)
3. Select payment method
4. Click the amount button
5. Success message appears
6. Wallet balance updates
7. Worker earnings update

### Scenario 4: Logout and Login
1. Click logout button
2. Should redirect to home page
3. Go to `/login`
4. Enter same email/password you registered with
5. Should login successfully to dashboard

## Important Notes

### ⚠️ Limitations

- **No real payments** - Transactions are simulated
- **Browser storage only** - Data is lost if cache is cleared
- **Single browser** - Data doesn't sync across devices
- **No backend validation** - Minimal security checks
- **No database** - All data is in localStorage

### 🔄 Switching to Supabase

When ready to use real Supabase:

1. Set environment variables in `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
   SUPABASE_SERVICE_ROLE_KEY=your_key
   ```

2. Run database migration:
   - Go to Supabase SQL editor
   - Run `/supabase/migrations/001_tiptap_schema.sql`

3. Update API routes to use Supabase client instead of mock auth

4. Data will persist to PostgreSQL database

## Clearing Mock Data

To reset all mock data:

1. **Open browser DevTools** (F12 or right-click → Inspect)
2. **Go to Application tab**
3. **Find LocalStorage section**
4. **Find your domain** (localhost:3000)
5. **Delete all keys starting with `tiptap_`**
6. **Refresh the page**

Or use this JavaScript in console:

```javascript
// Clear all TipTap data
Object.keys(localStorage)
  .filter(key => key.startsWith('tiptap_'))
  .forEach(key => localStorage.removeItem(key))

// Clear payment methods
Object.keys(localStorage)
  .filter(key => key.startsWith('payment_methods_'))
  .forEach(key => localStorage.removeItem(key))
```

## Testing Checklist

- [ ] Can register new account
- [ ] Can login with registered credentials
- [ ] Dashboard loads with correct data
- [ ] Can add payment method
- [ ] Can set default payment method
- [ ] Can delete payment method
- [ ] Can record a tip
- [ ] Wallet balance updates
- [ ] Earnings display updates
- [ ] Can logout
- [ ] Can login again after logout
- [ ] UI is responsive on mobile

## File Structure

```
lib/
├── mock-auth.ts           # Mock auth implementation
└── ...

app/
├── login/page.tsx         # Uses mock auth
├── register/page.tsx      # Uses mock auth
├── dashboard/page.tsx     # Loads mock data
└── wallet/page.tsx        # Manages mock wallet
```

## Next Steps

Once you've tested the full UI/UX with mock auth:

1. **Set up Supabase** (free tier available)
2. **Configure environment variables**
3. **Run database migration**
4. **Update API routes** to use real Supabase
5. **Deploy to Vercel**

See [SETUP.md](./SETUP.md) for complete Supabase setup instructions.
