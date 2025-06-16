// utils/supabase/auth.ts
import { createClient } from './client'

export async function getCurrentUser() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return profile
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
}