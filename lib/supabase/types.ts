export type UserRole = 'admin' | 'volunteer' | 'influencer';
export type ApplicationStatus = 'pending' | 'approved' | 'rejected';
export type PromotionStatus = 'joined' | 'completed';

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
  time: string;
  location: string;
  volunteers_needed: number;
  volunteer_pay: number;
  skills_required: string | null;
  needs_influencer: boolean;
  created_by: string;
  created_at: string;
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