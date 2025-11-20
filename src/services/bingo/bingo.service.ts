import ApiService from '@/services/ApiService';

export interface BingoBoard {
  id: number;
  game_name: string;
  title: string;
  description: string;
  size: number;
  created_at: string;
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

export interface BingoBoardDetail {
  board: BingoBoard;
  cells: BingoCell[];
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
};
