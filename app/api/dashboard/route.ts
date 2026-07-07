import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (workerError || !worker) {
      return NextResponse.json(
        { success: false, error: 'Worker profile not found' },
        { status: 404 }
      )
    }

    // Get wallet
    const { data: wallet, error: walletError } = await supabase
      .from('wallets')
      .select('*')
      .eq('worker_id', worker.id)
      .single()

    if (walletError) {
      return NextResponse.json(
        { success: false, error: 'Wallet not found' },
        { status: 404 }
      )
    }

    // Get recent transactions (last 5)
    const { data: recentTransactions } = await supabase
      .from('transactions')
      .select('*')
      .eq('worker_id', worker.id)
      .order('created_at', { ascending: false })
      .limit(5)

    return NextResponse.json({
      success: true,
      worker,
      wallet,
      recentTransactions: recentTransactions || [],
    })
  } catch (error) {
    console.error('[API] Get dashboard error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}
