import axios from 'axios';

const API_URL = 'http://localhost:5000/api/notifications';

export interface Notification {
  id: string;
  user_id: string;
  type: 'GAME_INVITE' | 'ROOM_READY' | 'SYSTEM' | 'FRIEND_REQUEST';
  title: string;
  message: string;
  data: any;
  is_read: boolean;
  created_at: string;
}

const getNotifications = async (limit = 20, offset = 0) => {
  const token = localStorage.getItem('token');
  const response = await axios.get(`${API_URL}?limit=${limit}&offset=${offset}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

const getUnreadCount = async () => {
  const token = localStorage.getItem('token');
  const response = await axios.get(`${API_URL}/unread-count`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data.count;
};

const markAsRead = async (id: string) => {
  const token = localStorage.getItem('token');
  const response = await axios.put(`${API_URL}/${id}/read`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

const markAllAsRead = async () => {
  const token = localStorage.getItem('token');
  const response = await axios.put(`${API_URL}/read-all`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

const deleteNotification = async (id: string) => {
  const token = localStorage.getItem('token');
  const response = await axios.delete(`${API_URL}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

const NotificationService = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};

export default NotificationService;
