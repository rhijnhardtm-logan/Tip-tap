export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          phone?: string | null
          updated_at?: string
        }
      }
      workers: {
        Row: {
          id: string
          user_id: string
          first_name: string
          last_name: string
          location: string | null
          avatar_url: string | null
          rating: number
          total_tips_earned: number
          bio: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          first_name: string
          last_name: string
          location?: string | null
          avatar_url?: string | null
          rating?: number
          total_tips_earned?: number
          bio?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          first_name?: string
          last_name?: string
          location?: string | null
          avatar_url?: string | null
          rating?: number
          total_tips_earned?: number
          bio?: string | null
          is_active?: boolean
          updated_at?: string
        }
      }
      wallets: {
        Row: {
          id: string
          worker_id: string
          balance: number
          currency: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          worker_id: string
          balance?: number
          currency?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          balance?: number
          currency?: string
          updated_at?: string
        }
      }
      payment_methods: {
        Row: {
          id: string
          worker_id: string
          type: 'revolut' | 'snapscan' | 'zapper' | 'bank_transfer'
          account_identifier: string
          account_name: string | null
          is_default: boolean
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          worker_id: string
          type: 'revolut' | 'snapscan' | 'zapper' | 'bank_transfer'
          account_identifier: string
          account_name?: string | null
          is_default?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          type?: 'revolut' | 'snapscan' | 'zapper' | 'bank_transfer'
          account_identifier?: string
          account_name?: string | null
          is_default?: boolean
          is_active?: boolean
          updated_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          worker_id: string
          amount: number
          currency: string
          method_type: 'revolut' | 'snapscan' | 'zapper' | 'cash'
          status: 'pending' | 'completed' | 'failed' | 'refunded'
          reference_id: string | null
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          worker_id: string
          amount: number
          currency?: string
          method_type: 'revolut' | 'snapscan' | 'zapper' | 'cash'
          status?: 'pending' | 'completed' | 'failed' | 'refunded'
          reference_id?: string | null
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          status?: 'pending' | 'completed' | 'failed' | 'refunded'
          reference_id?: string | null
          description?: string | null
          updated_at?: string
        }
      }
      settlements: {
        Row: {
          id: string
          worker_id: string
          amount: number
          currency: string
          status: 'pending' | 'processing' | 'completed' | 'failed'
          settlement_date: string | null
          created_at: string
          processed_at: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          worker_id: string
          amount: number
          currency?: string
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          settlement_date?: string | null
          created_at?: string
          processed_at?: string | null
          updated_at?: string
        }
        Update: {
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          settlement_date?: string | null
          processed_at?: string | null
          updated_at?: string
        }
      }
      audit_logs: {
        Row: {
          id: string
          user_id: string | null
          action: string
          table_name: string | null
          record_id: string | null
          details: Record<string, any> | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          action: string
          table_name?: string | null
          record_id?: string | null
          details?: Record<string, any> | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          action?: string
          table_name?: string | null
          record_id?: string | null
          details?: Record<string, any> | null
          updated_at?: string
        }
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
    CompositeTypes: {}
  }
}
