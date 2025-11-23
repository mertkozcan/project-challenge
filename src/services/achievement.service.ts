import ApiService from './ApiService';

export interface Achievement {
  id: number;
  name: string;
  description: string;
  icon: string;
  type: 'WINS' | 'GAMES' | 'STREAK' | 'SPEED';
  threshold: number;
  xp_reward: number;
  unlocked_at?: string; // Present if user has unlocked it
}

export const AchievementService = {
  // Get all achievements
  getAllAchievements: async (): Promise<Achievement[]> => {
    const response = await ApiService.fetchData<unknown, Achievement[]>({
      url: '/bingo/achievements',
      method: 'get',
    });
    return response.data;
  },

  // Get user's unlocked achievements
  getUserAchievements: async (userId: string): Promise<Achievement[]> => {
    const response = await ApiService.fetchData<unknown, Achievement[]>({
      url: `/bingo/achievements/user/${userId}`,
      method: 'get',
    });
    return response.data;
  },
};
