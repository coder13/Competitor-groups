import { Competition } from '@wca/helpers';
import { hasMultipleScheduleLocations } from './activities';

const baseCompetition = {
  formatVersion: '1.0',
  id: 'TestComp2026',
  name: 'Test Comp 2026',
  shortName: 'Test Comp',
  events: [],
  persons: [],
  competitorLimit: 0,
  extensions: [],
} as const;

describe('hasMultipleScheduleLocations', () => {
  it('returns false for a single room without stage metadata', () => {
    const wcif = {
      ...baseCompetition,
      schedule: {
        numberOfDays: 1,
        startDate: '2026-03-15',
        venues: [
          {
            id: 1,
            name: 'Venue',
            timezone: 'America/Los_Angeles',
            rooms: [
              {
                id: 10,
                name: 'Main Room',
                color: '#123456',
                activities: [],
                extensions: [],
              },
            ],
          },
        ],
      },
    } as unknown as Competition;

    expect(hasMultipleScheduleLocations(wcif)).toBe(false);
  });

  it('returns true for a single room with multiple stages in the natshelper extension', () => {
    const wcif = {
      ...baseCompetition,
      schedule: {
        numberOfDays: 1,
        startDate: '2026-03-15',
        venues: [
          {
            id: 1,
            name: 'Venue',
            timezone: 'America/Los_Angeles',
            rooms: [
              {
                id: 10,
                name: 'Main Room',
                color: '#123456',
                activities: [],
                extensions: [
                  {
                    id: 'org.cubingusa.natshelper.v1.Room',
                    data: {
                      stages: [
                        { id: 1, name: 'Stage A', color: '#ff0000' },
                        { id: 2, name: 'Stage B', color: '#00ff00' },
                      ],
                    },
                  },
                ],
              },
            ],
          },
        ],
      },
    } as unknown as Competition;

    expect(hasMultipleScheduleLocations(wcif)).toBe(true);
  });
});
