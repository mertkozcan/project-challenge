import ApiService from '@/services/ApiService';
import { Game } from '@/services/admin/admin.service';

export const GamesService = {
  async getAllGames(): Promise<Game[]> {
    const res = await ApiService.fetchData<void, Game[]>({
      url: '/games',
      method: 'GET',
    });
    return res.data;
  },
};
