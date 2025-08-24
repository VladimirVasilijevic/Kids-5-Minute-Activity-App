import { ContentVisibility } from './content-visibility.model';

/**
 * Represents a digital file available for purchase
 */
export interface DigitalFile {
  /** Unique identifier for the file */
  id: string;
  /** Title of the file */
  title: string;
  /** Description of the file (supports Markdown) */
  description: string;
  /** Price in Serbian Dinars */
  priceRSD: number;
  /** Price in Euros */
  priceEUR: number;
  /** URL to the file in Firebase Storage */
  fileUrl: string;
  /** File size in bytes */
  fileSize: number;
  /** File type (PDF, DOC, DOCX, etc.) */
  fileType: string;
  /** Access level for pricing tier */
  accessLevel: 'BASIC' | 'PREMIUM';
  /** Language of the file content */
  language: 'en' | 'sr';
  /** Creation timestamp */
  createdAt: string;
  /** Last update timestamp */
  updatedAt: string;
  /** Whether the file is active and available for purchase */
  isActive: boolean;
  /** Admin user ID who created the file */
  createdBy: string;
  /** Optional tags for categorization */
  tags?: string[];
  /** Optional preview image URL */
  previewImageUrl?: string;
  /** Original filename */
  fileName?: string;
}

/**
 * Form data structure for creating/editing digital files
 */
export interface DigitalFileFormData {
  /** Title of the file */
  title: string;
  /** Description of the file (supports Markdown) */
  description: string;
  /** Price in Serbian Dinars */
  priceRSD: number;
  /** Price in Euros */
  priceEUR: number;
  /** Access level for pricing tier */
  accessLevel: 'BASIC' | 'PREMIUM';
  /** Language of the file content */
  language: 'en' | 'sr';
  /** Optional tags for categorization */
  tags?: string[];
}

/**
 * Statistics for digital files
 */
export interface DigitalFileStats {
  /** Total number of files */
  totalFiles: number;
  /** Number of active files */
  activeFiles: number;
  /** Number of files by language */
  filesByLanguage: {
    en: number;
    sr: number;
  };
  /** Number of files by access level */
  filesByAccessLevel: {
    BASIC: number;
    PREMIUM: number;
  };
  /** Total file storage size in bytes */
  totalStorageSize: number;
}
