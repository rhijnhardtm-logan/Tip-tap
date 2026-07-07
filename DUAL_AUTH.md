# Dual Authentication System

TipTap now provides two separate authentication modes - **Mock** for testing and **Supabase** for production. Choose the one that fits your needs.

## Authentication Modes

### Mock Mode (Testing)
**Routes:** `/login-mock`, `/register-mock`

Perfect for exploring the app without any setup or configuration.

**Features:**
- No database required
- Instant access
- Data stored locally in browser localStorage
- Full feature testing
- Perfect for development and demos

**How It Works:**
1. Visit `/login-mock` or `/register-mock`
2. Create an account with any email/password
3. All data is stored in your browser's localStorage
4. Logout clears the session (but you can login again)

**Example Credentials:**
- Email: `test@example.com`
- Password: `password123`

**Data Storage:**
All mock data is saved in localStorage under:
```javascript
localStorage.getItem('tiptap_user')
localStorage.getItem('tiptap_workers')
localStorage.getItem('tiptap_wallets')
localStorage.getItem('tiptap_transactions')
```

---

### Supabase Mode (Production)
**Routes:** `/login`, `/register`

Real, production-ready authentication with persistent database storage.

**Requirements:**
1. Supabase project (free tier available at supabase.com)
2. Environment variables configured:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. Database schema migrated (run SQL from `/supabase/migrations/001_tiptap_schema.sql`)

**Features:**
- Real persistent database
- Row Level Security (RLS)
- Production-grade security
- Audit logging
- Real payment integration ready

**Setup Instructions:**

1. **Create Supabase Project:**
   - Go to supabase.com
   - Create a new project
   - Wait for database to initialize

2. **Get API Keys:**
   - In Supabase dashboard, go to Settings > API
   - Copy Project URL and keys
   - Set environment variables in v0 Settings > Vars

3. **Run Database Migration:**
   - In Supabase SQL Editor
   - Create new query
   - Copy/paste contents of `/supabase/migrations/001_tiptap_schema.sql`
   - Click Run

4. **Test Login:**
   - Go to `/register`
   - Create an account
   - Should redirect to `/dashboard`

---

## Switching Between Modes

### From Login Page
Both login pages have a link to switch modes:
- **At `/login`**: "Use mock authentication" link goes to `/login-mock`
- **At `/login-mock`**: "Use Supabase authentication" link goes to `/login`

### From Register Page
Both register pages have a link to switch modes:
- **At `/register`**: "Use mock authentication" link goes to `/register-mock`
- **At `/register-mock`**: "Use Supabase authentication" link goes to `/register`

### From Home Page
The home page (`/`) displays both options with descriptions and direct links to either mode.

---

## Development Workflow

### Phase 1: Explore & Test (Mock)
```
Start at home page
→ Choose "Mock Mode"
→ Create account
→ Test all features
→ Explore dashboard, wallet, transactions
```

### Phase 2: Setup Production (Supabase)
```
Create Supabase project
Set environment variables
Run database migration
Test at /register endpoint
```

### Phase 3: Migration (Optional)
Users can transition from mock to Supabase by:
1. Creating a new account on Supabase mode
2. Re-entering their information
3. Supabase becomes the new source of truth

---

## Data Persistence

### Mock Mode
- Data: Browser localStorage
- Persistence: Until localStorage is cleared
- Scope: Single browser/device
- Sharing: Not possible
- Backup: Manual export from localStorage

### Supabase Mode
- Data: PostgreSQL database
- Persistence: Permanent (until deleted)
- Scope: Global - accessible from any device
- Sharing: Real multi-device support
- Backup: Automatic Supabase backups

---

## Environment Variables

### Required for Supabase Mode
Add these in v0 Settings > Vars:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Not Required for Mock Mode
Mock mode works completely without any environment variables.

---

## Testing Checklist

### Mock Mode Testing
- [ ] Register with new email
- [ ] Login with registered email
- [ ] View dashboard
- [ ] Add payment methods
- [ ] Record tips
- [ ] Check balance updates
- [ ] Logout
- [ ] Login again (session persists)

### Supabase Mode Testing
- [ ] Check env variables are set
- [ ] Register new account
- [ ] Verify user in Supabase Auth
- [ ] Verify worker profile in database
- [ ] Login with registered email
- [ ] Check dashboard loads data
- [ ] Add payment method
- [ ] Record transaction
- [ ] Verify data in Supabase dashboard

---

## Troubleshooting

### Mock Mode Issues

**Can't create account:**
- Check browser console for errors
- Try refreshing the page
- Clear localStorage and try again

**Data not persisting:**
- Check if localStorage is enabled in browser
- Private/Incognito windows may not persist data
- Check browser settings for localStorage limits

**Session expires:**
- localStorage is only cleared on logout or browser cache clear
- Refreshing page should keep session

### Supabase Mode Issues

**Can't create account:**
- Check environment variables are set correctly
- Verify Supabase project URL and keys
- Check network tab for API errors
- Ensure database migration was run

**Login fails:**
- Verify email and password are correct
- Check if account exists in Supabase Auth
- Check browser console for error details

**Missing data:**
- Run the SQL migration again
- Verify RLS policies are correct
- Check Supabase dashboard for data

---

## API Routes (Supabase Only)

When using Supabase mode, these API endpoints are available:

**Auth:**
- POST `/api/auth/register` - Create account
- POST `/api/auth/login` - Login
- POST `/api/auth/logout` - Logout
- GET `/api/auth/session` - Check session

**Workers:**
- GET `/api/workers/profile` - Get profile
- PUT `/api/workers/profile` - Update profile
- GET `/api/workers/earnings` - Get earnings

**Wallets:**
- GET `/api/wallets` - Get balance
- GET `/api/wallets/payment-methods` - List methods
- POST `/api/wallets/payment-methods` - Add method
- DELETE `/api/wallets/payment-methods/[id]` - Delete method

**Transactions:**
- GET `/api/transactions` - List transactions
- POST `/api/transactions` - Create transaction
- GET `/api/transactions/[id]` - Get details

See `API.md` for full documentation.

---

## Frequently Asked Questions

**Q: Can I use both modes at the same time?**
A: Yes, they're completely separate. Mock data stays local, Supabase data goes to database.

**Q: Will my mock data transfer to Supabase?**
A: No, they're separate systems. You'll need to create a new account in Supabase mode.

**Q: Which mode should I use?**
A: Use Mock for testing/demos without setup. Use Supabase for production and real data.

**Q: How do I switch from Mock to Supabase?**
A: Create a new account at `/register`. All links at bottom of auth pages help you switch.

**Q: Is mock mode suitable for production?**
A: No, it's localStorage-based. Data is only on one device and not backed up.

**Q: Can I export mock data?**
A: Yes, you can export localStorage data from browser DevTools, but there's no built-in export.

---

## Next Steps

1. **Choose Your Mode:**
   - Start with Mock (`/login-mock`) for quick testing
   - Or setup Supabase (`/register`) for production

2. **Test the App:**
   - Create account and explore features
   - Check dashboard, wallet, and transactions
   - Test adding payment methods

3. **Integrate Real Payments:**
   - When ready, add Revolut, SnapScan, Zapper
   - Update API routes to process real payments
   - Connect to banking systems

---

For more details, see:
- `SETUP.md` - Initial setup guide
- `API.md` - Complete API reference
- `MOCK_AUTH.md` - Mock authentication details
