import ApiService from '@/services/ApiService';
import { Build } from '@/@types/build';

export const BuildsService = {
  async getBuilds(contentType?: string, game?: string): Promise<Build[]> {
    const params: any = {};
    if (game) params.game = game;
    if (contentType) params.contentType = contentType;

    const res = await ApiService.fetchData<void, Build[]>({
      url: '/builds',
      method: 'GET',
      params: Object.keys(params).length > 0 ? params : undefined,
    });
    return res.data;
  },

  async getBuildById(id: string): Promise<Build> {
    const res = await ApiService.fetchData<void, Build>({
      url: `/builds/${id}`,
      method: 'GET',
    });
    return res.data;
  },

  async createBuild(data: Partial<Build>): Promise<Build> {
    const res = await ApiService.fetchData<Partial<Build>, Build>({
      url: '/builds',
      method: 'POST',
      data,
    });
    return res.data;
  },
  async deleteBuild(id: number): Promise<void> {
    await ApiService.fetchData<void, void>({
      url: `/builds/${id}`,
      method: 'DELETE',
    });
  },
};
