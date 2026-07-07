import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
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

    // Get payment method to verify ownership
    const { data: method } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('id', id)
      .eq('worker_id', worker.id)
      .single()

    if (!method) {
      return NextResponse.json(
        { success: false, error: 'Payment method not found', code: 'NOT_FOUND' },
        { status: 404 }
      )
    }

    // Delete payment method
    const { error } = await supabase
      .from('payment_methods')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json(
        { success: false, error: 'Failed to delete payment method' },
        { status: 400 }
      )
    }

    // Log audit event
    try {
      await supabase.from('audit_logs').insert([
        {
          user_id: user.id,
          action: 'payment_method_deleted',
          table_name: 'payment_methods',
          record_id: id,
        } as any,
      ])
    } catch (auditError) {
      console.error('[API] Audit log error:', auditError)
    }

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    console.error('[API] Delete payment method error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}
