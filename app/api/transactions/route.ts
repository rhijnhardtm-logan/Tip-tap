import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { transactionSchema } from '@/lib/schemas'
import { ZodError } from 'zod'
import { v4 as uuidv4 } from 'uuid'

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

    // Get pagination params
    const page = parseInt(request.nextUrl.searchParams.get('page') || '1')
    const limit = Math.min(parseInt(request.nextUrl.searchParams.get('limit') || '20'), 100)
    const offset = (page - 1) * limit

    // Get transactions count
    const { count } = await supabase
      .from('transactions')
      .select('id', { count: 'exact', head: true })
      .eq('worker_id', worker.id)

    // Get transactions
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('worker_id', worker.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch transactions' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      transactions: transactions || [],
      pagination: {
        page,
        limit,
        total: count || 0,
      },
    })
  } catch (error) {
    console.error('[API] Get transactions error:', error)
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
    const validated = transactionSchema.parse(body)

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
      .select('id, total_tips_earned')
      .eq('user_id', user.id)
      .single()

    if (workerError || !worker) {
      return NextResponse.json(
        { success: false, error: 'Worker profile not found' },
        { status: 404 }
      )
    }

    // Create transaction
    const referenceId = `TIP-${uuidv4().split('-')[0].toUpperCase()}`
    const { data: transaction, error } = await supabase
      .from('transactions')
      .insert([
        {
          worker_id: worker.id,
          amount: validated.amount,
          currency: 'ZAR',
          method_type: validated.methodType,
          status: 'completed',
          reference_id: referenceId,
          description: validated.description,
        },
      ])
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { success: false, error: 'Failed to create transaction' },
        { status: 400 }
      )
    }

    // Update worker total earned
    const newTotal = (worker.total_tips_earned || 0) + validated.amount
    await supabase
      .from('workers')
      .update({ total_tips_earned: newTotal })
      .eq('id', worker.id)

    // Update wallet balance
    const { data: wallet } = await supabase
      .from('wallets')
      .select('balance')
      .eq('worker_id', worker.id)
      .single()

    if (wallet) {
      await supabase
        .from('wallets')
        .update({ balance: (wallet.balance || 0) + validated.amount })
        .eq('worker_id', worker.id)
    }

    // Log audit event
    try {
      await supabase.from('audit_logs').insert([
        {
          user_id: user.id,
          action: 'transaction_created',
          table_name: 'transactions',
          record_id: transaction.id,
          details: { amount: validated.amount, method: validated.methodType },
        } as any,
      ])
    } catch (auditError) {
      console.error('[API] Audit log error:', auditError)
    }

    return NextResponse.json(
      {
        success: true,
        transaction,
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

    console.error('[API] Create transaction error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}
