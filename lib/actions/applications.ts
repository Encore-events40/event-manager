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

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('user_id', user.id)
    .single()

  if (profile?.role !== 'volunteer') {
    throw new Error("Unauthorized: Only volunteers can apply to events")
  }

  const { error } = await supabase
    .from('applications')
    .insert([
      {
        event_id: eventId,
        volunteer_id: profile.id,
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

  const { data: adminProfile } = await supabase
    .from('profiles')
    .select('role, id')
    .eq('user_id', user.id)
    .single()

  if (adminProfile?.role !== 'admin') {
    throw new Error("Unauthorized: Administrative access required")
  }

  // NOTE: `applications` has two foreign keys into `profiles`
  // (volunteer_id and reviewed_by), so `.select('*, profiles(...)')`
  // is ambiguous — PostgREST can't tell which relationship you mean and
  // throws "more than one relationship was found". Update first, then
  // fetch the volunteer's profile and the event separately instead of
  // embedding.
  const { data: updatedApp, error: updateError } = await supabase
    .from('applications')
    .update({
      status,
      reviewed_at: new Date().toISOString(),
      reviewed_by: adminProfile.id,
    })
    .eq('id', applicationId)
    .select('*')
    .single()

  if (updateError) throw new Error(updateError.message)

  // Trigger transactional email if the application is approved
  if (status === 'approved' && updatedApp) {
    try {
      const [{ data: volunteerProfile }, { data: event }] = await Promise.all([
        supabase.from('profiles').select('email').eq('id', updatedApp.volunteer_id).single(),
        supabase.from('events').select('title').eq('id', updatedApp.event_id).single(),
      ])

      if (volunteerProfile?.email && event?.title) {
        // Call this app's OWN /api/email route — not Supabase's domain.
        // Requires NEXT_PUBLIC_SITE_URL to be set (e.g.
        // http://localhost:3000 in dev, your real domain in production).
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
        await fetch(`${siteUrl}/api/email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ to: volunteerProfile.email, eventName: event.title }),
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

  // Same ambiguous-embed issue as above — fetch applications, then bulk
  // fetch the referenced profiles/events separately and merge in JS.
  const { data: applications, error } = await supabase
    .from('applications')
    .select('*')
    .order('applied_at', { ascending: false })

  if (error) throw new Error(error.message)
  if (!applications || applications.length === 0) return []

  const profileIds = new Set<string>()
  const eventIds = new Set<string>()
  for (const a of applications) {
    if (a.volunteer_id) profileIds.add(a.volunteer_id)
    if (a.event_id) eventIds.add(a.event_id)
  }

  const [{ data: profiles }, { data: events }] = await Promise.all([
    supabase.from('profiles').select('id, full_name, email, role').in('id', Array.from(profileIds)),
    supabase.from('events').select('id, title, date').in('id', Array.from(eventIds)),
  ])

  const profilesById = new Map((profiles ?? []).map((p) => [p.id, p]))
  const eventsById = new Map((events ?? []).map((e) => [e.id, e]))

  return applications.map((a) => ({
    ...a,
    profiles: profilesById.get(a.volunteer_id) ?? null,
    events: eventsById.get(a.event_id) ?? null,
  }))
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

  // Unambiguous — applications has only one FK to events, so this embed
  // is fine as-is.
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