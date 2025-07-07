export interface Activity {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  duration: string;
  ageGroup?: string;
  materials?: string[];
  instructions?: string[];
  videoUrl?: string;
}

export interface ActivitiesData {
  version: string;
  languages: string[];
  data: Activity[];
}
