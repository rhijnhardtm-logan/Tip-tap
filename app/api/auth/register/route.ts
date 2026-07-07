import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { registerSchema } from '@/lib/schemas'
import { ZodError } from 'zod'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate request body
    const validated = registerSchema.parse(body)

    const supabase = createAdminClient()

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: validated.email,
      password: validated.password,
      email_confirm: true,
    })

    if (authError || !authData.user) {
      return NextResponse.json(
        { success: false, error: authError?.message || 'Failed to create user' },
        { status: 400 }
      )
    }

    // Create user record
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert([
        {
          id: authData.user.id,
          email: validated.email,
          phone: validated.phone,
        },
      ])
      .select()
      .single()

    if (userError) {
      // Clean up auth user if user record creation fails
      await supabase.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json(
        { success: false, error: 'Failed to create user profile' },
        { status: 400 }
      )
    }

    // Create worker profile
    const { data: workerData, error: workerError } = await supabase
      .from('workers')
      .insert([
        {
          user_id: authData.user.id,
          first_name: validated.firstName,
          last_name: validated.lastName,
          location: validated.location,
        },
      ])
      .select()
      .single()

    if (workerError) {
      return NextResponse.json(
        { success: false, error: 'Failed to create worker profile' },
        { status: 400 }
      )
    }

    // Create wallet
    await supabase.from('wallets').insert([
      {
        worker_id: workerData.id,
        balance: 0,
        currency: 'ZAR',
      },
    ])

    // Log audit event
    await supabase.from('audit_logs').insert([
      {
        user_id: authData.user.id,
        action: 'user_registered',
        table_name: 'workers',
        record_id: workerData.id,
        details: { email: validated.email },
      },
    ])

    return NextResponse.json(
      {
        success: true,
        user: {
          id: authData.user.id,
          email: authData.user.email,
        },
        worker: {
          id: workerData.id,
          firstName: validated.firstName,
          lastName: validated.lastName,
          location: validated.location,
        },
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

    console.error('[API] Register error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}
