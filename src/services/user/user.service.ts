import ApiService from '@/services/ApiService';

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  avatar_url: string;
  points: number;
  created_at: string;
}

export interface UserStats {
  completed_challenges: number;
  pending_proofs: number;
  created_builds: number;
  created_challenges: number;
  total_points: number;
}

export interface Activity {
  type: 'proof' | 'build' | 'challenge';
  id: number;
  created_at: string;
  status: string;
  title: string;
  game_name: string;
}

export interface ProfileData {
  profile: UserProfile;
  stats: UserStats;
  rank: number | null;
  recentActivity: Activity[];
}

export const UserService = {
  async getProfile(userId: string): Promise<ProfileData> {
    const res = await ApiService.fetchData<void, ProfileData>({
      url: `/users/${userId}`,
      method: 'GET',
    });
    return res.data;
  },
};
