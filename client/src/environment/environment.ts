/**
 * Environment configuration
 * Centralizes all environment variables for the application
 */

// Variables override (primera prioridad)
// Descomenta y define valores aquí para forzar configuraciones específicas
const OVERRIDE_CONFIG: {
  // Auth0
  auth0Url?: string;
  auth0Audience?: string;
  auth0GrantType?: string;
  auth0Realm?: string;
  auth0ClientId?: string;
  auth0Scope?: string;
  
  // API URLs
  identityUrl?: string;
  crmUrl?: string;
  
  // Application
  defaultCurrency?: string;
  defaultLanguage?: string;
  environment?: string;
  apiTimeout?: number;
  
  // Number Format
  thousandsSeparator?: string;
  decimalSeparator?: string;
  decimalPlaces?: number;
} = {
  // Auth0
  // auth0Url: 'https://custom-auth0.com/oauth/token',
  // auth0Audience: 'custom-audience',
  // auth0GrantType: 'custom-grant-type',
  // auth0Realm: 'custom-realm',
  // auth0ClientId: 'custom-client-id',
  // auth0Scope: 'custom-scope',
  
  // API URLs
  // identityUrl: 'https://custom-identity.com',
  // crmUrl: 'https://custom-crm.com',
  
  // Application
  // defaultCurrency: 'mxn',
  // defaultLanguage: 'en',
  // environment: 'production',
  // apiTimeout: 60000,
  
  // Number Format
  // thousandsSeparator: '.',
  // decimalSeparator: ',',
  // decimalPlaces: 2,
};

/**
 * Gets environment value with priority hierarchy:
 * 1. Override value (defined in code)
 * 2. Environment variable (.env file)
 * 3. Default fallback value
 */
function getEnvValue<T>(
  overrideValue: T | undefined,
  envKey: string,
  defaultValue: T
): T {
  // Primera prioridad: valor override definido en código
  if (overrideValue !== undefined) {
    return overrideValue;
  }
  
  // Segunda prioridad: variable de environment
  const envValue = import.meta.env[envKey];
  if (envValue !== undefined && envValue !== '') {
    // Para números, convertir a number
    if (typeof defaultValue === 'number') {
      const parsed = parseInt(envValue);
      return isNaN(parsed) ? defaultValue : (parsed as T);
    }
    return envValue as T;
  }
  
  // Tercera prioridad: valor por defecto
  return defaultValue;
}

// Auth0 Configuration
export const AUTH0_CONFIG = {
  url: getEnvValue(OVERRIDE_CONFIG.auth0Url, 'VITE_AUTH0_URL', ''),
  audience: getEnvValue(OVERRIDE_CONFIG.auth0Audience, 'VITE_AUTH0_AUDIENCE', ''),
  grantType: getEnvValue(OVERRIDE_CONFIG.auth0GrantType, 'VITE_AUTH0_GRANT_TYPE', ''),
  realm: getEnvValue(OVERRIDE_CONFIG.auth0Realm, 'VITE_AUTH0_REALM', ''),
  clientId: getEnvValue(OVERRIDE_CONFIG.auth0ClientId, 'VITE_AUTH0_CLIENT_ID', ''),
  scope: getEnvValue(OVERRIDE_CONFIG.auth0Scope, 'VITE_AUTH0_SCOPE', ''),
} as const;

// API URLs
export const API_URLS = {
  identity: getEnvValue(OVERRIDE_CONFIG.identityUrl, 'VITE_URL_IDENTITY', ''),
  crm: getEnvValue(OVERRIDE_CONFIG.crmUrl, 'VITE_URL_CRM', ''),
} as const;

// Application Configuration
export const APP_CONFIG = {
  defaultCurrency: getEnvValue(OVERRIDE_CONFIG.defaultCurrency, 'VITE_DEFAULT_CURRENCY', 'usd'),
  defaultLanguage: getEnvValue(OVERRIDE_CONFIG.defaultLanguage, 'VITE_DEFAULT_LANGUAGE', 'es'),
  environment: getEnvValue(OVERRIDE_CONFIG.environment, 'VITE_ENVIRONMENT', 'development'),
  apiTimeout: getEnvValue(OVERRIDE_CONFIG.apiTimeout, 'VITE_API_TIMEOUT', 30000),
} as const;

// Number Format Configuration
export const NUMBER_FORMAT_CONFIG = {
  thousandsSeparator: getEnvValue(OVERRIDE_CONFIG.thousandsSeparator, 'VITE_THOUSANDS_SEPARATOR', ','),
  decimalSeparator: getEnvValue(OVERRIDE_CONFIG.decimalSeparator, 'VITE_DECIMAL_SEPARATOR', '.'),
  decimalPlaces: getEnvValue(OVERRIDE_CONFIG.decimalPlaces, 'VITE_DECIMAL_PLACES', 4),
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

/**
 * Format a number according to the configured format settings
 * @param value - The number to format
 * @param decimals - Optional decimal places override
 * @returns Formatted number string
 */
export const formatNumber = (value: number | undefined | null, decimals?: number): string => {
  if (value === undefined || value === null || value === 0) return '';
  
  const decimalPlaces = decimals ?? NUMBER_FORMAT_CONFIG.decimalPlaces;
  const { thousandsSeparator, decimalSeparator } = NUMBER_FORMAT_CONFIG;
  
  // Convert to fixed decimal places
  const fixedValue = value.toFixed(decimalPlaces);
  
  // Split integer and decimal parts
  const [integerPart, decimalPart] = fixedValue.split('.');
  
  // Add thousands separator to integer part
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSeparator);
  
  // Combine with configured decimal separator
  return decimalPart ? `${formattedInteger}${decimalSeparator}${decimalPart}` : formattedInteger;
};

/**
 * Parse a formatted number string back to a number
 * @param formattedValue - The formatted string to parse
 * @returns Parsed number or null if invalid
 */
export const parseFormattedNumber = (formattedValue: string): number | null => {
  if (!formattedValue || formattedValue.trim() === '') return null;
  
  const { thousandsSeparator, decimalSeparator } = NUMBER_FORMAT_CONFIG;
  
  // Remove thousands separators and replace decimal separator with dot
  const normalizedValue = formattedValue
    .replace(new RegExp('\\' + thousandsSeparator, 'g'), '')
    .replace(decimalSeparator, '.');
  
  const parsed = parseFloat(normalizedValue);
  return isNaN(parsed) ? null : parsed;
};

// Export environment object for easy access
export const environment = {
  auth0: AUTH0_CONFIG,
  api: API_URLS,
  app: APP_CONFIG,
  numberFormat: NUMBER_FORMAT_CONFIG,
} as const;