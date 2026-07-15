"use server"

import { createClient } from '../supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * Allows an authenticated volunteer to apply for an active event
 */
export async function applyForEvent(eventId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Authentication required")

  // Verify user is a volunteer
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('user_id', user.id)
    .single()

  if (profile?.role !== 'volunteer') {
    throw new Error("Unauthorized: Only volunteers can apply to events")
  }

  // Insert application row (Postgres schema handles default 'pending' status)
  const { error } = await supabase
    .from('applications')
    .insert([
      {
        event_id: eventId,
        volunteer_id: profile.id, // using the profiles table primary key relation
      }
    ])

  if (error) {
    if (error.code === '23505') throw new Error("You have already applied to this event")
    throw new Error(error.message)
  }

  revalidatePath('/volunteer/browse')
}

/**
 * Allows an admin to approve or reject a volunteer application
 */
export async function updateApplicationStatus(
  applicationId: string, 
  status: 'approved' | 'rejected'
) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Authentication required")

  // Verify administrative privileges
  const { data: adminProfile } = await supabase
    .from('profiles')
    .select('role, id')
    .eq('user_id', user.id)
    .single()

  if (adminProfile?.role !== 'admin') {
    throw new Error("Unauthorized: Administrative access required")
  }

  // Update status and fetch associated details for email notifications
  const { data: updatedApp, error: updateError } = await supabase
    .from('applications')
    .update({
      status,
      reviewed_at: new Date().toISOString(),
      reviewed_by: adminProfile.id
    })
    .eq('id', applicationId)
    .select('*, events(title), profiles(email)')
    .single()

  if (updateError) throw new Error(updateError.message)

  // Trigger transactional email if the application is approved
  if (status === 'approved' && updatedApp) {
    try {
      const targetEmail = (updatedApp.profiles as any)?.email
      const eventName = (updatedApp.events as any)?.title

      if (targetEmail && eventName) {
        // Intercept and ping the internal route handler
        await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('.supabase.co', '')}.supabase.co/api/email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ to: targetEmail, eventName }),
        })
      }
    } catch (emailErr) {
      console.error("Database status updated successfully, but failed to trigger notification:", emailErr)
    }
  }

  revalidatePath('/admin/applications')
}

/**
 * Fetches all applications for the admin dashboard, including joined profile and event data.
 */
export async function listAllApplications() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Authentication required")

  const { data: adminProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (adminProfile?.role !== 'admin') {
    throw new Error("Unauthorized: Administrative access required")
  }

  const { data, error } = await supabase
    .from('applications')
    .select(`
      *,
      events (title, date),
      profiles (full_name, email, role)
    `)
    .order('applied_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data
}

/**
 * Fetches applications specific to the currently logged-in user.
 */
export async function getUserApplications() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Authentication required")

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!profile) throw new Error("Profile not found")

  const { data, error } = await supabase
    .from('applications')
    .select(`
      *,
      events (title, date, location, volunteer_pay)
    `)
    .eq('volunteer_id', profile.id)
    .order('applied_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data
}