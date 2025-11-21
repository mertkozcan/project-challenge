import ApiService from '@/services/ApiService';

export interface Notification {
  id: number;
  user_id: string;
  type: 'PROOF_APPROVED' | 'PROOF_REJECTED' | 'SYSTEM';
  title: string;
  message: string;
  is_read: boolean;
  related_id: number | null;
  created_at: string;
}

export const NotificationService = {
  async getNotifications(userId: string): Promise<Notification[]> {
    const res = await ApiService.fetchData<void, Notification[]>({
      url: `/notifications/${userId}`,
      method: 'GET',
    });
    return res.data;
  },

  async getUnreadCount(userId: string): Promise<number> {
    const res = await ApiService.fetchData<void, { count: number }>({
      url: `/notifications/${userId}/unread-count`,
      method: 'GET',
    });
    return res.data.count;
  },

  async markAsRead(id: number, userId: string): Promise<void> {
    await ApiService.fetchData({
      url: `/notifications/${id}/read`,
      method: 'PUT',
      data: { userId },
    });
  },

  async markAllAsRead(userId: string): Promise<void> {
    await ApiService.fetchData({
      url: `/notifications/${userId}/read-all`,
      method: 'PUT',
    });
  },
};
