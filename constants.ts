import { Project } from './types';

export const MOCK_PROJECTS: Project[] = [
  {
    id: 'p_1',
    name: 'Tirana Riverside Complex',
    clientName: 'Eagle Investments Sh.p.k',
    location: 'Tirana, Albania',
    thumbnailUrl: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80',
    accessCode: '1111',
    description: 'A luxury mixed-use development featuring 3 residential towers and a shopping center located near the Lana River.',
    updates: [
      {
        weekNumber: 14,
        date: '2024-03-22',
        title: 'Facade Installation Begins',
        summary: 'Installation of the glass facade has commenced on Tower A (Floors 1-4). Internal partitioning in the commercial sector is 60% complete.',
        media: [
          {
            id: 'm1',
            type: 'photo',
            url: 'https://images.unsplash.com/photo-1590486803833-1c5dc8ce2ac6?auto=format&fit=crop&q=80',
            description: 'Facade Bracket Installation'
          },
          {
            id: 'm2',
            type: 'photo',
            url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80',
            description: 'Site Overview from Crane'
          }
        ],
        stats: {
          completion: 42,
          workersOnSite: 128,
          weatherConditions: 'Sunny, 18°C'
        },
        splatUrl: 'https://poly.cam/capture/6266a808-2560-4a1e-8361-805579007155'
      },
      {
        weekNumber: 13,
        date: '2024-03-15',
        title: 'Structural Top-out Phase 1',
        summary: 'Concrete pouring for the 15th floor slab of Tower A is complete. Rebar installation for the roof parapet is underway.',
        media: [],
        stats: {
            completion: 40,
            workersOnSite: 115,
            weatherConditions: 'Cloudy, 14°C'
        }
      }
    ]
  },
  {
    id: 'p_2',
    name: 'Vlora Marina Resort',
    clientName: 'Seaside Developers Ltd',
    location: 'Vlora, Albania',
    thumbnailUrl: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&q=80',
    accessCode: '2222',
    description: 'Exclusive beachfront resort with private marina access and 5-star amenities.',
    updates: [
       {
        weekNumber: 8,
        date: '2024-03-20',
        title: 'Foundation Piling Complete',
        summary: 'All deep foundation piles have been driven. Excavation for the underground parking garage has started.',
        media: [
             {
            id: 'm3',
            type: 'photo',
            url: 'https://images.unsplash.com/photo-1621251347672-03f4f0394c8e?auto=format&fit=crop&q=80',
            description: 'Excavation Progress'
          }
        ],
        stats: {
            completion: 15,
            workersOnSite: 65,
            weatherConditions: 'Windy, 16°C'
        }
      }
    ]
  }
];

export const COUNTRIES = [
  // Priority
  { code: 'AL', name: 'Albania', dial_code: '+355', flag: '🇦🇱' },
  { code: 'XK', name: 'Kosovo', dial_code: '+383', flag: '🇽🇰' },
  
  // Alphabetical (Rest of World)
  { code: 'US', name: 'United States', dial_code: '+1', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', dial_code: '+44', flag: '🇬🇧' },
  { code: 'DE', name: 'Germany', dial_code: '+49', flag: '🇩🇪' },
  { code: 'IT', name: 'Italy', dial_code: '+39', flag: '🇮🇹' },
  { code: 'FR', name: 'France', dial_code: '+33', flag: '🇫🇷' },
];