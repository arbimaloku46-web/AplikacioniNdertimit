import { Project } from './types';

export const MOCK_PROJECTS: Project[] = [
  {
    id: 'p_kupa',
    name: 'Kupa Paskuqan',
    clientName: 'Ndërtimi Group',
    location: 'Paskuqan, Tirana',
    thumbnailUrl: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=1000&auto=format&fit=crop',
    accessCode: '1111',
    description: 'A premier residential development in the heart of Paskuqan. Featuring sustainable architecture, panoramic terraces, and state-of-the-art smart home integration.',
    updates: [
      {
        weekNumber: 10,
        date: '2024-03-01',
        title: 'Facade Installation Phase 1',
        summary: 'The installation of the ventilated facade system has begun on the East Wing. Thermal insulation layers are 80% complete. Drone surveys confirm the structural integrity of the rooftop pergola framework.',
        splatUrl: 'https://poly.cam/capture/placeholder-kupa', 
        media: [
            { id: 'k1', type: 'video', url: 'https://www.w3schools.com/html/mov_bbb.mp4', thumbnail: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=1000', description: 'Drone Orbit - Facade Progress' },
            { id: 'k2', type: 'photo', url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=1000', description: 'Insulation Detail' },
            { id: 'k3', type: '360', url: 'https://images.unsplash.com/photo-1557971370-e7298ee473fb?q=80&w=2000', description: 'Model Apartment Interior 360' }
        ],
        stats: {
            completion: 72,
            workersOnSite: 55,
            weatherConditions: 'Sunny, 18°C'
        }
      },
      {
        weekNumber: 9,
        date: '2024-02-22',
        title: 'Rooftop Waterproofing',
        summary: 'Completed the triple-layer waterproofing membrane on the main roof. HVAC ducting installation is underway on floors 4-6.',
        splatUrl: '',
        media: [
            { id: 'k4', type: 'photo', url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=1000', description: 'Waterproofing Inspection' }
        ],
        stats: {
            completion: 68,
            workersOnSite: 48,
            weatherConditions: 'Partly Cloudy, 15°C'
        }
      }
    ]
  },
  {
    id: 'p_apex',
    name: 'Apex Tower',
    clientName: 'City Skyline LLC',
    location: 'Blloku, Tirana',
    thumbnailUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1000',
    accessCode: '1111',
    description: 'High-rise commercial center with luxury office spaces.',
    updates: [
      {
        weekNumber: 4,
        date: '2024-02-20',
        title: 'Foundation Pour',
        summary: 'Massive concrete pour for the main raft foundation completed successfully over a 24-hour continuous operation.',
        splatUrl: '',
        media: [
            { id: 'a1', type: 'photo', url: 'https://images.unsplash.com/photo-1590579492902-42240d7e6d4b?q=80&w=1000', description: 'Foundation Overview' }
        ],
        stats: {
            completion: 15,
            workersOnSite: 80,
            weatherConditions: 'Rainy, 12°C'
        }
      }
    ]
  }
];