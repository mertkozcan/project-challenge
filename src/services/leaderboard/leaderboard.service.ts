import ApiService from '@/services/ApiService';

export interface LeaderboardEntry {
  user_id: string;
  username: string;
  avatar_url: string;
  score: number;
  created_at: string;
  rank: number;
}

export interface ChallengeLeaderboardResponse {
  rankings: LeaderboardEntry[];
  userRank: number | null;
}

export interface GlobalLeaderboardEntry {
  username: string;
  avatar_url: string;
  completed_count?: number;
  points?: number;
}

export const LeaderboardService = {
  async getGlobalRankings(type: 'completions' | 'points' = 'completions'): Promise<GlobalLeaderboardEntry[]> {
    const res = await ApiService.fetchData<void, GlobalLeaderboardEntry[]>({
      url: '/leaderboard/global',
      method: 'GET',
      params: { type },
    });
    return res.data;
  },

  async getChallengeRankings(challengeId: string, userId?: string): Promise<ChallengeLeaderboardResponse> {
    const res = await ApiService.fetchData<void, ChallengeLeaderboardResponse>({
      url: `/leaderboard/challenge/${challengeId}`,
      method: 'GET',
      params: userId ? { userId } : undefined,
    });
    return res.data;
  },
};
