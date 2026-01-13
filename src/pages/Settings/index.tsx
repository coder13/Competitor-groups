import { Container } from '@/components';
import { Theme, useUserSettings } from '@/providers/UserSettingsProvider';

export default function Settings() {
  const { theme, setTheme } = useUserSettings();

  const themeOptions: { value: Theme; label: string; description: string }[] = [
    { value: 'light', label: 'Light', description: 'Always use light theme' },
    { value: 'dark', label: 'Dark', description: 'Always use dark theme' },
    { value: 'system', label: 'System', description: 'Use system preference' },
  ];

  return (
    <Container className="px-4 py-8">
      <h1 className="mb-6 type-display">Settings</h1>

      <div className="p-6 bg-panel rounded-lg shadow-md shadow-tertiary-dark">
        <h2 className="mb-4 type-heading">Appearance</h2>

        <div className="space-y-3">
          <label className="block mb-2 type-label">Theme</label>
          {themeOptions.map((option) => (
            <div key={option.value} className="flex items-start">
              <input
                type="radio"
                id={`theme-${option.value}`}
                name="theme"
                value={option.value}
                checked={theme === option.value}
                onChange={() => setTheme(option.value)}
                className="radio mt-1"
              />
              <label htmlFor={`theme-${option.value}`} className="flex-1 ml-3 cursor-pointer">
                <span className="block type-label">{option.label}</span>
                <span className="block type-meta">{option.description}</span>
              </label>
            </div>
          ))}
        </div>
      </div>
    </Container>
  );
}
