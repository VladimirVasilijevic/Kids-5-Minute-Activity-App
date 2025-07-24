import { Activity } from '../app/models/activity.model';
import { ContentVisibility } from '../app/models/content-visibility.model';

/**
 * Mock activities data for testing purposes
 * Contains sample activities across different categories
 */
export const mockActivities: Activity[] = [
  {
    id: '001',
    title: 'Yoga for Kids',
    description: 'A simple 5-minute yoga session for children to improve flexibility and mindfulness.',
    videoUrl: 'https://www.youtube.com/watch?v=example1',
    imageUrl: 'assets/images/yoga.jpg',
    category: 'Gross Motor',
    duration: '5 min',
    visibility: ContentVisibility.PUBLIC,
    isPremium: false,
  },
  {
    id: '002',
    title: 'Creative Drawing',
    description: 'Encourage creativity with this fun drawing activity.',
    videoUrl: 'https://www.youtube.com/watch?v=example2',
    imageUrl: 'assets/images/drawing.jpg',
    category: 'Fine Motor',
    duration: '10 min',
    visibility: ContentVisibility.PUBLIC,
    isPremium: false,
  },
  {
    id: '003',
    title: 'Building Blocks Challenge',
    description: 'A challenge to build the tallest tower with blocks.',
    videoUrl: 'https://www.youtube.com/watch?v=example3',
    imageUrl: 'assets/images/blocks.jpg',
    category: 'Cognitive',
    duration: '5 min',
    visibility: ContentVisibility.SUBSCRIBER,
    isPremium: true,
  },
];
