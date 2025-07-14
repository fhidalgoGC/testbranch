import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { LoginRequest, LoginResponse } from '../types/auth';

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_AUTH0_URL || 'https://grainchaindev.auth0.com',
  }),
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/oauth/token',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: {
          username: credentials.email,
          password: credentials.password,
          audience: import.meta.env.VITE_AUTH0_AUDIENCE || 'https://grainchaindev.auth0.com/userinfo',
          grant_type: import.meta.env.VITE_AUTH0_GRANT_TYPE || 'http://auth0.com/oauth/grant-type/password-realm',
          realm: import.meta.env.VITE_AUTH0_REALM || 'Username-Password-Authentication',
          client_id: import.meta.env.VITE_AUTH0_CLIENT_ID || 'f9jw9xsL2Sje2LwHsEZSxnpMupH0QiNJ',
          scope: import.meta.env.VITE_AUTH0_SCOPE || 'openid offline_access',
        },
      }),
    }),
  }),
});

export const { useLoginMutation } = authApi;
