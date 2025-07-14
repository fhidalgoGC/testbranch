import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { LoginRequest, LoginResponse, IdentityResponse } from '../types/auth';

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

export const identityApi = createApi({
  reducerPath: 'identityApi',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_URL_IDENTITY || 'https://un4grlwfx2.execute-api.us-west-2.amazonaws.com/dev',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('jwt');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getIdentity: builder.query<IdentityResponse, void>({
      query: () => '/identity/customers',
    }),
  }),
});

export const { useLoginMutation } = authApi;
export const { useGetIdentityQuery } = identityApi;
