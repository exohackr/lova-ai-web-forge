
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
}
