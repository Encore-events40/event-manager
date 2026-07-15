"use server"

import { createClient } from '../supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * Allows a user to update their own profile information.
 */
export async function updateProfile(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Authentication required")

  // Map the incoming form data to the fields defined in your types.ts
  const profileData = {
    full_name: formData.get('full_name') as string,
    phone: formData.get('phone') as string,
    skills: formData.get('skills') as string,
  }

  // Remove null/empty string values if you don't want to overwrite existing data with blanks
  const cleanedData = Object.fromEntries(
    Object.entries(profileData).filter(([_, v]) => v != null && v !== '')
  )

  const { error } = await supabase
    .from('profiles')
    .update(cleanedData)
    .eq('user_id', user.id)

  if (error) throw new Error(error.message)

  revalidatePath('/volunteer')
  revalidatePath('/influencer')
}