# Stripe Integration Guide for TipTap

## Overview

TipTap now includes **Stripe Connect** as a payment method option. This guide explains the current placeholder implementation and how to complete the real Stripe integration.

## Current Status

### What's Implemented (Placeholder)
- ✅ Stripe option in payment method selector
- ✅ Stripe onboarding endpoint (`POST /api/stripe/onboard`)
- ✅ Placeholder payment method storage
- ✅ Transaction marking for Stripe tips (`stripe_pending` status)
- ✅ Database schema ready for Stripe fields
- ❌ Real Stripe Connect API calls (TODO)
- ❌ Webhook processing (TODO)
- ❌ Balance settlement (TODO)

## Database Schema

### Payment Methods Table - Stripe Fields
```sql
stripe_account_id TEXT               -- Stripe Account ID
stripe_connect_status TEXT           -- 'pending', 'connected', 'failed'
stripe_account_email TEXT            -- Worker email for onboarding
stripe_onboarding_url TEXT           -- Stripe authorization URL
```

### Transaction Status Values
- `completed` - Other payment methods (immediate)
- `stripe_pending` - Stripe tips (awaiting webhook confirmation)
- `stripe_confirmed` - Stripe tips confirmed (not yet implemented)

## API Endpoints

### 1. Stripe Onboarding
**POST /api/stripe/onboard**

Initiates Stripe Connect onboarding for a worker.

**Request:**
```json
{
  "email": "worker@example.com",
  "country": "ZA"
}
```

**Response (Current - Placeholder):**
```json
{
  "success": true,
  "message": "Stripe onboarding initiated...",
  "payment_method": {
    "id": "uuid",
    "type": "stripe",
    "stripe_account_id": "acct_placeholder_xxx",
    "stripe_connect_status": "pending",
    "stripe_onboarding_url": "https://..."
  },
  "note": "TODO: This will be replaced with real Stripe Connect API integration"
}
```

### 2. Record Tip via Stripe
Workers can select "Stripe (Wallet)" when recording a tip. The tip is:
- Created with status `stripe_pending`
- NOT added to balance immediately
- Stored with reference ID for Stripe webhook processing

## Implementation Roadmap

### Phase 1: Complete Stripe Connect OAuth (Next)
- [ ] Get Stripe API keys and setup Stripe Dashboard
- [ ] Implement real `POST /api/stripe/onboard`
  - Call `stripe.oauth.token()` with authorization code
  - Store real `stripe_account_id`
  - Update payment method status to `connected`
- [ ] Create callback endpoint: `GET /api/stripe/callback`
  - Handle OAuth redirect from Stripe
  - Exchange code for Stripe account ID

### Phase 2: Handle Stripe Payments
- [ ] Create endpoint: `POST /api/stripe/transfer`
  - Accept tip amount and worker Stripe account ID
  - Create Stripe Connect transfer
  - Mark transaction as `stripe_confirmed`
  - Update wallet balance
- [ ] Implement webhook: `POST /api/stripe/webhook`
  - Listen for `transfer.created` events
  - Update transaction status
  - Trigger balance updates

### Phase 3: Testing & Edge Cases
- [ ] Test with real Stripe test account
- [ ] Handle failed transfers
- [ ] Implement retry logic
- [ ] Add currency conversion (if needed for USD/EUR)
- [ ] Handle refunds
- [ ] Add balance settlement schedule

## TODO: Real Stripe Integration Code

### Step 1: Install Stripe SDK
```bash
npm install stripe
```

### Step 2: Update Environment Variables
```env
STRIPE_API_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_OAUTH_CLIENT_ID=ca_...
```

### Step 3: Implement OAuth Callback
```typescript
// app/api/stripe/callback/route.ts
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code')
  const stripe = new Stripe(process.env.STRIPE_API_KEY!)
  
  const result = await stripe.oauth.token({
    code,
    grant_type: 'authorization_code',
  })
  
  // Update payment method with real account ID
  // Save stripe_connect_status: 'connected'
}
```

### Step 4: Process Stripe Tips
```typescript
// app/api/stripe/transfer/route.ts
export async function POST(request: NextRequest) {
  const { amount, stripeAccountId } = await request.json()
  const stripe = new Stripe(process.env.STRIPE_API_KEY!)
  
  const transfer = await stripe.transfers.create({
    amount: Math.round(amount * 100), // cents
    currency: 'zar',
    destination: stripeAccountId,
  })
  
  // Update transaction status to stripe_confirmed
  // Update wallet balance
}
```

### Step 5: Handle Webhooks
```typescript
// app/api/stripe/webhook/route.ts
export async function POST(request: NextRequest) {
  const sig = request.headers.get('stripe-signature')
  const body = await request.text()
  const stripe = new Stripe(process.env.STRIPE_API_KEY!)
  
  const event = stripe.webhooks.constructEvent(
    body,
    sig!,
    process.env.STRIPE_WEBHOOK_SECRET!
  )
  
  switch (event.type) {
    case 'transfer.created':
      // Update transaction to confirmed
      break
    case 'transfer.failed':
      // Mark transaction as failed
      break
  }
}
```

## Testing

### Current (Placeholder)
```bash
curl -X POST http://localhost:3000/api/stripe/onboard \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "country": "ZA"
  }'
```

Response shows placeholder account ID and status.

### After Real Integration
- Use Stripe Dashboard test account
- Verify webhook delivery
- Test transfer processing
- Check balance updates

## Stripe Connect Status Transitions

```
Initial State: (No Stripe payment method)
    ↓
User clicks "Connect Stripe"
    ↓
stripe_connect_status: pending
    ↓
[User completes Stripe onboarding]
    ↓
stripe_connect_status: connected
    ↓
[Worker can now receive Stripe tips]
    ↓
Tip recorded → status: stripe_pending
    ↓
[Webhook confirms transfer]
    ↓
status: stripe_confirmed
Balance updated
```

## Troubleshooting

### Common Issues
1. **"Stripe onboarding URL not working"**
   - This is expected in placeholder mode
   - Will work after real Stripe API integration

2. **"Stripe tips not adding to balance"**
   - This is correct behavior (stripe_pending status)
   - Balance updates when webhook confirms (not yet implemented)

3. **"Can't connect Stripe account"**
   - Placeholder mode doesn't perform real Stripe OAuth
   - Implement Phase 1 to enable real connections

## Support

For questions about Stripe integration:
- See `/api/stripe/onboard` route for current implementation
- Check `STRIPE_INTEGRATION.md` for latest updates
- Review Stripe Connect docs: https://stripe.com/docs/connect

## Next Steps

1. Get Stripe API keys from Stripe Dashboard
2. Set environment variables
3. Follow "Implementation Roadmap" phases
4. Test with real Stripe account
5. Deploy to production

---

**Status:** Phase 0 (Placeholder) → Ready for Phase 1 Implementation
