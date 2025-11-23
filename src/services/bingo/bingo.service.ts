import ApiService from '@/services/ApiService';

export interface BingoBoard {
  id: number;
  game_name: string;
  title: string;
  description: string;
  size: number;
  created_at: string;
  banner_url?: string;
}

export interface BingoCell {
  id: number;
  board_id: number;
  row_index: number;
  col_index: number;
  task: string;
  status: 'PENDING' | 'APPROVED' | null;
  proof_url: string | null;
  progress_id: number | null;
}

export interface BingoRun {
  is_finished: boolean;
  elapsed_time: number;
  finished_at: string | null;
  new_achievements?: any[];
}

export interface BingoBoardDetail {
  board: BingoBoard;
  cells: BingoCell[];
  run: BingoRun;
}

export const BingoService = {
  async getBoards(): Promise<BingoBoard[]> {
    const res = await ApiService.fetchData<void, BingoBoard[]>({
      url: '/bingo',
      method: 'GET',
    });
    return res.data;
  },

  async getBoardDetail(boardId: string, userId: string = '1'): Promise<BingoBoardDetail> {
    const res = await ApiService.fetchData<void, BingoBoardDetail>({
      url: `/bingo/${boardId}`,
      method: 'GET',
      params: { user_id: userId },
    });
    return res.data;
  },

  async submitCellProof(cellId: number, userId: string, file: File): Promise<any> {
    const formData = new FormData();
    formData.append('media', file);
    formData.append('user_id', userId);

    const res = await ApiService.fetchData({
      url: `/bingo/cell/${cellId}/proof`,
      method: 'POST',
      data: formData,
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  async completeCellDirect(cellId: number, userId: string): Promise<any> {
    const res = await ApiService.fetchData({
      url: `/bingo/cell/${cellId}/complete`,
      method: 'POST',
      data: { user_id: userId },
    });
    return res.data;
  },

  async resetBoard(boardId: number, userId: string): Promise<any> {
    const res = await ApiService.fetchData({
      url: `/bingo/${boardId}/reset`,
      method: 'POST',
      data: { user_id: userId },
    });
    return res.data;
  },

  async finishRun(boardId: number, userId: string, elapsedTime: number): Promise<BingoRun> {
    const res = await ApiService.fetchData<any, BingoRun>({
      url: '/bingo/finish',
      method: 'POST',
      data: { user_id: userId, board_id: boardId, elapsed_time: elapsedTime },
    });
    return res.data;
  },

  async updateRunTime(boardId: number, userId: string, elapsedTime: number): Promise<BingoRun> {
    const res = await ApiService.fetchData<any, BingoRun>({
      url: '/bingo/update-time',
      method: 'POST',
      data: { user_id: userId, board_id: boardId, elapsed_time: elapsedTime },
    });
    return res.data;
  },
};
