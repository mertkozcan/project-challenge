import ApiService from '@/services/ApiService';
import { SignInResponse, SignUpCredential } from '@/@types/auth';

export const AuthService = {
  async signIn(username: string, password: string): Promise<SignInResponse> {
    const res = await ApiService.fetchData<{ username: string; password: string }, SignInResponse>({
      url: '/auth/signin',
      method: 'POST',
      data: { username, password },
    });
    return res.data;
  },

  async signUp(user: SignUpCredential): Promise<SignInResponse> {
    const res = await ApiService.fetchData<{ username: string; email: string; password: string; avatar_url?: string },SignInResponse>({
      url: '/auth/signup',
      method: 'POST',
      data: {
        username: user.username,
        email: user.email,
        password: user.password,
        avatar_url: user.avatar_url,
      },
    });
    return res.data;
  },
};
