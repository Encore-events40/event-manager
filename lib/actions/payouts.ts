"use server"

import { createClient } from '../supabase/server'
import { revalidatePath } from 'next/cache'

export async function getPayouts() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('payouts')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching payouts:', error)
    return []
  }
  return data
}

export async function createPayout(payoutData: {
  volunteerId: string;
  eventId: string;
  amount: number;
  notes?: string;
  paidOn?: string; // ISO date string, e.g. '2026-08-25'
}) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (profile?.role !== 'admin') throw new Error("Unauthorized: Admins only")

  const { data, error } = await supabase
    .from('payouts')
    .insert([{
      volunteer_id: payoutData.volunteerId,
      event_id: payoutData.eventId,
      amount: payoutData.amount,
      notes: payoutData.notes,
      paid_on: payoutData.paidOn ?? new Date().toISOString().split('T')[0],
      created_by: user.id
    }])
    .select()
    .single()

  if (error) throw new Error(error.message)

  revalidatePath('/admin/payouts')
  return data
}
