
export interface UserProfile {
  id: string;
  username: string;
  display_style: string;
  daily_uses_remaining: number;
  total_uses: number;
  is_admin: boolean;
  is_banned: boolean;
  ban_expires_at: string | null;
  registration_ip: string | null;
  is_moderator: boolean;
  has_subscription: boolean;
  subscription_type: string | null;
  subscription_expires_at: string | null;
  profile_picture: string | null;
  custom_color: string | null;
  tags: string[] | null;
  email?: string;
  has_unlimited_uses?: boolean;
  tag?: string;
  tag_color?: string;
}
