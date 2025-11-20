import ApiService from '@/services/ApiService';

export interface Game {
  id: number;
  name: string;
  description: string;
  icon_url: string;
  created_at: string;
}

export const AdminService = {
  // Games
  async getGames(userId: string): Promise<Game[]> {
    const res = await ApiService.fetchData<void, Game[]>({
      url: '/admin/games',
      method: 'GET',
      params: { user_id: userId },
    });
    return res.data;
  },

  async createGame(name: string, description: string, iconUrl: string, userId: string): Promise<Game> {
    const res = await ApiService.fetchData<any, Game>({
      url: '/admin/games',
      method: 'POST',
      data: { name, description, icon_url: iconUrl, user_id: userId },
    });
    return res.data;
  },

  async deleteGame(id: number, userId: string): Promise<void> {
    await ApiService.fetchData({
      url: `/admin/games/${id}`,
      method: 'DELETE',
      params: { user_id: userId },
    });
  },

  // Official Content
  async createOfficialChallenge(data: any, userId: string): Promise<any> {
    const res = await ApiService.fetchData({
      url: '/admin/challenges',
      method: 'POST',
      data: { ...data, user_id: userId },
    });
    return res.data;
  },

  async createOfficialBuild(data: any, userId: string): Promise<any> {
    const res = await ApiService.fetchData({
      url: '/admin/builds',
      method: 'POST',
      data: { ...data, user_id: userId },
    });
    return res.data;
  },
};
