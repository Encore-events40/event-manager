"use server"

import { createClient } from '../supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * Fetches all events. 
 */
export async function listEvents() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('date', { ascending: true })

  if (error) throw new Error(error.message)
  return data
}

/**
 * Creates a new event. Admin only.
 */
export async function createEvent(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  // FIXED: Using user_id to match the profiles table foreign key
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (profile?.role !== 'admin') throw new Error("Unauthorized: Admins only")

  const eventData = {
    title: formData.get('title') as string,
    description: formData.get('description') as string,
    date: formData.get('date') as string,
    time: formData.get('time') as string,
    location: formData.get('location') as string,
    volunteers_needed: parseInt(formData.get('volunteers_needed') as string),
    volunteer_pay: parseFloat(formData.get('volunteer_pay') as string),
    skills_required: formData.get('skills_required') as string,
    created_by: user.id
  }

  const { error } = await supabase
    .from('events')
    .insert([eventData])

  if (error) throw new Error(error.message)

  revalidatePath('/admin')
  revalidatePath('/volunteer/browse')
}

/**
 * Updates an existing event. Admin only.
 */
export async function updateEvent(eventId: string, formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  // FIXED: Using user_id to match the profiles table foreign key
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (profile?.role !== 'admin') throw new Error("Unauthorized: Admins only")

  const eventData = {
    title: formData.get('title') as string,
    description: formData.get('description') as string,
    date: formData.get('date') as string,
    time: formData.get('time') as string,
    location: formData.get('location') as string,
    volunteers_needed: parseInt(formData.get('volunteers_needed') as string),
    volunteer_pay: parseFloat(formData.get('volunteer_pay') as string),
    skills_required: formData.get('skills_required') as string,
  }

  const { error } = await supabase
    .from('events')
    .update(eventData)
    .eq('id', eventId)

  if (error) throw new Error(error.message)

  revalidatePath('/admin')
  revalidatePath('/volunteer/browse')
}

/**
 * Deletes an event. Admin only.
 */
export async function deleteEvent(eventId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  // FIXED: Using user_id to match the profiles table foreign key
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (profile?.role !== 'admin') throw new Error("Unauthorized: Admins only")

  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', eventId)

  if (error) throw new Error(error.message)

  revalidatePath('/admin')
  revalidatePath('/volunteer/browse')
}