export interface Challenge {
  id: number;
  game_name: string;
  challenge_name: string;
  description: string;
  reward_xp: number;
  type: 'daily' | 'weekly' | 'permanent';
  end_date?: string;
  created_at: string;
  banner_url?: string;
  game_icon?: string;
  is_official?: boolean;
  participation_count?: number;
}
