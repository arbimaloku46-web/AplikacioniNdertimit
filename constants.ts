import { Project } from './types';

export const MOCK_PROJECTS: Project[] = [
  {
    id: 'p_demo_1',
    name: 'Skyline Tower',
    clientName: 'Tirana Developments',
    location: 'Tirana, Albania',
    thumbnailUrl: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=1000',
    accessCode: '1111',
    description: 'A 30-story mixed-use development featuring luxury apartments and high-end retail space.',
    updates: [
      {
        weekNumber: 42,
        date: new Date().toISOString().split('T')[0],
        title: 'Façade Installation',
        summary: 'Glass curtain wall installation has progressed to the 20th floor. Interior framing is complete on floors 10-15. No safety incidents reported this week.',
        splatUrl: 'https://poly.cam/capture/6266a808-2560-4a1e-8361-805579007155',
        media: [
            {
                id: 'm1',
                type: 'photo',
                url: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=1000',
                description: 'North Elevation Progress'
            },
            {
                id: 'm2',
                type: 'photo',
                url: 'https://images.unsplash.com/photo-1588557132645-ff567110cafd?q=80&w=1000',
                description: 'Interior Framing - Level 12'
            }
        ],
        stats: {
          completion: 68,
          workersOnSite: 145,
          weatherConditions: 'Sunny, 22°C'
        }
      }
    ]
  }
];