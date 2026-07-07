// Mock authentication for testing without Supabase
// Set NEXT_PUBLIC_MOCK_AUTH=true in .env.local to enable

export interface MockUser {
  id: string
  email: string
  name: string
}

export interface MockWorker {
  id: string
  user_id: string
  phone: string
  location: string
  rating: number
  total_earnings: number
  today_earnings: number
}

export interface MockWallet {
  id: string
  user_id: string
  balance: number
  total_received: number
}

const MOCK_STORAGE_KEY = 'tiptap_mock_auth'
const MOCK_WORKER_KEY = 'tiptap_mock_worker'
const MOCK_WALLET_KEY = 'tiptap_mock_wallet'

export const mockAuth = {
  // Register a new mock user
  register: async (email: string, password: string, name: string) => {
    if (typeof window === 'undefined') return null

    const userId = `user_${Date.now()}`
    const workerId = `worker_${Date.now()}`
    const walletId = `wallet_${Date.now()}`

    const user: MockUser = { id: userId, email, name }
    const worker: MockWorker = {
      id: workerId,
      user_id: userId,
      phone: '',
      location: '',
      rating: 4.8,
      total_earnings: 0,
      today_earnings: 0,
    }
    const wallet: MockWallet = {
      id: walletId,
      user_id: userId,
      balance: 0,
      total_received: 0,
    }

    localStorage.setItem(
      MOCK_STORAGE_KEY,
      JSON.stringify({ user, email, password })
    )
    localStorage.setItem(
      MOCK_WORKER_KEY,
      JSON.stringify({ [userId]: worker })
    )
    localStorage.setItem(
      MOCK_WALLET_KEY,
      JSON.stringify({ [userId]: wallet })
    )

    return { user, worker, wallet }
  },

  // Login with mock credentials
  login: async (email: string, password: string) => {
    if (typeof window === 'undefined') return null

    const stored = localStorage.getItem(MOCK_STORAGE_KEY)
    if (!stored) {
      throw new Error('User not found. Please register first.')
    }

    const { user, email: storedEmail, password: storedPassword } =
      JSON.parse(stored)

    if (email !== storedEmail || password !== storedPassword) {
      throw new Error('Invalid email or password')
    }

    return user
  },

  // Get current mock user session
  getSession: async () => {
    if (typeof window === 'undefined') return null

    const stored = localStorage.getItem(MOCK_STORAGE_KEY)
    if (!stored) return null

    const { user } = JSON.parse(stored)
    return user
  },

  // Logout
  logout: async () => {
    if (typeof window === 'undefined') return

    localStorage.removeItem('tiptap_mock_session')
  },

  // Get worker profile
  getWorker: async (userId: string) => {
    if (typeof window === 'undefined') return null

    const stored = localStorage.getItem(MOCK_WORKER_KEY)
    if (!stored) return null

    const workers = JSON.parse(stored)
    return workers[userId] || null
  },

  // Update worker profile
  updateWorker: async (userId: string, updates: Partial<MockWorker>) => {
    if (typeof window === 'undefined') return null

    const stored = localStorage.getItem(MOCK_WORKER_KEY)
    const workers = stored ? JSON.parse(stored) : {}

    workers[userId] = { ...workers[userId], ...updates }
    localStorage.setItem(MOCK_WORKER_KEY, JSON.stringify(workers))

    return workers[userId]
  },

  // Get wallet
  getWallet: async (userId: string) => {
    if (typeof window === 'undefined') return null

    const stored = localStorage.getItem(MOCK_WALLET_KEY)
    if (!stored) return null

    const wallets = JSON.parse(stored)
    return wallets[userId] || null
  },

  // Update wallet balance
  updateWallet: async (
    userId: string,
    updates: Partial<MockWallet>
  ) => {
    if (typeof window === 'undefined') return null

    const stored = localStorage.getItem(MOCK_WALLET_KEY)
    const wallets = stored ? JSON.parse(stored) : {}

    wallets[userId] = { ...wallets[userId], ...updates }
    localStorage.setItem(MOCK_WALLET_KEY, JSON.stringify(wallets))

    return wallets[userId]
  },

  // Add mock transaction (in-memory only)
  addTransaction: async (
    userId: string,
    amount: number,
    methodType: string
  ) => {
    const worker = await mockAuth.getWorker(userId)
    if (!worker) return null

    const wallet = await mockAuth.getWallet(userId)
    if (!wallet) return null

    // Update worker earnings
    const newTodayEarnings = worker.today_earnings + amount
    const newTotalEarnings = worker.total_earnings + amount

    await mockAuth.updateWorker(userId, {
      today_earnings: newTodayEarnings,
      total_earnings: newTotalEarnings,
    })

    // Update wallet balance
    const newBalance = wallet.balance + amount
    const newTotalReceived = wallet.total_received + amount

    await mockAuth.updateWallet(userId, {
      balance: newBalance,
      total_received: newTotalReceived,
    })

    return {
      id: `txn_${Date.now()}`,
      user_id: userId,
      amount,
      method_type: methodType,
      created_at: new Date().toISOString(),
    }
  },
}

export const isMockAuthEnabled = () => {
  if (typeof window === 'undefined')
    return process.env.NEXT_PUBLIC_MOCK_AUTH === 'true'
  return true // Always enabled on client for testing
}
