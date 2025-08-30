/**
 * Constant object containing all category key values
 */
export const CATEGORY_KEYS = {
  ABOUT: 'about',
  SHOP: 'shop',
  SUBSCRIBE: 'subscribe',
  BLOG: 'blog',

  PHYSICAL: 'physical',
  CREATIVE: 'creative',
  EDUCATIONAL: 'educational',
  MUSICAL: 'musical',
  NATURE: 'nature',
} as const;

/**
 * Type representing all possible category key values
 */
export type CategoryKey = (typeof CATEGORY_KEYS)[keyof typeof CATEGORY_KEYS];
