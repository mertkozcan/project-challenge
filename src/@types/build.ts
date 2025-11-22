export interface Build {
  id: number;
  user_id: string;
  game_name: string;
  build_name: string;
  description: string;
  items_json: any;
  created_at: string;
  username?: string;
  is_official?: boolean;
  banner_url?: string;
}
