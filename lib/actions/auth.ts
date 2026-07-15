"use server"

import { createClient } from '../supabase/server'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
  const supabase = await createClient()
  
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw new Error(error.message)

  // Middleware will automatically catch this and redirect them to their specific dashboard
  redirect('/') 
}

export async function signup(formData: FormData, role: 'volunteer' | 'influencer') {
  const supabase = await createClient()
  
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  // 1. Create the user in Supabase Auth
  const { data, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
  })

  if (signUpError) throw new Error(signUpError.message)
  
  if (data.user) {
    // 2. Automatically create their profile row with the selected role
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([
        {
          user_id: data.user.id,
          email: email,
          role: role,
        }
      ])

    if (profileError) {
      console.error("Profile creation failed:", profileError)
      throw new Error("Account created, but profile setup failed.")
    }
  }

  // Redirect to login so they can sign in with their new credentials
  redirect('/login')
}