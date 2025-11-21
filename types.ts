
export interface MediaItem {
  id: string;
  type: 'photo' | 'video' | '360';
  url: string;
  thumbnail?: string;
  description: string;
}

export interface WeeklyUpdate {
  weekNumber: number;
  date: string;
  title: string;
  summary: string;
  splatUrl?: string; // URL to polycam or similar web viewer
  media: MediaItem[];
  stats: {
    completion: number;
    workersOnSite: number;
    weatherConditions: string;
  };
}

export interface Project {
  id: string;
  name: string;
  clientName: string;
  location: string;
  thumbnailUrl: string;
  accessCode: string; // The password
  updates: WeeklyUpdate[];
  description: string;
}

export interface User {
  name: string;
  mobile: string;
  password?: string; // In a real app, never store plain text passwords
}

export enum AppView {
  HOME = 'HOME',
  PROJECT_DETAIL = 'PROJECT_DETAIL',
  PROFILE = 'PROFILE'
}
