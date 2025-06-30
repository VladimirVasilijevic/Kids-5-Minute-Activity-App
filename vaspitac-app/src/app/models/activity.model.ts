export interface Activity {
  id: string
  title: { [lang: string]: string }
  description: { [lang: string]: string }
  imageUrl: string
  category: string
  duration: string
  ageGroup?: string
  materials?: string[]
  instructions?: string[]
  videoUrl?: { [lang: string]: string }
}

export interface ActivitiesData {
  version: string
  languages: string[]
  activities: Activity[]
} 