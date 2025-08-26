export const environment = {
  API_LIMIT: Number(import.meta.env.VITE_API_LIMIT) || 100,
  CRM_BASE_URL:
    import.meta.env.CRM_BASE_URL || "https://crm-develop.grainchain.io/api/v1",
  TRM_BASE_URL:
    import.meta.env.VITE_TRM_BASE_URL || "https://trm-develop.grainchain.io/api/v1",
  UNIT_CONVERSIONS_ENDPOINT: "/unit-conversions/units",
  CRAFTMYPDF_BASE_URL:
    import.meta.env.VITE_CRAFTMYPDF_BASE_URL || "https://api.craftmypdf.com/v1",
  defaultCurrency: import.meta.env.VITE_DEFAULT_CURRENCY || "usd",
  TEMPLATE_ID: import.meta.env.VITE_TEMPLATE_ID || "5e177b2393797a28",
  CRAFTMYPDF_API_KEY:
    import.meta.env.VITE_CRAFTMYPDF_API_KEY ||
    "3364MTI3MTk6MTI3NzI6TDMwNjZMaG9odGhNMFg1bA=",
  NUMBER_FORMAT_PATTERN: "0,000.00" as const,
  NUMBER_ROUND_MODE: "truncate" as const,
  NUMBER_LOCATE: import.meta.env.VITE_NUMBER_LOCATE || 'en-US',
  NUMBER_MIN_DECIMALS: Number(import.meta.env.VITE_NUMBER_MIN_DECIMALS) || 2,
  NUMBER_MAX_DECIMALS: Number(import.meta.env.VITE_NUMBER_MAX_DECIMALS) || 4,
  PRICE_THRESHOLD_MIN: Number(import.meta.env.VITE_PRICE_THRESHOLD_MIN) || 0,
  PRICE_THRESHOLD_MAX: Number(import.meta.env.VITE_PRICE_THRESHOLD_MAX) || 0,
  SHOW_THRESHOLDS: import.meta.env.VITE_SHOW_THRESHOLDS === "true" || false,
};

export const APP_CONFIG = environment;

// Number format configuration
export const NUMBER_FORMAT_CONFIG = {
  locale: "en-US",
  formatPattern: "0,000.00" as const,
  roundMode: "truncate" as const,
  minDecimals: 2,
  maxDecimals: 4,
};

// Currency options
export const CURRENCY_OPTIONS = [
  { key: "usd", value: "USD", label: "USD" },
  { key: "mxn", value: "MXN", label: "MXN" },
];

// Measurement unit options
export const MEASUREMENT_UNIT_OPTIONS = [
  { key: 'tons', value: 'unit_tons', label: 'Toneladas / Tons' },
  { key: 'kg', value: 'unit_kg', label: 'Kilogramos / Kilograms' },
  { key: 'bushels', value: 'unit_bushels', label: 'Bushels' },
  { key: 'cwt', value: 'unit_cwt', label: 'Quintales / Hundredweight' },
  { key: 'mt', value: 'unit_mt', label: 'Toneladas Métricas / Metric Tons' }
];

// Pricing type options
export const PRICING_TYPE_OPTIONS = [
  { key: "fixed", value: "fixed", label: "Fixed" },
  { key: "basis", value: "basis", label: "Basis" },
];
