import ApiService from '@/services/ApiService';

export interface LeaderboardEntry {
  username: string;
  avatar_url: string;
  score?: number;
  completed_count?: number;
  created_at?: string;
  media_url?: string;
}

export const LeaderboardService = {
  async getGlobalRankings(type: 'completions' | 'points' = 'completions'): Promise<LeaderboardEntry[]> {
    const res = await ApiService.fetchData<void, LeaderboardEntry[]>({
      url: '/leaderboard/global',
      method: 'GET',
      params: { type },
    });
    return res.data;
  },

  async getChallengeRankings(challengeId: string): Promise<LeaderboardEntry[]> {
    const res = await ApiService.fetchData<void, LeaderboardEntry[]>({
      url: `/leaderboard/challenge/${challengeId}`,
      method: 'GET',
    });
    return res.data;
  },
};
