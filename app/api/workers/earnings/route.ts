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
      .select('id, total_tips_earned')
      .eq('user_id', user.id)
      .single()

    if (workerError || !worker) {
      return NextResponse.json(
        { success: false, error: 'Worker profile not found' },
        { status: 404 }
      )
    }

    // Get transactions for this month
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    const { data: monthTransactions } = await supabase
      .from('transactions')
      .select('amount')
      .eq('worker_id', worker.id)
      .eq('status', 'completed')
      .gte('created_at', monthStart.toISOString())
      .lte('created_at', monthEnd.toISOString())

    // Get transactions for this week
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - now.getDay())
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 6)

    const { data: weekTransactions } = await supabase
      .from('transactions')
      .select('amount')
      .eq('worker_id', worker.id)
      .eq('status', 'completed')
      .gte('created_at', weekStart.toISOString())
      .lte('created_at', weekEnd.toISOString())

    // Get transactions for today
    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const dayEnd = new Date(dayStart)
    dayEnd.setDate(dayEnd.getDate() + 1)

    const { data: dayTransactions } = await supabase
      .from('transactions')
      .select('amount')
      .eq('worker_id', worker.id)
      .eq('status', 'completed')
      .gte('created_at', dayStart.toISOString())
      .lte('created_at', dayEnd.toISOString())

    const thisMonth = monthTransactions?.reduce((sum, tx) => sum + (tx.amount || 0), 0) || 0
    const thisWeek = weekTransactions?.reduce((sum, tx) => sum + (tx.amount || 0), 0) || 0
    const today = dayTransactions?.reduce((sum, tx) => sum + (tx.amount || 0), 0) || 0

    return NextResponse.json({
      success: true,
      earnings: {
        totalEarned: worker.total_tips_earned || 0,
        thisMonth,
        thisWeek,
        today,
        currency: 'ZAR',
      },
    })
  } catch (error) {
    console.error('[API] Get earnings error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}
