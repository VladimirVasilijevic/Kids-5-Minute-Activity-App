export interface Activity {
  id: string
  title: { [lang: string]: string }
  description: { [lang: string]: string }
  videoUrl: { [lang: string]: string }
}

export interface ActivitiesData {
  version: string
  languages: string[]
  activities: Activity[]
} 