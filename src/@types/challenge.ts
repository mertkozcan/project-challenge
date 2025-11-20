export interface Challenge {
  id: number;
  game_name: string;
  challenge_name: string;
  description: string;
  reward: string;
  type: 'daily' | 'weekly' | 'permanent';
  end_date?: string;
  created_at: string;
}
