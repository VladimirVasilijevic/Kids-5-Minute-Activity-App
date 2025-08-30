/**
 * Mock digital files for testing
 */
import { DigitalFile } from '../app/models/digital-file.model';

/**
 * Mock digital file for testing
 */
export const mockDigitalFile: DigitalFile = {
  id: 'file1',
  title: 'Test Digital File',
  description: 'A test digital file for unit testing',
  priceRSD: 1000,
  priceEUR: 10,
  fileUrl: 'https://example.com/test-file.pdf',
  fileSize: 1024000, // 1MB
  fileType: 'application/pdf',
  accessLevel: 'BASIC',
  language: 'sr',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  isActive: true,
  createdBy: 'admin123',
  tags: ['test', 'pdf', 'education'],
  previewImageUrl: 'https://example.com/preview.jpg',
  fileName: 'test-file.pdf'
};

/**
 * Mock digital file in English
 */
export const mockEnglishDigitalFile: DigitalFile = {
  id: 'file2',
  title: 'English Test File',
  description: 'An English test digital file',
  priceRSD: 1500,
  priceEUR: 15,
  fileUrl: 'https://example.com/english-file.pdf',
  fileSize: 2048000, // 2MB
  fileType: 'application/pdf',
  accessLevel: 'PREMIUM',
  language: 'en',
  createdAt: '2024-01-02T00:00:00Z',
  updatedAt: '2024-01-02T00:00:00Z',
  isActive: true,
  createdBy: 'admin123',
  tags: ['english', 'premium', 'education'],
  previewImageUrl: 'https://example.com/english-preview.jpg',
  fileName: 'english-file.pdf'
};

/**
 * Mock digital file with video type
 */
export const mockVideoFile: DigitalFile = {
  id: 'file3',
  title: 'Test Video File',
  description: 'A test video file for unit testing',
  priceRSD: 2000,
  priceEUR: 20,
  fileUrl: 'https://example.com/test-video.mp4',
  fileSize: 52428800, // 50MB
  fileType: 'video/mp4',
  accessLevel: 'BASIC',
  language: 'sr',
  createdAt: '2024-01-03T00:00:00Z',
  updatedAt: '2024-01-03T00:00:00Z',
  isActive: true,
  createdBy: 'admin123',
  tags: ['test', 'video', 'mp4'],
  previewImageUrl: 'https://example.com/video-preview.jpg',
  fileName: 'test-video.mp4'
};

/**
 * Array of mock digital files
 */
export const mockDigitalFiles: DigitalFile[] = [
  mockDigitalFile,
  mockEnglishDigitalFile,
  mockVideoFile
];
