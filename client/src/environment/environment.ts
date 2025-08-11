export const environment = {
  API_LIMIT: 100,
  CRM_BASE_URL: 'https://crm-develop.grainchain.io/api/v1',
  UNIT_CONVERSIONS_ENDPOINT: '/unit-conversions/units'
};

export const APP_CONFIG = environment;

// Number formatting utilities
export const formatNumber = (value: number | string | undefined | null): string => {
  // Handle null, undefined, or empty values
  if (value === null || value === undefined) {
    return '0.00';
  }
  
  if (typeof value === 'string') {
    if (value === '') return '0.00';
    const num = parseFloat(value);
    if (isNaN(num)) return '0.00';
    return num.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }
  
  if (isNaN(value)) return '0.00';
  
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

export const parseFormattedNumber = (value: string | undefined | null): number => {
  // Handle null, undefined, or empty values
  if (!value || typeof value !== 'string') {
    return 0;
  }
  
  // Remove commas and parse
  const cleaned = value.replace(/,/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

// Currency options
export const CURRENCY_OPTIONS = [
  { key: 'usd', value: 'usd', label: 'USD - US Dollar' },
  { key: 'eur', value: 'eur', label: 'EUR - Euro' },
  { key: 'mxn', value: 'mxn', label: 'MXN - Mexican Peso' }
];

// Number format configuration
export const NUMBER_FORMAT_CONFIG = {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
};