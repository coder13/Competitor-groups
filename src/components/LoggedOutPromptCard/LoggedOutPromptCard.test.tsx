import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useTranslation } from 'react-i18next';
import { LoggedOutPromptCard } from './LoggedOutPromptCard';

jest.mock('react-i18next', () => ({
  useTranslation: jest.fn(),
}));

describe('LoggedOutPromptCard', () => {
  it('renders the login prompt and triggers the login callback', async () => {
    const user = userEvent.setup();
    const onLogin = jest.fn();

    const messages: Record<string, string> = {
      'home.loggedOutCard.eyebrow': 'Personalized view',
      'home.loggedOutCard.title': 'Log in to see your competitions',
      'home.loggedOutCard.description':
        'Sign in with your WCA account to load your competition list and personalized schedule shortcuts.',
      'common.login': 'Login',
    };

    jest.mocked(useTranslation).mockReturnValue({
      t: (key: string) => messages[key] ?? key,
      i18n: {} as never,
      ready: true,
    } as unknown as ReturnType<typeof useTranslation>);

    render(<LoggedOutPromptCard onLogin={onLogin} />);

    expect(screen.getByRole('heading', { name: /log in to see your competitions/i })).toBeVisible();

    await user.click(screen.getByRole('button', { name: /login/i }));

    expect(onLogin).toHaveBeenCalledTimes(1);
  });
});
