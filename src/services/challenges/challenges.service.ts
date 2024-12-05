import ApiService from '@/services/ApiService';
import { Challenge } from '@/@types/challenge';

export const ChallengesService = {
  async getLatestChallenges(): Promise<Challenge[]> {
    const res = await ApiService.fetchData<void, Challenge[]>({
      url: '/challenges/latest',
      method: 'GET',
    });
    return res.data;
  },
};
