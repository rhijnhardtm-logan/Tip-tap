import { z } from 'zod'

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  phone: z.string().min(10, 'Phone number must be at least 10 characters'),
  location: z.string().min(2, 'Location is required'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

// Worker profile schema
export const workerProfileSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  location: z.string().min(2, 'Location is required'),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
})

// Payment method schema
export const paymentMethodSchema = z.object({
  type: z.enum(['revolut', 'snapscan', 'zapper', 'bank_transfer', 'stripe']),
  accountIdentifier: z.string().min(1, 'Account identifier is required'),
  accountName: z.string().optional(),
  isDefault: z.boolean().default(false),
  stripeEmail: z.string().email('Invalid email for Stripe').optional(),
})

// Stripe onboarding schema
export const stripeOnboardingSchema = z.object({
  email: z.string().email('Invalid email address'),
  country: z.string().min(2, 'Country code is required'),
})

// Transaction schema
export const transactionSchema = z.object({
  amount: z.number().positive('Amount must be greater than 0'),
  methodType: z.enum(['revolut', 'snapscan', 'zapper', 'cash', 'stripe']),
  description: z.string().optional(),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type WorkerProfileInput = z.infer<typeof workerProfileSchema>
export type PaymentMethodInput = z.infer<typeof paymentMethodSchema>
export type StripeOnboardingInput = z.infer<typeof stripeOnboardingSchema>
export type TransactionInput = z.infer<typeof transactionSchema>
