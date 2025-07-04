import { Activity } from '../app/models/activity.model'

export const mockActivities: Activity[] = [
  {
    id: '001',
    title: 'Yoga for Kids',
    description: 'Simple 5 minute yoga session',
    videoUrl: 'url2',
    imageUrl: 'mock-image-1.jpg',
    category: 'physical',
    duration: '5 min'
  },
  {
    id: '002',
    title: 'Dance',
    description: 'Fun dance',
    videoUrl: '',
    imageUrl: 'mock-image-2.jpg',
    category: 'creative',
    duration: '5 min'
  },
  {
    id: '003',
    title: 'Memory Game',
    description: 'Game to practice memory',
    videoUrl: '',
    imageUrl: 'mock-image-3.jpg',
    category: 'educational',
    duration: '5 min'
  }
] 