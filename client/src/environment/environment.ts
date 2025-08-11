export const environment = {
  API_LIMIT: 100,
  CRM_BASE_URL: 'https://crm-develop.grainchain.io/api/v1',
  UNIT_CONVERSIONS_ENDPOINT: '/unit-conversions/units'
};

export const APP_CONFIG = environment;

// Number format configuration
export const NUMBER_FORMAT_CONFIG = {
  locale: 'en-US',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  decimalSeparator: '.',
  thousandsSeparator: ',',
  formatPattern: "0,000.00" as const,
  roundMode: "up" as const,
  minDecimals: 2,
  maxDecimals: 2
};

// Import the new number formatter
import { formatNumber as formatNumberWithPattern, parseFormattedNumber as parseFormattedNumberWithPattern } from '@/lib/numberFormatter';

// Number formatting utilities using the new formatter
export const formatNumber = (value: number | string | undefined | null): string => {
  // Return empty string for null, undefined, empty string, or 0
  if (value === null || value === undefined || value === '' || value === 0) {
    return '';
  }
  
  return formatNumberWithPattern({
    minDecimals: NUMBER_FORMAT_CONFIG.minDecimals,
    maxDecimals: NUMBER_FORMAT_CONFIG.maxDecimals,
    value: value,
    formatPattern: NUMBER_FORMAT_CONFIG.formatPattern,
    roundMode: NUMBER_FORMAT_CONFIG.roundMode
  });
};

export const parseFormattedNumber = (value: string | undefined | null): number => {
  return parseFormattedNumberWithPattern(value, NUMBER_FORMAT_CONFIG.formatPattern);
};

// Currency options
export const CURRENCY_OPTIONS = [
  { key: 'usd', value: 'usd', label: 'USD - US Dollar' },
  { key: 'eur', value: 'eur', label: 'EUR - Euro' },
  { key: 'mxn', value: 'mxn', label: 'MXN - Mexican Peso' },
  { key: 'gtq', value: 'gtq', label: 'GTQ - Guatemalan Quetzal' },
  { key: 'cop', value: 'cop', label: 'COP - Colombian Peso' }
];

// Pricing type options
export const PRICING_TYPE_OPTIONS = [
  { key: 'fixed', value: 'fixed', label: 'Fixed' },
  { key: 'basis', value: 'basis', label: 'Basis' }
];

// Quality parameter types
export const QUALITY_PARAMETER_TYPES = [
  { key: 'min', value: 'min', label: 'Minimum' },
  { key: 'max', value: 'max', label: 'Maximum' },
  { key: 'range', value: 'range', label: 'Range' }
];

// Payment terms options
export const PAYMENT_TERMS_OPTIONS = [
  { key: 'cash', value: 'cash', label: 'Cash' },
  { key: 'net_30', value: 'net_30', label: 'Net 30' },
  { key: 'net_60', value: 'net_60', label: 'Net 60' },
  { key: 'net_90', value: 'net_90', label: 'Net 90' }
];

// Contract status options
export const CONTRACT_STATUS_OPTIONS = [
  { key: 'draft', value: 'draft', label: 'Draft' },
  { key: 'pending', value: 'pending', label: 'Pending' },
  { key: 'active', value: 'active', label: 'Active' },
  { key: 'completed', value: 'completed', label: 'Completed' },
  { key: 'cancelled', value: 'cancelled', label: 'Cancelled' }
];