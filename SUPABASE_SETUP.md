# Supabase Setup Guide for TipTap

This guide walks you through setting up TipTap with a real Supabase backend. Your Supabase project is already connected - now you need to deploy the database schema.

## Prerequisites

- Supabase project already created and connected
- Environment variables set (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY)
- Node.js installed locally

## Step 1: Deploy the Database Schema

### Option A: Via Supabase Dashboard (Recommended)

1. Go to your Supabase project: https://app.supabase.com
2. Select your project from the list
3. Go to **SQL Editor** (left sidebar)
4. Click **New Query**
5. Copy the entire contents of `supabase/migrations/001_tiptap_schema.sql`
6. Paste into the SQL editor
7. Click **Run** (or press Ctrl+Enter)

Wait for the query to complete. You should see: **Executed successfully** ✓

### Option B: Via Node Script (Automated)

```bash
# From project directory
npm run deploy:schema
```

## Step 2: Verify Database Schema

After deployment, verify that all tables were created:

1. In Supabase dashboard, go to **Table Editor**
2. You should see these tables:
   - `users` - Auth user records
   - `workers` - Worker profiles
   - `wallets` - Wallet balances
   - `payment_methods` - Payment information
   - `transactions` - Tip records
   - `settlements` - Payout history
   - `audit_logs` - Activity tracking

If all tables are present, your schema is deployed successfully! ✅

## Step 3: Configure Authentication

1. Go to **Authentication** → **Providers** in Supabase
2. Make sure **Email** provider is enabled (it should be by default)
3. Go to **URL Configuration**
4. Set your site URL:
   - Development: `http://localhost:3000`
   - Production: Your Vercel domain (e.g., `https://your-app.vercel.app`)

5. Add redirect URLs:
   - Development: `http://localhost:3000/dashboard`
   - Production: `https://your-app.vercel.app/dashboard`

## Step 4: Test the Application

### Local Testing

```bash
npm run dev
```

Then:

1. Go to http://localhost:3000
2. Click "Get Started (Supabase)" or navigate to `/register`
3. Create a new account with a valid email
4. You should be automatically logged in
5. You'll see the dashboard with your profile

### Testing Checklist

- [ ] Register a new account
- [ ] Login with your email/password
- [ ] View dashboard with profile info
- [ ] Add payment methods in wallet
- [ ] Record a tip transaction
- [ ] See balance update
- [ ] View earnings summary
- [ ] Logout successfully

## Step 5: Deploy to Vercel

1. Push your code to GitHub
2. Connect your repo to Vercel
3. Add environment variables in Vercel project settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SUPABASE_JWT_SECRET` (optional but recommended)

4. Deploy!

## Troubleshooting

### Error: "Database schema does not exist"

**Solution:** The SQL migration hasn't been run yet. Follow Step 1 again, making sure to execute the entire SQL file.

### Error: "Invalid Supabase credentials"

**Solution:** Check that your environment variables are set correctly:
```bash
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### Error: "Auth user creation failed"

**Solution:** Go to Supabase dashboard → Authentication → Policies, make sure the email provider is enabled.

### Error: "Permission denied" on table operations

**Solution:** Your Row Level Security (RLS) policies may not be configured. The schema includes RLS by default - verify the policies are in place:
1. Go to **Table Editor**
2. Select a table
3. Click **RLS** tab
4. Verify policies are enabled

### Can't login after registration

**Solution:** 
1. Check that the `users`, `workers`, and `wallets` tables were created
2. Verify your email is correct
3. Check Supabase logs for errors: **Logs** → **Auth**

## Database Schema Overview

### Users Table
- `id` (UUID): Primary key
- `email` (TEXT): User email
- `phone` (TEXT): Optional phone number
- `created_at`, `updated_at`: Timestamps

### Workers Table
- `id` (UUID): Primary key
- `user_id` (UUID): Foreign key to users
- `first_name`, `last_name` (TEXT): Worker name
- `location` (TEXT): Work location
- `avatar_url` (TEXT): Profile picture
- `rating` (DECIMAL): Star rating (1-5)
- `total_tips_earned` (DECIMAL): Lifetime earnings
- `is_active` (BOOLEAN): Worker status

### Wallets Table
- `id` (UUID): Primary key
- `worker_id` (UUID): Foreign key to workers
- `balance` (DECIMAL): Available balance
- `currency` (TEXT): ZAR

### Payment Methods Table
- `id` (UUID): Primary key
- `worker_id` (UUID): Foreign key to workers
- `type` (TEXT): revolut, snapscan, zapper, bank_transfer
- `account_identifier` (TEXT): Account details
- `is_default` (BOOLEAN): Default payment method

### Transactions Table
- `id` (UUID): Primary key
- `worker_id` (UUID): Foreign key to workers
- `amount` (DECIMAL): Tip amount
- `method_type` (TEXT): Payment method used
- `status` (TEXT): pending, completed, failed, refunded
- `reference_id` (TEXT): External reference
- `created_at`, `updated_at`: Timestamps

## API Endpoints

All endpoints require a valid Supabase session.

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/session` - Check session

### Dashboard
- `GET /api/dashboard` - Get worker stats and earnings

### Workers
- `GET /api/workers/profile` - Get worker profile
- `PUT /api/workers/profile` - Update profile
- `GET /api/workers/earnings` - Get earnings data

### Wallets
- `GET /api/wallets` - Get wallet and balance
- `GET /api/wallets/payment-methods` - List payment methods
- `POST /api/wallets/payment-methods` - Add payment method
- `DELETE /api/wallets/payment-methods/[id]` - Delete method

### Transactions
- `GET /api/transactions` - List transactions (paginated)
- `POST /api/transactions` - Create transaction
- `GET /api/transactions/[id]` - Get transaction details

## Next Steps

Once your Supabase backend is working:

1. **Enable Real Payments**: Integrate with Revolut, SnapScan, Zapper APIs
2. **Add KYC**: Implement worker verification workflow
3. **Setup Settlements**: Automate payout processing
4. **Analytics**: Build admin dashboard with earnings reports
5. **Mobile App**: Create React Native app using same APIs

## Support

If you encounter issues:

1. Check the Supabase documentation: https://supabase.com/docs
2. Review the troubleshooting section above
3. Check application logs: `npm run dev` and look for console errors
4. Verify environment variables are set correctly

## Switching Back to Mock Auth

If you need to test without Supabase:

1. Navigate to http://localhost:3000/login-mock
2. Create an account in mock mode
3. All mock data is stored locally in your browser

---

**You're all set!** Your Supabase backend is now configured and ready for production. 🚀
