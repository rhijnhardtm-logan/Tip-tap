-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- USERS TABLE (from auth.users, we'll create a public reference)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- ============================================================================
-- WORKERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.workers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  location TEXT,
  avatar_url TEXT,
  rating DECIMAL(3,2) DEFAULT 5.00,
  total_tips_earned DECIMAL(10,2) DEFAULT 0,
  bio TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- ============================================================================
-- WALLETS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  worker_id UUID NOT NULL UNIQUE REFERENCES public.workers(id) ON DELETE CASCADE,
  balance DECIMAL(10,2) DEFAULT 0,
  currency TEXT DEFAULT 'ZAR',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- ============================================================================
-- PAYMENT METHODS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.payment_methods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  worker_id UUID NOT NULL REFERENCES public.workers(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('revolut', 'snapscan', 'zapper', 'bank_transfer', 'stripe')),
  account_identifier TEXT NOT NULL,
  account_name TEXT,
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  -- Stripe-specific fields
  stripe_account_id TEXT,
  stripe_connect_status TEXT DEFAULT 'pending', -- 'pending', 'connected', 'failed'
  stripe_account_email TEXT,
  stripe_onboarding_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  UNIQUE(worker_id, type, account_identifier)
);

-- ============================================================================
-- TRANSACTIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  worker_id UUID NOT NULL REFERENCES public.workers(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'ZAR',
  method_type TEXT NOT NULL CHECK (method_type IN ('revolut', 'snapscan', 'zapper', 'cash')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  reference_id TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- ============================================================================
-- SETTLEMENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.settlements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  worker_id UUID NOT NULL REFERENCES public.workers(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'ZAR',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  settlement_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  processed_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- ============================================================================
-- AUDIT LOGS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  table_name TEXT,
  record_id UUID,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- ============================================================================
-- INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_workers_user_id ON public.workers(user_id);
CREATE INDEX IF NOT EXISTS idx_wallets_worker_id ON public.wallets(worker_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_worker_id ON public.payment_methods(worker_id);
CREATE INDEX IF NOT EXISTS idx_transactions_worker_id ON public.transactions(worker_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_settlements_worker_id ON public.settlements(worker_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own record" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own record" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Workers policies
CREATE POLICY "Workers can view their own profile" ON public.workers
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Workers can update their own profile" ON public.workers
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Anyone can view public worker profiles" ON public.workers
  FOR SELECT USING (true);

CREATE POLICY "Workers can insert their own profile" ON public.workers
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Wallets policies
CREATE POLICY "Workers can view their own wallet" ON public.wallets
  FOR SELECT USING (
    worker_id IN (SELECT id FROM public.workers WHERE user_id = auth.uid())
  );

CREATE POLICY "Workers can update their own wallet" ON public.wallets
  FOR UPDATE USING (
    worker_id IN (SELECT id FROM public.workers WHERE user_id = auth.uid())
  );

CREATE POLICY "Workers can insert their own wallet" ON public.wallets
  FOR INSERT WITH CHECK (
    worker_id IN (SELECT id FROM public.workers WHERE user_id = auth.uid())
  );

-- Payment methods policies
CREATE POLICY "Workers can view their own payment methods" ON public.payment_methods
  FOR SELECT USING (
    worker_id IN (SELECT id FROM public.workers WHERE user_id = auth.uid())
  );

CREATE POLICY "Workers can manage their own payment methods" ON public.payment_methods
  FOR INSERT WITH CHECK (
    worker_id IN (SELECT id FROM public.workers WHERE user_id = auth.uid())
  );

CREATE POLICY "Workers can update their own payment methods" ON public.payment_methods
  FOR UPDATE USING (
    worker_id IN (SELECT id FROM public.workers WHERE user_id = auth.uid())
  );

CREATE POLICY "Workers can delete their own payment methods" ON public.payment_methods
  FOR DELETE USING (
    worker_id IN (SELECT id FROM public.workers WHERE user_id = auth.uid())
  );

-- Transactions policies
CREATE POLICY "Workers can view their own transactions" ON public.transactions
  FOR SELECT USING (
    worker_id IN (SELECT id FROM public.workers WHERE user_id = auth.uid())
  );

CREATE POLICY "Workers can insert their own transactions" ON public.transactions
  FOR INSERT WITH CHECK (
    worker_id IN (SELECT id FROM public.workers WHERE user_id = auth.uid())
  );

-- Settlements policies
CREATE POLICY "Workers can view their own settlements" ON public.settlements
  FOR SELECT USING (
    worker_id IN (SELECT id FROM public.workers WHERE user_id = auth.uid())
  );

-- Audit logs policies
CREATE POLICY "Users can view their own audit logs" ON public.audit_logs
  FOR SELECT USING (user_id = auth.uid());

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workers_updated_at BEFORE UPDATE ON public.workers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wallets_updated_at BEFORE UPDATE ON public.wallets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_methods_updated_at BEFORE UPDATE ON public.payment_methods
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settlements_updated_at BEFORE UPDATE ON public.settlements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
