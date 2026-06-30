
export interface Hotspot {
  id: string;
  x: number;
  y: number;
  title: string;
  description: string;
  status?: 'pending' | 'in-progress' | 'completed';
}

export interface MediaItem {
  id: string;
  type: 'photo' | 'video' | '360';
  url: string;
  thumbnail?: string;
  description: string;
  category?: 'inside' | 'outside' | 'drone' | 'interior' | 'other';
  hotspots?: Hotspot[];
}

export interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  text: string;
  timestamp: string;
  isAdmin: boolean;
}

export interface WeeklyUpdate {
  weekNumber: number;
  date: string;
  title: string;
  summary: string;
  splatUrl?: string; // Polycam / 3D Render
  floorfyUrl?: string; // Floorfy / 360 Tour
  status?: 'draft' | 'published';
  comments?: Comment[];
  media: MediaItem[];
  stats: {
    completion: number;
    workersOnSite: number;
    weatherConditions: string;
  };
}

export interface Unit {
  id: string;
  name: string;
  hitbox: { x: number; y: number; width: number; height: number }; // Percentage based 0-100
  detailsPlanUrl?: string;
  virtualTourUrl?: string;
  specs?: {
    beds: number;
    baths: number;
    area: number; // sqm
    price: string;
  };
  status: 'available' | 'reserved' | 'sold';
}

export interface Floor {
  id: string;
  name: string;
  level: number;
  hitbox: { x: number; y: number; width: number; height: number }; // Percentage based 0-100 on the main render
  floorPlanUrl: string;
  units: Unit[];
}

export interface InteractiveBuilding {
  renderUrl: string;
  floors: Floor[];
}

export interface Project {
  id: string;
  name: string;
  clientName: string;
  location: string;
  coordinates?: { lat: number; lng: number };
  thumbnailUrl: string;
  accessCode: string;
  updates: WeeklyUpdate[];
  description: string;
  interactiveBuilding?: InteractiveBuilding;
}

export interface User {
  uid: string;
  name: string;
  username: string;
  email: string | null;
  photoURL: string | null;
  countryCode?: string;
  isAdmin?: boolean;
}

export enum AppView {
  HOME = 'HOME',
  PROJECT_DETAIL = 'PROJECT_DETAIL',
  PROFILE = 'PROFILE'
}
