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

export interface IdentityResponse {
  data: {
    firstName: string;
    lastName: string;
    address: Record<string, any>;
    auth0: string;
    phone: Array<{
      callingCode: string;
      role: string;
      phoneNumber: string;
    }>;
    companyName: string;
    roles: string[];
    dateOfBirth: string;
    id: string;
    email: string;
    group: any;
  };
  meta: {
    links: {
      address: string;
    };
    id: string;
  };
}

export interface PartitionKeyResponse {
  data: Array<{
    role: string;
    partitionKey: string;
    organization: string;
    registered: string;
    id: string;
    externals: any[];
    type: string;
    idCustomer: string;
  }>;
}
