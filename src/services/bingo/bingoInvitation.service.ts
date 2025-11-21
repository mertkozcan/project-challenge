import ApiService from '@/services/ApiService';

export interface BingoInvitation {
  id: string;
  room_id: string;
  from_user_id: string;
  to_user_id: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
  created_at: string;
  // Joined data
  from_username?: string;
  from_avatar?: string;
  board_title?: string;
  game_name?: string;
}

export const BingoInvitationService = {
  async sendInvitation(roomId: string, toUserId: string, fromUserId: string): Promise<BingoInvitation> {
    const res = await ApiService.fetchData<{ roomId: string; toUserId: string; from_user_id: string }, BingoInvitation>({
      url: '/bingo/invitations/send',
      method: 'POST',
      data: { roomId, toUserId, from_user_id: fromUserId },
    });
    return res.data;
  },

  async getMyInvitations(userId: string): Promise<BingoInvitation[]> {
    const res = await ApiService.fetchData<void, BingoInvitation[]>({
      url: '/bingo/invitations/my-invitations',
      method: 'GET',
      params: { user_id: userId },
    });
    return res.data;
  },

  async respondToInvitation(invitationId: string, status: 'ACCEPTED' | 'DECLINED', userId: string): Promise<BingoInvitation> {
    const res = await ApiService.fetchData<{ status: string; user_id: string }, BingoInvitation>({
      url: `/bingo/invitations/${invitationId}/respond`,
      method: 'POST',
      data: { status, user_id: userId },
    });
    return res.data;
  },
};
