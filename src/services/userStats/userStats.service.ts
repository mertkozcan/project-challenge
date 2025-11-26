import ApiService from '@/services/ApiService';

export interface UserStats {
  completedChallenges: number;
  activeChallenges: number;
  createdBuilds: number;
  points: number;
  globalRank: number | null;
  completedBingos: number;
  activeBingos: number;
}

export interface UserActivity {
  id: number;
  challenge_name: string;
  game_name: string;
  type: string;
  score: number;
  created_at: string;
}

export interface UserBuild {
  id: number;
  build_name: string;
  game_name: string;
  game_icon?: string;
  description: string;
  created_at: string;
  items_json: any;
}

export const UserStatsService = {
  async getUserStats(userId: string): Promise<UserStats> {
    const res = await ApiService.fetchData<void, UserStats>({
      url: `/users/${userId}/stats`,
      method: 'GET',
    });
    return res.data;
  },

  async getUserActivity(userId: string, limit = 20): Promise<UserActivity[]> {
    const res = await ApiService.fetchData<void, UserActivity[]>({
      url: `/users/${userId}/activity`,
      method: 'GET',
      params: { limit },
    });
    return res.data;
  },

  async getUserBuilds(userId: string): Promise<UserBuild[]> {
    const res = await ApiService.fetchData<void, UserBuild[]>({
      url: `/users/${userId}/builds`,
      method: 'GET',
    });
    return res.data;
  },

  async getUserChallenges(userId: string): Promise<any[]> {
    const res = await ApiService.fetchData<void, any[]>({
      url: `/users/${userId}/challenges`,
      method: 'GET',
    });
    return res.data;
  },

  async getUserBingoBoards(userId: string): Promise<any[]> {
    const res = await ApiService.fetchData<void, any[]>({
      url: `/users/${userId}/bingo-boards`,
      method: 'GET',
    });
    return res.data;
  },
};
