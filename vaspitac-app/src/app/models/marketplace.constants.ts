/**
 * Access levels for digital files
 */
export const ACCESS_LEVELS = {
  BASIC: 'BASIC',
  PREMIUM: 'PREMIUM'
} as const;

export type AccessLevel = typeof ACCESS_LEVELS[keyof typeof ACCESS_LEVELS];

/**
 * Supported currencies
 */
export const CURRENCIES = {
  RSD: 'RSD',
  EUR: 'EUR'
} as const;

export type Currency = typeof CURRENCIES[keyof typeof CURRENCIES];

/**
 * Purchase status options
 */
export const PURCHASE_STATUSES = {
  PENDING: 'PENDING',
  VERIFIED: 'VERIFIED',
  REJECTED: 'REJECTED'
} as const;

export type PurchaseStatus = typeof PURCHASE_STATUSES[keyof typeof PURCHASE_STATUSES];

/**
 * Supported languages
 */
export const LANGUAGES = {
  EN: 'en',
  SR: 'sr'
} as const;

export type Language = typeof LANGUAGES[keyof typeof LANGUAGES];

/**
 * Supported file types
 */
export const FILE_TYPES = {
  PDF: 'PDF',
  DOC: 'DOC',
  DOCX: 'DOCX',
  XLS: 'XLS',
  XLSX: 'XLSX',
  PPT: 'PPT',
  PPTX: 'PPTX'
} as const;

export type FileType = typeof FILE_TYPES[keyof typeof FILE_TYPES];

/**
 * Default pagination settings
 */
export const DEFAULT_PAGINATION = {
  pageSize: 12,
  maxPageSize: 50,
  adminPageSize: 20
} as const;

/**
 * File size limits (in bytes)
 */
export const FILE_SIZE_LIMITS = {
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
  MAX_IMAGE_SIZE: 5 * 1024 * 1024   // 5MB for preview images
} as const;

/**
 * Currency symbols
 */
export const CURRENCY_SYMBOLS = {
  RSD: 'din',
  EUR: '€'
} as const;
