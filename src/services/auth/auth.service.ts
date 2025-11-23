import { supabase } from '@/lib/supabase';
import ApiService from '../ApiService';

export interface AuthUser {
  id: string;
  email: string;
  username?: string;
}

export const AuthService = {
  async signUp(email: string, password: string, username: string) {
    // 1. Create auth user in Supabase
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) throw authError;

    // 2. Create user record in our database
    if (authData.user) {
      try {
        await ApiService.fetchData<any, any>({
          url: '/auth/signup',
          method: 'post',
          data: {
            id: authData.user.id,
            email,
            username,
          },
        });
      } catch (error) {
        throw new Error('Failed to create user profile');
      }
    }

    return authData;
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    // Fetch user profile from our database
    if (data.user && data.session) {
      const response = await ApiService.fetchData<void, any>({
        url: `/auth/profile/${data.user.id}`,
        method: 'get',
      });
      
      const profile = response.data;
      
      // Return format compatible with useAuth hook
      return {
        access_token: data.session.access_token,
        id: data.user.id,
        email: data.user.email || '',
        fullName: profile?.username || '',
        phoneNumber: '',
        authority: profile?.role === 'admin' ? ['admin'] : ['user'],
        profile,
      };
    }

    throw new Error('Login failed');
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      try {
        const response = await ApiService.fetchData<void, any>({
          url: `/auth/profile/${user.id}`,
          method: 'get',
        });
        const profile = response.data;
        
        return {
          ...user,
          profile,
        };
      } catch (error) {
        console.error('Failed to fetch user profile', error);
        return {
          ...user,
          profile: null
        };
      }
    }
    
    return null;
  },

  onAuthStateChange(callback: (user: any) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(session?.user || null);
    });
  },
};
