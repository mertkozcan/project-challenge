import ApiService from '../ApiService';

export interface Friend {
  id: string;
  username: string;
  avatar_url?: string;
  trust_level?: number;
  status: 'PENDING' | 'ACCEPTED';
}

export interface FriendRequest {
  request_id: number;
  sender_id: string;
  username: string;
  avatar_url?: string;
  created_at: string;
}

class FriendServiceClass {
  /**
   * Get all friends for the current user
   */
  async getFriends(): Promise<Friend[]> {
    const res = await ApiService.fetchData<{}, Friend[]>({
      url: '/friends',
      method: 'GET',
    });
    return res.data;
  }

  /**
   * Get pending friend requests
   */
  async getPendingRequests(): Promise<FriendRequest[]> {
    const res = await ApiService.fetchData<{}, FriendRequest[]>({
      url: '/friends/pending',
      method: 'GET',
    });
    return res.data;
  }

  /**
   * Send a friend request
   */
  async sendRequest(friendId: string): Promise<void> {
    await ApiService.fetchData<{ friend_id: string }, {}>({
      url: '/friends/request',
      method: 'POST',
      data: { friend_id: friendId },
    });
  }

  /**
   * Accept a friend request
   */
  async acceptRequest(requestId: number): Promise<void> {
    await ApiService.fetchData<{}, {}>({
      url: `/friends/accept/${requestId}`,
      method: 'POST',
    });
  }

  /**
   * Remove a friend
   */
  async removeFriend(friendId: string): Promise<void> {
    await ApiService.fetchData<{}, {}>({
      url: `/friends/remove/${friendId}`,
      method: 'DELETE',
    });
  }

  /**
   * Search users by username
   */
  async searchUsers(query: string): Promise<Friend[]> {
    const res = await ApiService.fetchData<{}, Friend[]>({
      url: `/users/search?q=${encodeURIComponent(query)}`,
      method: 'GET',
    });
    return res.data;
  }
}

export const FriendService = new FriendServiceClass();

