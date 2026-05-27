import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useTranslation } from 'react-i18next';
import { AppUpdatePrompt } from './AppUpdatePrompt';

jest.mock('react-i18next', () => ({
  useTranslation: jest.fn(),
}));

describe('AppUpdatePrompt', () => {
  it('renders update copy and triggers the refresh action', async () => {
    const user = userEvent.setup();
    const onUpdate = jest.fn();

    const messages: Record<string, string> = {
      'appUpdate.title': 'New version ready',
      'appUpdate.description': 'Refresh to get the latest fixes and schedule updates.',
      'appUpdate.action': 'Refresh now',
    };

    jest.mocked(useTranslation).mockReturnValue({
      t: (key: string) => messages[key] ?? key,
      i18n: {} as never,
      ready: true,
    } as unknown as ReturnType<typeof useTranslation>);

    render(<AppUpdatePrompt onUpdate={onUpdate} />);

    expect(screen.getByRole('heading', { name: /new version ready/i })).toBeVisible();

    await user.click(screen.getByRole('button', { name: /refresh now/i }));

    expect(onUpdate).toHaveBeenCalledTimes(1);
  });
});
