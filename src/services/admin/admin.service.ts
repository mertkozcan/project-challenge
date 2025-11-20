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
  async getGames(): Promise<Game[]> {
    const res = await ApiService.fetchData<void, Game[]>({
      url: '/admin/games',
      method: 'GET',
      params: { user_id: '1' }, // Hardcoded admin check
    });
    return res.data;
  },

  async createGame(name: string, description: string, iconUrl: string): Promise<Game> {
    const res = await ApiService.fetchData<any, Game>({
      url: '/admin/games',
      method: 'POST',
      data: { name, description, icon_url: iconUrl, user_id: '1' },
    });
    return res.data;
  },

  async deleteGame(id: number): Promise<void> {
    await ApiService.fetchData({
      url: `/admin/games/${id}`,
      method: 'DELETE',
      params: { user_id: '1' },
    });
  },

  // Official Content
  async createOfficialChallenge(data: any): Promise<any> {
    const res = await ApiService.fetchData({
      url: '/admin/challenges',
      method: 'POST',
      data: { ...data, user_id: '1' },
    });
    return res.data;
  },

  async createOfficialBuild(data: any): Promise<any> {
    const res = await ApiService.fetchData({
      url: '/admin/builds',
      method: 'POST',
      data: { ...data, user_id: '1' },
    });
    return res.data;
  },
};
