// types/profile.ts
/**
 * User profile stored in the 'profiles' table
 */
export type UserProfile = {
  id: string
  full_name: string
  email: string
  phone?: string | null
  avatar_url?: string | null
  created_at: string
  updated_at?: string | null
}

/**
 * Form data for updating user profile
 */
export type ProfileFormData = {
  full_name: string
  phone?: string
  avatar_url?: string
}