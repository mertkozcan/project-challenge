import ApiService from '../ApiService';

export interface BingoLeaderboardEntry {
  user_id: string;
  username: string;
  avatar_url: string;
  value: number; // wins, time in seconds, games count, or streak depending on type
  rank: number;
}

export interface UserBingoRanks {
  wins: number | null;
  fastest: number | null;
  games: number | null;
  streaks: number | null;
}

export type BingoLeaderboardType = 'wins' | 'fastest' | 'games' | 'streaks';

export const BingoLeaderboardService = {
  /**
   * Get bingo leaderboard by type
   */
  async getLeaderboard(type: BingoLeaderboardType, limit: number = 100): Promise<BingoLeaderboardEntry[]> {
    const response = await ApiService.fetchData<any, BingoLeaderboardEntry[]>({
      url: `/bingo/leaderboard/${type}`,
      method: 'get',
      params: { limit }
    });
    return response.data;
  },

  /**
   * Get user's ranks across all bingo leaderboards
   */
  async getUserRanks(userId: string): Promise<UserBingoRanks> {
    const response = await ApiService.fetchData<any, UserBingoRanks>({
      url: `/bingo/leaderboard/user/${userId}`,
      method: 'get'
    });
    return response.data;
  }
};
