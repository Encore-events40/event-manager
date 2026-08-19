"use server"

import { createClient } from '../supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Authentication required")

  // Combine first and last name
  const firstName = formData.get('first_name') as string
  const lastName = formData.get('last_name') as string
  const fullName = `${firstName} ${lastName}`.trim()

  let avatarUrl = undefined;

  // Handle the file upload if an image was selected
  const avatarFile = formData.get('avatar') as File | null;
  if (avatarFile && avatarFile.size > 0) {
    const fileExt = avatarFile.name.split('.').pop();
    // Generate a unique filename to prevent overwriting
    const fileName = `${user.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('media')
      .upload(fileName, avatarFile, {
        upsert: true,
      });

    if (uploadError) throw new Error(`Image upload failed: ${uploadError.message}`);

    // Retrieve the public URL for the database
    const { data: publicUrlData } = supabase.storage
      .from('media')
      .getPublicUrl(fileName);

    avatarUrl = publicUrlData.publicUrl;
  }

  const profileData = {
    full_name: fullName,
    phone: formData.get('phone') as string,
    gender: formData.get('gender') as string,
    address_line_1: formData.get('address_line_1') as string,
    address_line_2: formData.get('address_line_2') as string,
    city: formData.get('city') as string,
    pincode: formData.get('pincode') as string,
    ...(avatarUrl && { avatar_url: avatarUrl }), // Only update if a new image was uploaded
  }

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