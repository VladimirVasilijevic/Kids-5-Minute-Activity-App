import { Activity } from '../app/models/activity.model';

/**
 * Mock activities data for testing purposes
 * Contains sample activities across different categories
 */
export const mockActivities: Activity[] = [
  {
    id: '001',
    title: 'Yoga for Kids',
    description: 'Simple 5 minute yoga session',
    videoUrl: 'url2',
    imageUrl: 'https://via.placeholder.com/150',
    category: 'physical',
    duration: '5 min',
  },
  {
    id: '002',
    title: 'Dance',
    description: 'Fun dance',
    videoUrl: '',
    imageUrl: 'https://via.placeholder.com/150',
    category: 'creative',
    duration: '5 min',
  },
  {
    id: '003',
    title: 'Memory Game',
    description: 'Game to practice memory',
    videoUrl: '',
    imageUrl: 'https://via.placeholder.com/150',
    category: 'educational',
    duration: '5 min',
  },
];
