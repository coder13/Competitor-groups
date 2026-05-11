import { Button, Container } from '@/components';
import { useAssignmentNotifications } from '@/hooks/useAssignmentNotifications';
import { Theme, useUserSettings } from '@/providers/UserSettingsProvider';

export default function Settings() {
  const { theme, setTheme } = useUserSettings();
  const { status, notificationsEnabled, isEnabling, error, enableNotifications } =
    useAssignmentNotifications();

  const themeOptions: { value: Theme; label: string; description: string }[] = [
    { value: 'light', label: 'Light', description: 'Always use light theme' },
    { value: 'dark', label: 'Dark', description: 'Always use dark theme' },
    { value: 'system', label: 'System', description: 'Use system preference' },
  ];

  return (
    <Container className="px-4 py-8">
      <div className="space-y-6">
        <h1 className="type-display">Settings</h1>

        <div className="space-y-4 rounded-lg bg-panel p-6 shadow-md shadow-tertiary-dark">
          <h2 className="type-heading">Appearance</h2>

          <div className="space-y-3">
            <label className="type-label">Theme</label>
            {themeOptions.map((option) => (
              <div key={option.value} className="flex items-start">
                <input
                  type="radio"
                  id={`theme-${option.value}`}
                  name="theme"
                  value={option.value}
                  checked={theme === option.value}
                  onChange={() => setTheme(option.value)}
                  className="radio"
                />
                <label htmlFor={`theme-${option.value}`} className="ml-2 flex-1 cursor-pointer">
                  <span className="block type-label">{option.label}</span>
                  <span className="block type-meta">{option.description}</span>
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4 rounded-lg bg-panel p-6 shadow-md shadow-tertiary-dark">
          <h2 className="type-heading">Assignment notifications</h2>
          <p className="type-body-sm text-subtle">
            Enable push notifications for new assignments and upcoming assignment reminders.
          </p>
          <p className="type-meta">Status: {status}</p>
          {!notificationsEnabled && status !== 'unsupported' && (
            <Button
              type="button"
              className="w-full justify-center sm:w-auto"
              disabled={isEnabling}
              onClick={() => {
                void enableNotifications();
              }}>
              {isEnabling ? 'Enabling notifications...' : 'Enable notifications'}
            </Button>
          )}
          {error && <p className="type-meta text-red-500">{error}</p>}
          {status === 'unsupported' && (
            <p className="type-meta">This browser does not support the Notification API.</p>
          )}
        </div>
      </div>
    </Container>
  );
}
