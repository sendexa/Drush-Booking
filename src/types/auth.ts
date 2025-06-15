// types/auth.ts
/**
 * Represents a user session from Supabase Auth
 */
export type AuthSession = {
  access_token: string
  refresh_token: string
  expires_in: number
  expires_at?: number
  token_type: string
  user: AuthUser
}

/**
 * Minimal user information from Supabase Auth
 */
export type AuthUser = {
  id: string
  email?: string
  phone?: string
  created_at: string
  app_metadata: Record<string, unknown>
  user_metadata: Record<string, unknown>
}

/**
 * Shape of the authentication context
 */
import type { UserProfile } from './profile'

export type AuthContextType = {
  user: UserProfile | null
  isLoading: boolean
  signOut: () => Promise<void>
  session: AuthSession | null
}