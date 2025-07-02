export const CATEGORY_KEYS = {
  ABOUT: 'about',
  SHOP: 'shop',
  BLOG: 'blog',
  TIPS: 'tips',
  PHYSICAL: 'physical',
  CREATIVE: 'creative',
  EDUCATIONAL: 'educational',
  MUSICAL: 'musical',
  NATURE: 'nature'
} as const;

export type CategoryKey = typeof CATEGORY_KEYS[keyof typeof CATEGORY_KEYS]; 