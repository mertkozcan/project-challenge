import ApiService from '../ApiService';

export interface BuildRating {
  id: number;
  build_id: number;
  user_id: string;
  rating: number;
  created_at: string;
  updated_at: string;
}

export interface BuildComment {
  id: number;
  build_id: number;
  user_id: string;
  comment: string;
  created_at: string;
  updated_at: string;
  username: string;
  avatar_url?: string;
  trust_level?: number;
  level?: number;
}

export interface RatingStats {
  total_ratings: number;
  average_rating: number;
  five_stars: number;
  four_stars: number;
  three_stars: number;
  two_stars: number;
  one_star: number;
}

class BuildRatingService {
  /**
   * Rate a build (1-5 stars)
   */
  async rateBuild(buildId: number, rating: number): Promise<BuildRating> {
    const res = await ApiService.fetchData<{ rating: number }, { rating: BuildRating }>({
      url: `/builds/${buildId}/rate`,
      method: 'POST',
      data: { rating },
    });
    return res.data.rating;
  }

  /**
   * Get user's rating for a build
   */
  async getUserRating(buildId: number): Promise<number | null> {
    const res = await ApiService.fetchData<{}, { rating: number | null }>({
      url: `/builds/${buildId}/rating`,
      method: 'GET',
    });
    return res.data.rating;
  }

  /**
   * Get rating statistics for a build
   */
  async getRatingStats(buildId: number): Promise<RatingStats> {
    const res = await ApiService.fetchData<{}, RatingStats>({
      url: `/builds/${buildId}/rating-stats`,
      method: 'GET',
    });
    return res.data;
  }

  /**
   * Add a comment to a build
   */
  async addComment(buildId: number, comment: string): Promise<BuildComment> {
    const res = await ApiService.fetchData<{ comment: string }, { comment: BuildComment }>({
      url: `/builds/${buildId}/comments`,
      method: 'POST',
      data: { comment },
    });
    return res.data.comment;
  }

  /**
   * Get comments for a build
   */
  async getComments(buildId: number, limit: number = 50, offset: number = 0): Promise<BuildComment[]> {
    const res = await ApiService.fetchData<{}, BuildComment[]>({
      url: `/builds/${buildId}/comments?limit=${limit}&offset=${offset}`,
      method: 'GET',
    });
    return res.data;
  }

  /**
   * Delete a comment
   */
  async deleteComment(commentId: number): Promise<void> {
    await ApiService.fetchData<{}, {}>({
      url: `/builds/comments/${commentId}`,
      method: 'DELETE',
    });
  }
}

export default new BuildRatingService();
