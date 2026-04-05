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
      'appUpdate.title': 'Update available',
      'appUpdate.description':
        'A new version of the app is ready. Update to load the latest cached files.',
      'appUpdate.action': 'Update app',
    };

    jest.mocked(useTranslation).mockReturnValue({
      t: (key: string) => messages[key] ?? key,
      i18n: {} as never,
      ready: true,
    } as unknown as ReturnType<typeof useTranslation>);

    render(<AppUpdatePrompt onUpdate={onUpdate} />);

    expect(screen.getByRole('heading', { name: /update available/i })).toBeVisible();

    await user.click(screen.getByRole('button', { name: /update app/i }));

    expect(onUpdate).toHaveBeenCalledTimes(1);
  });
});
