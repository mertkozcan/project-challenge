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

  async getChallenges(type?: string, contentType?: string): Promise<Challenge[]> {
    const params: any = {};
    if (type) params.type = type;
    if (contentType) params.contentType = contentType;

    const res = await ApiService.fetchData<void, Challenge[]>({
      url: '/challenges',
      method: 'GET',
      params: Object.keys(params).length > 0 ? params : undefined,
    });
    return res.data;
  },

  async getChallengeById(id: string): Promise<Challenge> {
    const res = await ApiService.fetchData<void, Challenge>({
      url: `/challenges/${id}`,
      method: 'GET',
    });
    return res.data;
  },
  async getPopularChallenges(limit: number = 5): Promise<Challenge[]> {
    const res = await ApiService.fetchData<void, Challenge[]>({
      url: '/challenges/popular',
      method: 'GET',
      params: { limit },
    });
    return res.data;
  },
  async updateChallenge(id: string, data: Partial<Challenge>): Promise<Challenge> {
    const res = await ApiService.fetchData<Partial<Challenge>, Challenge>({
      url: `/challenges/${id}`,
      method: 'PUT',
      data,
    });
    return res.data;
  },

  async deleteChallenge(id: string): Promise<void> {
    await ApiService.fetchData<void, void>({
      url: `/challenges/${id}`,
      method: 'DELETE',
    });
  },
};
