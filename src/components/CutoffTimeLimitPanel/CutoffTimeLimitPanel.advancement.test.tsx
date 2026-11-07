import { render, screen } from '@testing-library/react';
import { Competition, EventId, RankingType, Round } from '@wca/helpers';
import { readFileSync } from 'fs';
import { createInstance } from 'i18next';
import { load } from 'js-yaml';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import { MemoryRouter } from 'react-router-dom';
import { CutoffTimeLimitPanel } from './CutoffTimeLimitPanel';

let competitionMock: Pick<Competition, 'events'>;
jest.mock('@/providers/WCIFProvider', () => ({
  useWCIF: () => ({ wcif: competitionMock }),
}));

const makeRound = (id: string): Round => ({
  id,
  format: 'a',
  cutoff: null,
  timeLimit: null,
  linkedRounds: null,
  participationRuleset: null,
  results: [],
  extensions: [],
});

const renderThreshold = async (
  eventId: EventId,
  scope: RankingType,
  value: number | null,
  linked: boolean,
) => {
  const rounds = Array.from({ length: linked ? 3 : 2 }, (_, i) =>
    makeRound(`${eventId}-r${i + 1}`),
  );
  const sourceIds = rounds.slice(0, -1).map(({ id }) => id);
  rounds.at(-1)!.participationRuleset = {
    reservedPlaces: null,
    participationSource: linked
      ? {
          type: 'linkedRounds',
          roundIds: sourceIds,
          resultCondition: { type: 'resultAchieved', scope, value },
        }
      : {
          type: 'round',
          roundId: sourceIds[0],
          resultCondition: { type: 'resultAchieved', scope, value },
        },
  };
  competitionMock = { events: [{ id: eventId, rounds, extensions: [] }] };
  const i18n = createInstance();
  await i18n.use(initReactI18next).init({
    lng: 'en',
    fallbackLng: 'en',
    resources: {
      en: { translation: load(readFileSync('src/i18n/en/translation.yaml', 'utf8')) as object },
    },
    interpolation: { escapeValue: false },
  });
  return render(
    <I18nextProvider i18n={i18n}>
      <MemoryRouter>
        <CutoffTimeLimitPanel round={rounds[0]} />
      </MemoryRouter>
    </I18nextProvider>,
  );
};

const cap = '; minimum of 25% of competitors must be eliminated';

describe.each([false, true])('actual translated advancement captions (linked=%s)', (linked) => {
  const source = linked ? ' in dual rounds 1 & 2' : '';
  it.each<RankingType>(['single', 'average'])(
    'describes a null %s threshold as any successful result',
    async (scope) => {
      await renderThreshold('333', scope, null, linked);
      expect(
        screen.getByText(`Any successful ${scope}${source} advances to final${cap}`),
      ).toBeInTheDocument();
      expect(document.body).not.toHaveTextContent('unknown result');
      expect(document.body).not.toHaveTextContent('<');
    },
  );

  it('renders an FMC single threshold in moves', async () => {
    await renderThreshold('333fm', 'single', 30, linked);
    expect(
      screen.getByText(`Singles better than 30 moves${source} advance to final${cap}`),
    ).toBeInTheDocument();
    expect(document.body).not.toHaveTextContent('0.30');
  });

  it('renders an FMC average threshold in hundredths of moves', async () => {
    await renderThreshold('333fm', 'average', 3050, linked);
    expect(
      screen.getByText(`Averages better than 30.50 moves${source} advance to final${cap}`),
    ).toBeInTheDocument();
  });

  it('renders timed results without changing centisecond units', async () => {
    await renderThreshold('333', 'average', 1234, linked);
    expect(
      screen.getByText(`Averages better than 12.34${source} advance to final${cap}`),
    ).toBeInTheDocument();
  });

  it('decodes multi-blind results and describes a better result rather than a numeric less-than score', async () => {
    await renderThreshold('333mbf', 'single', 970036000, linked);
    expect(
      screen.getByText(`Singles better than 2/2 6:00${source} advance to final${cap}`),
    ).toBeInTheDocument();
  });
});
