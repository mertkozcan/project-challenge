import ApiService from '@/services/ApiService';

export interface BingoRoom {
  id: string;
  board_id: number;
  host_user_id: string;
  status: 'WAITING' | 'IN_PROGRESS' | 'COMPLETED';
  max_players: number;
  winner_user_id?: string;
  started_at?: string;
  completed_at?: string;
  created_at: string;
  is_private: boolean;
  // Joined data
  board_title?: string;
  game_name?: string;
  board_size?: number;
  host_username?: string;
  host_avatar?: string;
  winner_username?: string;
  player_count?: number;
}

export interface RoomParticipant {
  id: string;
  room_id: string;
  user_id: string;
  is_ready: boolean;
  joined_at: string;
  username: string;
  avatar_url: string;
}

export interface BingoCellState {
  cell_id: number;
  row_index: number;
  col_index: number;
  task: string;
  completed_by_user_id?: string;
  completed_by_username?: string;
  completed_by_avatar?: string;
}

export interface CompleteCellResponse {
  completion: any;
  gameWon: boolean;
  winType?: 'row' | 'column';
  winIndex?: number;
}

export const BingoRoomService = {
  // Room Management
  async createRoom(boardId: number, userId: string, maxPlayers: number = 4, isPrivate: boolean = false, password?: string): Promise<BingoRoom> {
    const res = await ApiService.fetchData<{ boardId: number; maxPlayers: number; user_id: string; isPrivate: boolean; password?: string }, BingoRoom>({
      url: '/bingo/rooms/create',
      method: 'POST',
      data: { boardId, maxPlayers, user_id: userId, isPrivate, password },
    });
    return res.data;
  },

  async getAvailableRooms(): Promise<BingoRoom[]> {
    const res = await ApiService.fetchData<void, BingoRoom[]>({
      url: '/bingo/rooms/available',
      method: 'GET',
    });
    return res.data;
  },

  async getUserRooms(userId: string): Promise<BingoRoom[]> {
    const res = await ApiService.fetchData<void, BingoRoom[]>({
      url: '/bingo/rooms/my-rooms',
      method: 'GET',
      params: { user_id: userId },
    });
    return res.data;
  },

  async getRoomDetails(roomId: string): Promise<BingoRoom & { participants: RoomParticipant[] }> {
    const res = await ApiService.fetchData<void, BingoRoom & { participants: RoomParticipant[] }>({
      url: `/bingo/rooms/${roomId}`,
      method: 'GET',
    });
    return res.data;
  },

  async joinRoom(roomId: string, userId: string, password?: string): Promise<RoomParticipant> {
    const res = await ApiService.fetchData<{ user_id: string; password?: string }, RoomParticipant>({
      url: `/bingo/rooms/${roomId}/join`,
      method: 'POST',
      data: { user_id: userId, password },
    });
    return res.data;
  },

  async leaveRoom(roomId: string, userId: string): Promise<void> {
    await ApiService.fetchData<{ user_id: string }, void>({
      url: `/bingo/rooms/${roomId}/leave`,
      method: 'POST',
      data: { user_id: userId },
    });
  },

  async toggleReady(roomId: string, userId: string): Promise<RoomParticipant> {
    const res = await ApiService.fetchData<{ user_id: string }, RoomParticipant>({
      url: `/bingo/rooms/${roomId}/ready`,
      method: 'POST',
      data: { user_id: userId },
    });
    return res.data;
  },

  async startGame(roomId: string, userId: string): Promise<BingoRoom> {
    const res = await ApiService.fetchData<{ user_id: string }, BingoRoom>({
      url: `/bingo/rooms/${roomId}/start`,
      method: 'POST',
      data: { user_id: userId },
    });
    return res.data;
  },

  // Gameplay
  async completeCell(roomId: string, cellId: number, userId: string): Promise<CompleteCellResponse> {
    const res = await ApiService.fetchData<{ user_id: string }, CompleteCellResponse>({
      url: `/bingo/rooms/${roomId}/cells/${cellId}/complete`,
      method: 'POST',
      data: { user_id: userId },
    });
    return res.data;
  },

  async getBoardState(roomId: string): Promise<BingoCellState[]> {
    const res = await ApiService.fetchData<void, BingoCellState[]>({
      url: `/bingo/rooms/${roomId}/board-state`,
      method: 'GET',
    });
    return res.data;
  },
};
