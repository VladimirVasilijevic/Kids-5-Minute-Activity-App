import { AboutContent } from '../app/models/about-content.model';

export const mockAboutContent: AboutContent = {
  name: 'Test Name',
  role: 'Test Role',
  bioParagraphs: ['Test bio paragraph'],
  experiences: [{ title: 'Test Experience', description: 'Test description', dateRange: '2020-2023' }],
  email: 'test@example.com',
  phone: '+1234567890',
  location: 'Test Location',
  profileImageUrl: 'http://example.com/profile.jpg',
  lastUpdated: new Date().toISOString(),
}; 