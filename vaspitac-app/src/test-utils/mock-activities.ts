import { Activity, ActivitiesData } from '../app/models/activity.model'

export const mockActivitiesData: ActivitiesData = {
  version: '1.0.2',
  languages: ['sr', 'en'],
  activities: [
    {
      id: '001',
      title: { sr: 'Joga za decu', en: 'Yoga for Kids' },
      description: { sr: 'Jednostavna petominutna joga', en: 'Simple 5 minute yoga session' },
      videoUrl: { sr: 'url1', en: 'url2' }
    },
    {
      id: '002',
      title: { sr: 'Ples', en: 'Dance' },
      description: { sr: 'Zabavan ples', en: 'Fun dance' },
      videoUrl: { sr: '', en: '' }
    },
    {
      id: '003',
      title: { sr: 'Igra pamćenja', en: 'Memory Game' },
      description: { sr: 'Igra za vežbanje pamćenja', en: 'Game to practice memory' },
      videoUrl: { sr: '', en: '' }
    }
  ]
} 