import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './types'

export const createClient = () =>
  createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

// Export a singleton instance for convenience
let client: ReturnType<typeof createClient> | null = null

export const getSupabaseClient = () => {
  if (!client) {
    client = createClient()
  }
  return client
}
