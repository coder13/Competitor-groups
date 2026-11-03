import { render, screen, within } from '@testing-library/react';
import { Activity, Competition, EventId, Person, Round, RoundFormat } from '@wca/helpers';
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
    buildPersons,
    buildRounds,
  }: {
    roundNumber?: number;
    format?: RoundFormat;
    hasPersonalBests?: boolean;
    buildPersons?: (person: Person) => Person[];
    buildRounds?: (rounds: Round[]) => Round[];
  } = {},
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
  const persons = buildPersons ? buildPersons(person) : [person];
  const firstRound = {
    ...storybookCompetitionFixture.events[0].rounds[0],
    id: `${eventId}-r1`,
    format,
    results: [{ personId: 1, ranking: 1, best: 580, average: 710, attempts: [] }],
  };
  const rounds = [firstRound, { ...firstRound, id: `${eventId}-r2`, results: [] }];
  mockWcif = {
    ...storybookCompetitionFixture,
    events: [
      {
        id: eventId,
        rounds: buildRounds ? buildRounds(rounds) : rounds,
        extensions: [],
      },
    ],
    persons,
  };

  render(
    <EventActivity
      competitionId={mockWcif.id}
      activity={activity}
      persons={persons}
      LinkComponent={TestLink}
    />,
  );
  const row = screen.getAllByRole('row')[1];
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

describe('EventActivity seed ordering', () => {
  const buildPersons = (person: Person): Person[] => [
    {
      ...person,
      name: 'Heron Sato',
      personalBests: person.personalBests!.map((pb) => ({
        ...pb,
        value: pb.type === 'single' ? 25558 : 30000,
        worldRanking: pb.type === 'single' ? 8836 : 3744,
      })),
    },
    {
      ...person,
      registrantId: 2,
      name: 'Sofia Rubbo Tha',
      personalBests: person
        .personalBests!.filter((pb) => pb.type === 'single')
        .map((pb) => ({ ...pb, value: 20931, worldRanking: 7524 })),
    },
    {
      ...person,
      registrantId: 3,
      name: 'No single ranking',
      personalBests: person
        .personalBests!.filter((pb) => pb.type === 'average')
        .map((pb) => ({ ...pb, worldRanking: 1 })),
    },
  ];

  it.each<EventId>(['333bf', '444bf', '555bf', '333mbf'])(
    'orders %s by single rank even when an average rank exists',
    (eventId) => {
      renderSeed(eventId, { format: '3', buildPersons });
      const rows = screen.getAllByRole('row').slice(1);
      expect(rows.map((row) => within(row).getAllByRole('cell')[0].textContent)).toEqual([
        'Sofia Rubbo Tha',
        'Heron Sato',
        'No single ranking',
      ]);
      if (eventId === '333bf') {
        expect(within(rows[0]).getAllByRole('cell')[1].textContent).toBe('3:29.31');
        expect(within(rows[1]).getAllByRole('cell')[1].textContent).toBe('4:15.58');
      }
      expect(within(rows[2]).getAllByRole('cell')[1].textContent).toBe('');
    },
  );

  it('keeps average-ranked events ordered by average rather than single rank', () => {
    renderSeed('333', { buildPersons });
    expect(screen.getAllByRole('row')[1].textContent).toContain('Heron Sato');
  });
});

describe('EventActivity dual-round seeds', () => {
  it('uses personal bests for a registrations-based second component, not the first component results', () => {
    expect(
      renderSeed('333', {
        roundNumber: 2,
        buildRounds: (rounds) =>
          rounds.map((round) => ({
            ...round,
            participationRuleset: {
              reservedPlaces: null,
              participationSource: { type: 'registrations' },
            },
          })),
      }).textContent,
    ).toBe('7.40');
  });

  it('uses the explicitly named source round instead of the numerically previous round', () => {
    expect(
      renderSeed('333', {
        roundNumber: 3,
        buildRounds: (rounds) => [
          ...rounds,
          {
            ...rounds[1],
            id: '333-r3',
            participationRuleset: {
              reservedPlaces: null,
              participationSource: {
                type: 'round',
                roundId: '333-r1',
                resultCondition: null,
              },
            },
          },
        ],
      }).textContent,
    ).toBe('7.10');
  });

  it.each([
    [710, 690, '6.90'],
    [710, -1, '7.10'],
    [-1, 690, '6.90'],
    [710, 0, '7.10'],
  ])(
    'uses the best valid dual-round average (%s / %s)',
    (firstAverage, secondAverage, expected) => {
      expect(
        renderSeed('333', {
          roundNumber: 3,
          buildRounds: (rounds) => [
            { ...rounds[0], results: [{ ...rounds[0].results[0], average: Number(firstAverage) }] },
            {
              ...rounds[1],
              results: [{ ...rounds[0].results[0], average: Number(secondAverage) }],
            },
            {
              ...rounds[1],
              id: '333-r3',
              participationRuleset: {
                reservedPlaces: null,
                participationSource: {
                  type: 'linkedRounds',
                  roundIds: ['333-r1', '333-r2'],
                  resultCondition: { type: 'ranking', scope: 'average', value: 12 },
                },
              },
            },
          ],
        }).textContent,
      ).toBe(expected);
    },
  );
});

it('keeps official combined rankings and supports competitors present in only one component', () => {
  renderSeed('333', {
    roundNumber: 3,
    buildPersons: (person) => [person, { ...person, registrantId: 2, name: 'Other component' }],
    buildRounds: (rounds) => [
      { ...rounds[0], results: [{ ...rounds[0].results[0], ranking: 2, average: 710 }] },
      {
        ...rounds[1],
        results: [{ ...rounds[0].results[0], personId: 2, ranking: 1, average: 720 }],
      },
      {
        ...rounds[1],
        id: '333-r3',
        participationRuleset: {
          reservedPlaces: null,
          participationSource: {
            type: 'linkedRounds',
            roundIds: ['333-r1', '333-r2'],
            resultCondition: { type: 'ranking', scope: 'average', value: 12 },
          },
        },
      },
    ],
  });
  const rows = screen.getAllByRole('row').slice(1);
  expect(rows[0].textContent).toBe('Other component7.20');
  expect(rows[1].textContent).toBe('Seed Competitor7.10');
});
