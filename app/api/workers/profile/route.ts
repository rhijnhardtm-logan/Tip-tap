import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { workerProfileSchema } from '@/lib/schemas'
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

    const { data: worker, error } = await supabase
      .from('workers')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error || !worker) {
      return NextResponse.json(
        { success: false, error: 'Worker profile not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      worker,
    })
  } catch (error) {
    console.error('[API] Get worker profile error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate request body
    const validated = workerProfileSchema.parse(body)

    const supabase = await createClient()

    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }

    const { data: worker, error } = await supabase
      .from('workers')
      .update({
        first_name: validated.firstName,
        last_name: validated.lastName,
        location: validated.location,
        bio: validated.bio,
      })
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { success: false, error: 'Failed to update profile' },
        { status: 400 }
      )
    }

    // Log audit event
    try {
      await supabase.from('audit_logs').insert([
        {
          user_id: user.id,
          action: 'worker_profile_updated',
          table_name: 'workers',
          record_id: worker.id,
        } as any,
      ])
    } catch (auditError) {
      console.error('[API] Audit log error:', auditError)
    }

    return NextResponse.json({
      success: true,
      worker,
    })
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

    console.error('[API] Update worker profile error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}
