import ApiService from '@/services/ApiService';

export interface GameHistory {
  id: string;
  board_id: number;
  board_title: string;
  game_name: string;
  status: string;
  started_at: string;
  completed_at: string;
  winner_user_id: string;
  winner_username: string;
  winner_avatar: string;
  participant_count: number;
  duration_seconds: number;
}

export interface GameDetails {
  room: any;
  participants: any[];
  completionStats: Array<{
    user_id: string;
    cells_completed: number;
    first_completion: string;
    last_completion: string;
  }>;
}

export const BingoHistoryService = {
  async getMyGameHistory(userId: string, limit: number = 20): Promise<GameHistory[]> {
    const res = await ApiService.fetchData<void, GameHistory[]>({
      url: '/bingo/history/my-games',
      method: 'GET',
      params: { user_id: userId, limit },
    });
    return res.data;
  },

  async getGameDetails(roomId: string, userId: string): Promise<GameDetails> {
    const res = await ApiService.fetchData<void, GameDetails>({
      url: `/bingo/history/${roomId}`,
      method: 'GET',
      params: { user_id: userId },
    });
    return res.data;
  },
};
