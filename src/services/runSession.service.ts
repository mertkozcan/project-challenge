import ApiService from '@/services/ApiService';

export interface RunSession {
  id: string;
  user_id: string;
  game_name: string;
  challenge_id?: number;
  bingo_board_id?: number;
  run_code: string;
  display_username: string;
  status: 'ACTIVE' | 'COMPLETED' | 'ABANDONED';
  started_at: string;
  completed_at?: string;
  expires_at: string;
}

export interface StartRunSessionRequest {
  userId: string;
  gameName: string;
  challengeId?: number;
  bingoBoardId?: number;
}

export const RunSessionService = {
  /**
   * Start a new run session
   */
  async startSession(data: StartRunSessionRequest): Promise<RunSession> {
    const res = await ApiService.fetchData<StartRunSessionRequest, { session: RunSession }>({
      url: '/run-sessions/start',
      method: 'POST',
      data,
    });
    return res.data.session;
  },

  /**
   * Get active session for a user
   */
  async getActiveSession(userId: string): Promise<RunSession | null> {
    try {
      const res = await ApiService.fetchData<void, { session: RunSession }>({
        url: `/run-sessions/active/${userId}`,
        method: 'GET',
      });
      return res.data.session;
    } catch (error: any) {
      // Return null if no active session (404)
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  /**
   * Cancel a run session
   */
  async cancelSession(sessionId: string): Promise<RunSession> {
    const res = await ApiService.fetchData<void, { session: RunSession }>({
      url: `/run-sessions/${sessionId}/cancel`,
      method: 'POST',
    });
    return res.data.session;
  },

  /**
   * Complete a run session
   */
  async completeSession(sessionId: string): Promise<RunSession> {
    const res = await ApiService.fetchData<void, { session: RunSession }>({
      url: `/run-sessions/${sessionId}/complete`,
      method: 'POST',
    });
    return res.data.session;
  },

  /**
   * Get user's session history
   */
  async getSessionHistory(userId: string, limit: number = 20): Promise<RunSession[]> {
    const res = await ApiService.fetchData<void, { sessions: RunSession[] }>({
      url: `/run-sessions/history/${userId}`,
      method: 'GET',
      params: { limit },
    });
    return res.data.sessions;
  },
};
