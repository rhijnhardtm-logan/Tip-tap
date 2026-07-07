import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function requireAuth() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return user
}

export async function getSession() {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  return session
}

export async function getCurrentWorker() {
  const user = await requireAuth()
  const supabase = await createClient()

  const { data: worker, error } = await supabase
    .from('workers')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (error) {
    throw new Error('Worker profile not found')
  }

  return worker
}

export async function getCurrentWorkerWallet() {
  const worker = await getCurrentWorker()
  const supabase = await createClient()

  const { data: wallet, error } = await supabase
    .from('wallets')
    .select('*')
    .eq('worker_id', worker.id)
    .single()

  if (error) {
    throw new Error('Wallet not found')
  }

  return wallet
}
