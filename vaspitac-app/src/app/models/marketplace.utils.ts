import { ACCESS_LEVELS, CURRENCIES, PURCHASE_STATUSES, LANGUAGES, FILE_TYPES, CURRENCY_SYMBOLS } from './marketplace.constants';
import { DigitalFile } from './digital-file.model';

/**
 * Type guard to check if a value is a valid access level
 */
export function isValidAccessLevel(level: string): level is keyof typeof ACCESS_LEVELS {
  return Object.values(ACCESS_LEVELS).includes(level as any);
}

/**
 * Type guard to check if a value is a valid currency
 */
export function isValidCurrency(currency: string): currency is keyof typeof CURRENCIES {
  return Object.values(CURRENCIES).includes(currency as any);
}

/**
 * Type guard to check if a value is a valid purchase status
 */
export function isValidPurchaseStatus(status: string): status is keyof typeof PURCHASE_STATUSES {
  return Object.values(PURCHASE_STATUSES).includes(status as any);
}

/**
 * Type guard to check if a value is a valid language
 */
export function isValidLanguage(lang: string): lang is keyof typeof LANGUAGES {
  return Object.values(LANGUAGES).includes(lang as any);
}

/**
 * Type guard to check if a value is a valid file type
 */
export function isValidFileType(type: string): type is keyof typeof FILE_TYPES {
  return Object.values(FILE_TYPES).includes(type as any);
}

/**
 * Format file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Get currency symbol for a given currency code
 */
export function getCurrencySymbol(currency: string): string {
  return CURRENCY_SYMBOLS[currency as keyof typeof CURRENCY_SYMBOLS] || currency;
}

/**
 * Get price for a file based on user's language preference
 */
export function getPriceForLanguage(file: DigitalFile, language: string): number {
  return language === 'sr' ? file.priceRSD : file.priceEUR;
}

/**
 * Get currency for a given language
 */
export function getCurrencyForLanguage(language: string): 'RSD' | 'EUR' {
  return language === 'sr' ? 'RSD' : 'EUR';
}

/**
 * Format price with currency symbol
 */
export function formatPrice(amount: number, currency: string): string {
  const symbol = getCurrencySymbol(currency);
  if (currency === 'RSD') {
    return `${amount} ${symbol}`;
  } else {
    return `${symbol}${amount}`;
  }
}

/**
 * Generate a unique ID for new records
 */
export function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

/**
 * Get file type from filename
 */
export function getFileTypeFromName(filename: string): string {
  const extension = filename.split('.').pop()?.toUpperCase();
  return extension && isValidFileType(extension) ? extension : 'UNKNOWN';
}

/**
 * Validate file for upload
 */
export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

export function validateFileForUpload(file: File): FileValidationResult {
  // Check file size (50MB limit)
  if (file.size > 50 * 1024 * 1024) {
    return {
      isValid: false,
      error: 'File size must be less than 50MB'
    };
  }

  // Check file type
  const fileType = getFileTypeFromName(file.name);
  if (!isValidFileType(fileType)) {
    return {
      isValid: false,
      error: 'File type not supported. Please upload PDF, DOC, DOCX, XLS, XLSX, PPT, or PPTX files.'
    };
  }

  return { isValid: true };
}
