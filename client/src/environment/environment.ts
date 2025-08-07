/**
 * Environment configuration
 * Centralizes all environment variables for the application
 */

// Auth0 Configuration
export const AUTH0_CONFIG = {
  url: import.meta.env.VITE_AUTH0_URL || '',
  audience: import.meta.env.VITE_AUTH0_AUDIENCE || '',
  grantType: import.meta.env.VITE_AUTH0_GRANT_TYPE || '',
  realm: import.meta.env.VITE_AUTH0_REALM || '',
  clientId: import.meta.env.VITE_AUTH0_CLIENT_ID || '',
  scope: import.meta.env.VITE_AUTH0_SCOPE || '',
} as const;

// API URLs
export const API_URLS = {
  identity: import.meta.env.VITE_URL_IDENTITY || '',
  crm: import.meta.env.VITE_URL_CRM || '',
} as const;

// Application Configuration
export const APP_CONFIG = {
  defaultCurrency: import.meta.env.VITE_DEFAULT_CURRENCY || 'usd',
  defaultLanguage: import.meta.env.VITE_DEFAULT_LANGUAGE || 'es',
  environment: import.meta.env.VITE_ENVIRONMENT || 'development',
  apiTimeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000'),
} as const;

// Supported currencies
export const SUPPORTED_CURRENCIES = ['usd', 'mxn'] as const;
export type SupportedCurrency = typeof SUPPORTED_CURRENCIES[number];

// Currency options for selects
export const CURRENCY_OPTIONS = [
  { key: 'usd', value: 'usd', label: 'USD' },
  { key: 'mxn', value: 'mxn', label: 'MXN' },
] as const;

// Validate that default currency is supported
if (!SUPPORTED_CURRENCIES.includes(APP_CONFIG.defaultCurrency as SupportedCurrency)) {
  console.warn(`Default currency "${APP_CONFIG.defaultCurrency}" is not supported. Using "usd" as fallback.`);
}

// Export environment object for easy access
export const environment = {
  auth0: AUTH0_CONFIG,
  api: API_URLS,
  app: APP_CONFIG,
} as const;