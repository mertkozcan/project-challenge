import ApiService from '../ApiService';

export interface Proof {
  id: number;
  user_id: string;
  challenge_id: number;
  media_url: string;
  media_type: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  score: number;
  created_at: string;
  likes_count?: number;
  placement?: number;
  username?: string;
  challenge_name?: string;
  game_name?: string;
  video_url?: string;
}

class ProofService {
  static async getPendingProofs(): Promise<Proof[]> {
    const response = await ApiService.fetchData<void, Proof[]>({
      url: '/proofs/pending',
      method: 'GET',
    });
    return response.data;
  }

  static async getProofsByChallenge(challengeId: string | number): Promise<Proof[]> {
    const response = await ApiService.fetchData<void, Proof[]>({
      url: `/proofs/${challengeId}`,
      method: 'GET',
    });
    return response.data;
  }

  static async approveProof(proofId: number, score: number = 0): Promise<any> {
    const response = await ApiService.fetchData({
      url: `/proofs/${proofId}/approve`,
      method: 'PUT',
      data: { score },
    });
    return response.data;
  }

  static async rejectProof(proofId: number): Promise<any> {
    const response = await ApiService.fetchData({
      url: `/proofs/${proofId}/reject`,
      method: 'PUT',
    });
    return response.data;
  }

  static async getUserChallengeProof(userId: string, challengeId: string | number): Promise<Proof | null> {
    const response = await ApiService.fetchData<void, Proof>({
      url: `/proofs/user/${userId}/challenge/${challengeId}`,
      method: 'GET',
    });
    return response.data;
  }

  static async voteProof(proofId: number, userId: string): Promise<{ liked: boolean; likesCount: number }> {
    const response = await ApiService.fetchData<{ userId: string }, { liked: boolean; likesCount: number }>({
      url: `/proofs/${proofId}/vote`,
      method: 'POST',
      data: { userId },
    });
    return response.data;
  }
}

export default ProofService;
