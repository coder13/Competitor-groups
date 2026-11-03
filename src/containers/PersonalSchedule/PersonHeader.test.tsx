import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Person } from '@wca/helpers';
import { readFileSync } from 'fs';
import { createInstance } from 'i18next';
import { load } from 'js-yaml';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import { PersonHeader } from './PersonHeader';

const competitionId = 'TestCompetition2026';
const person = {
  name: 'Test Competitor',
  registrantId: 5,
  countryIso2: 'FR',
  roles: [],
} as unknown as Person;
const i18n = createInstance();

jest.mock('@/providers/WCIFProvider', () => ({
  useWCIF: () => ({ competitionId: 'TestCompetition2026' }),
}));

beforeAll(async () => {
  await i18n.use(initReactI18next).init({
    lng: 'en',
    fallbackLng: 'en',
    resources: {
      en: { translation: load(readFileSync('src/i18n/en/translation.yaml', 'utf8')) as object },
    },
  });
});

beforeEach(() => {
  localStorage.clear();
});

const header = (competitor = person) => (
  <I18nextProvider i18n={i18n}>
    <PersonHeader competitionId={competitionId} person={competitor} />
  </I18nextProvider>
);

it('renders a translated, unpressed bookmark button with a decorative icon', () => {
  render(header());

  const button = screen.getByRole('button', { name: 'Bookmark competitor', pressed: false });
  expect(button).toBeEnabled();
  expect(button.querySelector('.fa-bookmark')).toHaveAttribute('aria-hidden', 'true');
});

it('persists keyboard bookmark changes across remounts without changing another competition', async () => {
  localStorage.setItem('pinnedPersons', JSON.stringify({ OtherCompetition2026: [5] }));
  const { unmount } = render(header());

  await act(() => userEvent.tab());
  expect(screen.getByRole('button', { name: 'Bookmark competitor', pressed: false })).toHaveFocus();
  await act(() => userEvent.keyboard('{Enter}'));
  expect(
    screen.getByRole('button', { name: 'Remove competitor bookmark', pressed: true }),
  ).toHaveFocus();
  expect(JSON.parse(localStorage.getItem('pinnedPersons')!)).toEqual({
    OtherCompetition2026: [5],
    [competitionId]: [5],
  });

  unmount();
  const { unmount: unmountPinned } = render(header());
  expect(
    screen.getByRole('button', { name: 'Remove competitor bookmark', pressed: true }),
  ).toBeEnabled();
  await act(() => userEvent.tab());
  await act(() => userEvent.keyboard(' '));
  expect(screen.getByRole('button', { name: 'Bookmark competitor', pressed: false })).toHaveFocus();
  expect(JSON.parse(localStorage.getItem('pinnedPersons')!)).toEqual({
    OtherCompetition2026: [5],
    [competitionId]: [],
  });

  unmountPinned();
  render(header());
  expect(screen.getByRole('button', { name: 'Bookmark competitor', pressed: false })).toBeEnabled();
});

it('reads the correct pressed state when navigating between competitors', () => {
  localStorage.setItem('pinnedPersons', JSON.stringify({ [competitionId]: [5] }));
  const { rerender } = render(header());
  expect(
    screen.getByRole('button', { name: 'Remove competitor bookmark', pressed: true }),
  ).toBeEnabled();

  rerender(header({ ...person, registrantId: 6 }));
  expect(screen.getByRole('button', { name: 'Bookmark competitor', pressed: false })).toBeEnabled();

  rerender(header());
  expect(
    screen.getByRole('button', { name: 'Remove competitor bookmark', pressed: true }),
  ).toBeEnabled();
  expect(JSON.parse(localStorage.getItem('pinnedPersons')!)).toEqual({ [competitionId]: [5] });
});

it('keeps a competitor without a registrant ID named, unpressed, and disabled', async () => {
  const saved = { [competitionId]: [5] };
  localStorage.setItem('pinnedPersons', JSON.stringify(saved));
  render(header({ ...person, registrantId: null } as unknown as Person));
  const button = screen.getByRole('button', { name: 'Bookmark competitor', pressed: false });
  expect(button).toBeDisabled();

  await act(() => userEvent.click(button));
  expect(JSON.parse(localStorage.getItem('pinnedPersons')!)).toEqual(saved);
});
