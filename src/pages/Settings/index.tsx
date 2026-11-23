import { Button, Container } from '@/components';
import { useMyCompetitionsQuery } from '@/containers/MyCompetitions/MyCompetitions.query';
import { useAssignmentNotifications } from '@/hooks/useAssignmentNotifications';
import { useAuth } from '@/providers/AuthProvider';
import { useNotifyCompRemoteAuth } from '@/providers/NotifyCompRemoteAuthProvider';
import { Theme, useUserSettings } from '@/providers/UserSettingsProvider';

export default function Settings() {
  const { theme, setTheme } = useUserSettings();
  const { user, signIn } = useAuth();
  const notifyCompRemoteAuth = useNotifyCompRemoteAuth();
  const { competitions, isLoading } = useMyCompetitionsQuery(user?.id);
  const notifications = useAssignmentNotifications({
    competitions,
    user,
  });
  const notificationsBusy = notifications.isSaving || notifications.isTesting;

  const themeOptions: { value: Theme; label: string; description: string }[] = [
    { value: 'light', label: 'Light', description: 'Always use light theme' },
    { value: 'dark', label: 'Dark', description: 'Always use dark theme' },
    { value: 'system', label: 'System', description: 'Use system preference' },
  ];

  return (
    <Container className="px-4 py-8">
      <div className="space-y-6">
        <h1 className="type-display">Settings</h1>

        <div className="space-y-4 p-6 bg-panel rounded-lg shadow-md shadow-tertiary-dark">
          <h2 className="type-heading">Appearance</h2>

          <div className="space-y-3">
            <label className="block type-label">Theme</label>
            {themeOptions.map((option) => (
              <div key={option.value} className="flex items-start gap-2">
                <input
                  type="radio"
                  id={`theme-${option.value}`}
                  name="theme"
                  value={option.value}
                  checked={theme === option.value}
                  onChange={() => setTheme(option.value)}
                  className="radio"
                />
                <label htmlFor={`theme-${option.value}`} className="flex-1 cursor-pointer">
                  <span className="block type-label">{option.label}</span>
                  <span className="block type-meta">{option.description}</span>
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4 p-6 bg-panel rounded-lg shadow-md shadow-tertiary-dark">
          <div className="space-y-2">
            <h2 className="type-heading">Assignment notifications</h2>
            <p className="type-body-sm text-subtle">
              Get push notifications when your assignments change for upcoming and ongoing
              competitions.
            </p>
            <p className="type-meta">
              Watching {notifications.watchCount} competition
              {notifications.watchCount === 1 ? '' : 's'}.
            </p>
          </div>

          {!user && (
            <Button type="button" onClick={signIn}>
              Sign in with WCA
            </Button>
          )}

          {user && notifications.status === 'unsupported' && (
            <p className="type-meta">This browser does not support push notifications.</p>
          )}

          {user && notifications.status === 'reauthorize' && (
            <div className="space-y-2">
              <p className="type-meta">Refresh your WCA authorization to enable notifications.</p>
              <Button type="button" onClick={signIn}>
                Continue with WCA
              </Button>
            </div>
          )}

          {user && notifications.canEnable && (
            <Button
              type="button"
              disabled={notifications.isSaving || isLoading}
              onClick={() => {
                void notifications.enable();
              }}>
              {notifications.isSaving ? 'Enabling...' : 'Enable assignment notifications'}
            </Button>
          )}

          {user && notifications.canDisable && (
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="gray"
                disabled={notificationsBusy}
                onClick={() => {
                  void notifications.disable();
                }}>
                {notifications.isSaving ? 'Disabling...' : 'Disable assignment notifications'}
              </Button>

              {notifications.canTest && (
                <Button
                  type="button"
                  variant="light"
                  disabled={notificationsBusy}
                  onClick={() => {
                    void notifications.test();
                  }}>
                  {notifications.isTesting ? 'Sending...' : 'Test notifications'}
                </Button>
              )}
            </div>
          )}

          {user && notifications.status === 'denied' && (
            <p className="type-meta">Notifications are blocked in your browser settings.</p>
          )}

          {notifications.error && <p className="type-meta text-red-500">{notifications.error}</p>}
          {notifications.successMessage && (
            <p className="type-meta text-green-600">{notifications.successMessage}</p>
          )}
        </div>

        <div className="space-y-4 p-6 bg-panel rounded-lg shadow-md shadow-tertiary-dark">
          <div className="space-y-2">
            <h2 className="type-heading">Live Activities Remote</h2>
            <p className="type-body-sm text-subtle">
              Manage the separate session used by Live Activities remote controls.
            </p>
            <p className="type-meta">
              {notifyCompRemoteAuth.isAuthenticated ? 'Signed in' : 'Not signed in'}
            </p>
          </div>

          {notifyCompRemoteAuth.isAuthenticated && (
            <Button type="button" variant="gray" onClick={notifyCompRemoteAuth.signOut}>
              Sign out of Live Activities Remote
            </Button>
          )}
        </div>
      </div>
    </Container>
  );
}
