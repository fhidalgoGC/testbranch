export interface User {
  email: string;
  name?: string;
  picture?: string;
}

export interface Tokens {
  accessToken: string;
  refreshToken: string;
  idToken: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  tokens: Tokens | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  id_token: string;
  scope: string;
  expires_in: number;
  token_type: string;
}
