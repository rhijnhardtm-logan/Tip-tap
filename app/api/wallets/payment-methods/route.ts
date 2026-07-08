import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { paymentMethodSchema } from '@/lib/schemas'
import { ZodError } from 'zod'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }

    // Get worker
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

    // Get payment methods
    const { data: methods, error } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('worker_id', worker.id)
      .order('is_default', { ascending: false })

    if (error) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch payment methods' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      paymentMethods: methods || [],
    })
  } catch (error) {
    console.error('[API] Get payment methods error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate request body
    const validated = paymentMethodSchema.parse(body)

    const supabase = await createClient()

    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }

    // Get worker
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

    // If Stripe, redirect to onboarding instead
    if (validated.type === 'stripe') {
      return NextResponse.json(
        {
          success: false,
          error: 'Use /api/stripe/onboard endpoint for Stripe setup',
          code: 'STRIPE_ONBOARDING_REQUIRED',
        },
        { status: 400 }
      )
    }

    // If setting as default, unset other defaults
    if (validated.isDefault) {
      await supabase
        .from('payment_methods')
        .update({ is_default: false })
        .eq('worker_id', worker.id)
    }

    // Create payment method
    const { data: method, error } = await supabase
      .from('payment_methods')
      .insert([
        {
          worker_id: worker.id,
          type: validated.type,
          account_identifier: validated.accountIdentifier,
          account_name: validated.accountName,
          is_default: validated.isDefault,
        },
      ])
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { success: false, error: 'Failed to create payment method' },
        { status: 400 }
      )
    }

    // Log audit event
    try {
      await supabase.from('audit_logs').insert([
        {
          user_id: user.id,
          action: 'payment_method_added',
          table_name: 'payment_methods',
          record_id: method.id,
          details: { type: validated.type },
        } as any,
      ])
    } catch (auditError) {
      console.error('[API] Audit log error:', auditError)
    }

    return NextResponse.json(
      {
        success: true,
        paymentMethod: method,
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: error.errors[0]?.message || 'Validation failed',
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      )
    }

    console.error('[API] Create payment method error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}
