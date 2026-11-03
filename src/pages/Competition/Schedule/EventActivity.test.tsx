import { render, screen, within } from '@testing-library/react';
import { Activity, Competition, EventId, Person, RoundFormat } from '@wca/helpers';
import { LinkRenderer } from '@/lib/linkRenderer';
import { storybookCompetitionFixture } from '@/storybook/competitionFixtures';
import { EventActivity } from './EventActivity';

let mockWcif: Competition;
const mockSetTitle = jest.fn();

jest.mock('@/providers/WCIFProvider', () => ({
  useWCIF: () => ({ wcif: mockWcif, setTitle: mockSetTitle }),
}));
jest.mock('@/i18n', () => ({ __esModule: true, default: { t: (key: string) => key } }));
jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
jest.mock('@/components/Breadcrumbs/Breadcrumbs', () => ({ Breadcrumbs: () => null }));
jest.mock('@/components/CutoffTimeLimitPanel', () => ({ CutoffTimeLimitPanel: () => null }));
jest.mock('./Activity', () => ({ niceActivityName: () => 'Test group' }));
jest.mock('./PeopleList', () => ({ PeopleList: () => null }));

const TestLink: LinkRenderer = ({ children, to, className }) =>
  className?.includes('table-row') ? (
    <tr className={className}>{children}</tr>
  ) : (
    <a href={typeof to === 'string' ? to : to.pathname} className={className}>
      {children}
    </a>
  );

const renderSeed = (
  eventId: EventId,
  {
    roundNumber = 1,
    format = 'a',
    hasPersonalBests = true,
  }: { roundNumber?: number; format?: RoundFormat; hasPersonalBests?: boolean } = {},
) => {
  const activity: Activity = {
    id: 30,
    activityCode: `${eventId}-r${roundNumber}-g1`,
    name: 'Test group',
    startTime: '2026-10-31T09:00:00Z',
    endTime: '2026-10-31T10:00:00Z',
    childActivities: [],
    extensions: [],
  };
  const person: Person = {
    registrantId: 1,
    name: 'Seed Competitor',
    wcaUserId: 1,
    countryIso2: 'CH',
    assignments: [{ activityId: 30, assignmentCode: 'competitor', stationNumber: null }],
    personalBests: hasPersonalBests
      ? [
          {
            eventId,
            type: 'single',
            value: 600,
            worldRanking: 100,
            continentalRanking: 50,
            nationalRanking: 10,
          },
          {
            eventId,
            type: 'average',
            value: 740,
            worldRanking: 200,
            continentalRanking: 80,
            nationalRanking: 20,
          },
        ]
      : [],
    extensions: [],
  };
  const firstRound = {
    ...storybookCompetitionFixture.events[0].rounds[0],
    id: `${eventId}-r1`,
    format,
    results: [{ personId: 1, ranking: 1, best: 580, average: 710, attempts: [] }],
  };
  mockWcif = {
    ...storybookCompetitionFixture,
    events: [
      {
        id: eventId,
        rounds: [firstRound, { ...firstRound, id: `${eventId}-r2`, results: [] }],
        extensions: [],
      },
    ],
    persons: [person],
  };

  render(
    <EventActivity
      competitionId={mockWcif.id}
      activity={activity}
      persons={[person]}
      LinkComponent={TestLink}
    />,
  );
  const row = screen.getByText('Seed Competitor').closest('tr')!;
  return within(row).getAllByRole('cell')[1];
};

describe('EventActivity seed results', () => {
  it('renders the first-round average from native WCIF v2 personalBest.value', () => {
    expect(renderSeed('333').textContent).toBe('7.40');
  });

  it('renders the first-round single for a single-ranked event', () => {
    expect(renderSeed('333bf', { format: '3' }).textContent).toBe('6.00');
  });

  it('keeps the seed blank when the competitor has no personal bests', () => {
    expect(renderSeed('333', { hasPersonalBests: false }).textContent).toBe('');
  });

  it('keeps later-round seeds based on the previous round average', () => {
    expect(renderSeed('333', { roundNumber: 2 }).textContent).toBe('7.10');
  });

  it('keeps later-round single seeds based on the previous round best', () => {
    expect(renderSeed('333bf', { roundNumber: 2, format: '3' }).textContent).toBe('5.80');
  });
});
