import ApiService from '@/services/ApiService';

export interface Notification {
  id: number;
  user_id: string;
  type: 'PROOF_APPROVED' | 'PROOF_REJECTED' | 'SYSTEM' | 'GAME_INVITE' | 'ROOM_READY' | 'FRIEND_REQUEST';
  title: string;
  message: string;
  is_read: boolean;
  related_id: number | null;
  data?: any;
  created_at: string;
}

export const NotificationService = {
  async getNotifications(userId: string, limit = 20, offset = 0): Promise<Notification[]> {
    const res = await ApiService.fetchData<void, Notification[]>({
      url: `/notifications`,
      method: 'GET',
      params: { limit, offset },
      headers: { 'x-user-id': userId },
    });
    return res.data;
  },

  async getUnreadCount(userId: string): Promise<number> {
    const res = await ApiService.fetchData<void, { count: number }>({
      url: `/notifications/unread-count`,
      method: 'GET',
      headers: { 'x-user-id': userId },
    });
    return res.data.count;
  },

  async markAsRead(id: number, userId: string): Promise<void> {
    await ApiService.fetchData({
      url: `/notifications/${id}/read`,
      method: 'PUT',
      headers: { 'x-user-id': userId },
    });
  },

  async markAllAsRead(userId: string): Promise<void> {
    await ApiService.fetchData({
      url: `/notifications/read-all`,
      method: 'PUT',
      headers: { 'x-user-id': userId },
    });
  },

  async deleteNotification(id: number, userId: string): Promise<void> {
    await ApiService.fetchData({
      url: `/notifications/${id}`,
      method: 'DELETE',
      headers: { 'x-user-id': userId },
    });
  },
};
