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
      <h1 className="mb-6 text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>

      <div className="p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">Appearance</h2>

        <div className="space-y-3">
          <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
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
                className="w-4 h-4 mt-1 text-blue-600 border-gray-300 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
              />
              <label htmlFor={`theme-${option.value}`} className="flex-1 ml-3 cursor-pointer">
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
    </Container>
  );
}
