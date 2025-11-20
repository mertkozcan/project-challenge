export interface Build {
  id: number;
  user_id: number;
  username?: string;
  game_name: string;
  build_name: string;
  description: string;
  items_json: Record<string, any>;
  created_at: string;
}
