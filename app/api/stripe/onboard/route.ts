import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripeOnboardingSchema } from '@/lib/schemas'
import { v4 as uuidv4 } from 'uuid'

/**
 * POST /api/stripe/onboard
 * Start Stripe Connect onboarding for a worker
 * 
 * TODO: Replace with real Stripe Connect API calls
 * For now, this is a placeholder that creates a payment method entry
 * with pending status and stores the email for future Stripe integration
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validated = stripeOnboardingSchema.parse(body)

    // Get worker profile
    const { data: worker, error: workerError } = await supabase
      .from('workers')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (workerError || !worker) {
      return NextResponse.json(
        { success: false, error: 'Worker profile not found' },
        { status: 404 }
      )
    }

    // Check if Stripe payment method already exists
    const { data: existingStripe } = await supabase
      .from('payment_methods')
      .select('id')
      .eq('worker_id', worker.id)
      .eq('type', 'stripe')
      .single()

    if (existingStripe) {
      return NextResponse.json(
        { success: false, error: 'Stripe account already connected' },
        { status: 400 }
      )
    }

    // Generate placeholder Stripe account ID (will be replaced by real Stripe ID later)
    const stripeAccountId = `acct_placeholder_${uuidv4()}`
    const onboardingUrl = 'https://dashboard.stripe.com/setup/connect/oauth/authorize?stripe_user[email]=' + encodeURIComponent(validated.email)

    // Create payment method entry with pending status
    const { data: paymentMethod, error: insertError } = await supabase
      .from('payment_methods')
      .insert([
        {
          worker_id: worker.id,
          type: 'stripe',
          account_identifier: stripeAccountId,
          account_name: validated.email,
          stripe_account_email: validated.email,
          stripe_account_id: stripeAccountId,
          stripe_connect_status: 'pending',
          stripe_onboarding_url: onboardingUrl,
          is_default: false,
          is_active: false,
        },
      ])
      .select()
      .single()

    if (insertError) {
      console.error('[Stripe API] Insert error:', insertError)
      return NextResponse.json(
        { success: false, error: 'Failed to create Stripe payment method' },
        { status: 500 }
      )
    }

    // Log audit event
    try {
      await supabase.from('audit_logs').insert([
        {
          user_id: user.id,
          action: 'stripe_onboarding_initiated',
          table_name: 'payment_methods',
          record_id: paymentMethod.id,
          details: { email: validated.email, country: validated.country },
        } as any,
      ])
    } catch (auditError) {
      console.error('[Stripe API] Audit log error:', auditError)
    }

    return NextResponse.json({
      success: true,
      message: 'Stripe onboarding initiated. Click the link below to connect your Stripe account.',
      payment_method: {
        id: paymentMethod.id,
        type: paymentMethod.type,
        account_name: paymentMethod.account_name,
        stripe_account_id: paymentMethod.stripe_account_id,
        stripe_connect_status: paymentMethod.stripe_connect_status,
        stripe_onboarding_url: paymentMethod.stripe_onboarding_url,
      },
      note: 'TODO: This will be replaced with real Stripe Connect API integration',
    })
  } catch (error: any) {
    console.error('[Stripe API] Error:', error)

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: error.errors[0]?.message || 'Validation error' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Failed to initiate Stripe onboarding' },
      { status: 500 }
    )
  }
}
