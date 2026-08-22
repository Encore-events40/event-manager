export type UserRole = 'admin' | 'volunteer' | 'influencer';
export type ApplicationStatus = 'pending' | 'approved' | 'rejected';
export type PromotionStatus = 'joined' | 'completed';
export type EventStatus = 'draft' | 'published' | 'closed';

export interface Profile {
  id: string;
  user_id: string;
  role: UserRole;
  full_name: string | null;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  skills: string | null;
  created_at: string;
}

export interface Event {
  id: string;
  title: string;
  description: string | null;
  date: string;
  time: string | null;
  location: string | null;
  volunteers_needed: number | null;
  volunteer_pay: number | null;
  skills_required: string | null;
  needs_influencer: boolean;
  // New columns (require DB migration; nullable until applied)
  status: EventStatus | null;
  category?: string | null;
  application_deadline: string | null;
  created_by: string;
  created_at: string;
}

/** Event row augmented with the count of associated applications */
export interface EventWithCount extends Event {
  application_count: number;
}

export interface Application {
  id: string;
  event_id: string;
  volunteer_id: string;
  status: ApplicationStatus;
  applied_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
}

export interface Promotion {
  id: string;
  event_id: string;
  influencer_id: string;
  status: PromotionStatus;
  joined_at: string;
}

export interface Payout {
  id: string;
  event_id: string;
  volunteer_id: string;
  amount: number;
  paid_on: string;
  notes: string | null;
  created_by: string;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Composite types for admin views (data returned from API routes with joins)
// ---------------------------------------------------------------------------

export interface ApplicationWithRelations extends Application {
  events: Pick<Event, 'id' | 'title' | 'date'> | null;
  profiles: Pick<Profile, 'id' | 'full_name' | 'email' | 'role' | 'skills' | 'phone'> | null;
}

export interface PromotionWithRelations extends Promotion {
  events: Pick<Event, 'id' | 'title' | 'date'> | null;
  profiles: Pick<Profile, 'id' | 'full_name' | 'email' | 'role'> | null;
}

/** Normalised shape used in the unified admin applications table */
export interface UnifiedApplicationItem {
  type: 'volunteer' | 'influencer';
  id: string;
  status: string;
  date: string; // applied_at or joined_at
  applicant: {
    id: string;
    full_name: string | null;
    email: string;
    role: UserRole;
    skills: string | null;
    phone: string | null;
  } | null;
  event: { id: string; title: string; date: string } | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
}

export interface BrandEnquiry {
  id: string;
  company: string;
  contact: string;
  email: string | null;
  summary: string | null;
  status: 'new' | 'in_progress' | 'resolved';
  created_at: string;
}