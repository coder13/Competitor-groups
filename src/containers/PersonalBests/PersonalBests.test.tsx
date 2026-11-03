import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { Competition, Person } from '@wca/helpers';
import { MemoryRouter } from 'react-router-dom';
import { PersonalBestsContainer } from './PersonalBests';

jest.mock('@/lib/events', () => ({
  eventNameById: () => '3x3x3 Cube',
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

it('renders single and average personal bests from WCIF v2 values', () => {
  const person: Person = {
    registrantId: 1,
    name: 'Test Solver',
    wcaUserId: 1,
    countryIso2: 'US',
    extensions: [],
    registration: {
      wcaRegistrationId: 1,
      eventIds: ['333'],
      status: 'accepted',
      isCompeting: true,
    },
    personalBests: [
      {
        eventId: '333',
        type: 'single',
        value: 1234,
        worldRanking: 100,
        continentalRanking: 50,
        nationalRanking: 10,
      },
      {
        eventId: '333',
        type: 'average',
        value: 1567,
        worldRanking: 200,
        continentalRanking: 80,
        nationalRanking: 20,
      },
    ],
  };
  const wcif: Competition = {
    formatVersion: '2.0',
    id: 'Test2026',
    name: 'Test 2026',
    shortName: 'Test 2026',
    persons: [person],
    events: [{ id: '333', rounds: [], extensions: [] }],
    schedule: { startDate: '2026-05-03', numberOfDays: 1, venues: [] },
    series: null,
    competitorLimit: null,
    extensions: [],
    registrationInfo: {
      openTime: '2026-01-01T00:00:00Z',
      closeTime: '2026-04-01T00:00:00Z',
      baseEntryFee: 0,
      currencyCode: 'USD',
      onTheSpotRegistration: false,
      useWcaRegistration: true,
    },
  };

  render(
    <MemoryRouter>
      <PersonalBestsContainer wcif={wcif} person={person} />
    </MemoryRouter>,
  );

  expect(screen.getByText('12.34')).toBeInTheDocument();
  expect(screen.getByText('15.67')).toBeInTheDocument();
});
