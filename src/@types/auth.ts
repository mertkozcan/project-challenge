export type SignInCredential = {
  username: string
  password: string
}

export type ForgotPasswordReq = {
  email: string
}

export interface SignInResponse {
  message: string,
  user: User
}

type User = {
  id: string
  username: string
  role: string
  email: string
  avatar_url?: string
  is_admin?: boolean
  level?: number
  total_xp?: number
}

export interface ResponseInfoObject {
  status: 'success' | 'failed';
  error_code?: number;
  message?: string;
}

export type SignUpResponse = SignInResponse

export type SignUpCredential = {
  username: string
  password: string
  email: string
  avatar_url?: string
}
