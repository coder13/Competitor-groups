import { fireEvent, render, screen } from '@testing-library/react';
import { Round } from '@wca/helpers';
import { readFileSync } from 'fs';
import { createInstance } from 'i18next';
import { load } from 'js-yaml';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import { MemoryRouter } from 'react-router-dom';
import { CutoffTimeLimitPanel } from './CutoffTimeLimitPanel';

jest.mock('@/providers/WCIFProvider', () => ({
  useWCIF: () => ({ wcif: undefined }),
}));

const round: Round = {
  id: '333-r1',
  format: 'a',
  cutoff: { numberOfAttempts: 2, resultValue: 1200 },
  timeLimit: null,
  linkedRounds: null,
  participationRuleset: null,
  results: [],
  extensions: [],
};

it('renders actual translated help markup and supports repeated dismissal and reopening', async () => {
  const i18n = createInstance();
  await i18n.use(initReactI18next).init({
    lng: 'en',
    fallbackLng: 'en',
    resources: {
      en: { translation: load(readFileSync('src/i18n/en/translation.yaml', 'utf8')) as object },
    },
    interpolation: { escapeValue: false },
  });
  const { unmount } = render(
    <I18nextProvider i18n={i18n}>
      <MemoryRouter>
        <CutoffTimeLimitPanel round={round} />
      </MemoryRouter>
    </I18nextProvider>,
  );
  const help = screen.getByRole('button', { name: /help/i, expanded: false });
  help.focus();
  for (let attempt = 0; attempt < 2; attempt++) {
    fireEvent.click(help);
    expect(help).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('cutoffs', { selector: 'strong' })).toBeInTheDocument();
    expect(document.body).not.toHaveTextContent('<bold>');
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(help).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText('cutoffs', { selector: 'strong' })).not.toBeInTheDocument();
    expect(help).toHaveFocus();
  }
  fireEvent.click(help);
  fireEvent.click(help);
  expect(help).toHaveAttribute('aria-expanded', 'false');
  fireEvent.click(help);
  fireEvent.click(document.body);
  expect(help).toHaveAttribute('aria-expanded', 'false');
  fireEvent.click(help);
  unmount();
  fireEvent.keyDown(document, { key: 'Escape' });
  expect(screen.queryByText('cutoffs', { selector: 'strong' })).not.toBeInTheDocument();
});
