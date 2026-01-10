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
    <Container className="py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Settings</h1>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Appearance</h2>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Theme
            </label>
            {themeOptions.map((option) => (
              <div key={option.value} className="flex items-start">
                <input
                  type="radio"
                  id={`theme-${option.value}`}
                  name="theme"
                  value={option.value}
                  checked={theme === option.value}
                  onChange={() => setTheme(option.value)}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                />
                <label htmlFor={`theme-${option.value}`} className="ml-3 cursor-pointer flex-1">
                  <span className="block text-sm font-medium text-gray-900 dark:text-white">
                    {option.label}
                  </span>
                  <span className="block text-sm text-gray-500 dark:text-gray-400">
                    {option.description}
                  </span>
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Container>
  );
}
