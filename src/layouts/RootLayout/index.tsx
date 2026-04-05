import { ErrorBoundary } from 'react-error-boundary';
import { Outlet } from 'react-router-dom';
import { AppUpdatePrompt, ErrorFallback } from '@/components';
import { usePWAUpdate } from '@/hooks/useRegisterSW/useRegisterSW';
import Header from './Header';

export function RootLayout() {
  const { updateAvailable, updateSW } = usePWAUpdate();

  return (
    <div className="flex flex-col flex-1 full-viewport-height overflow-hidden bg-app">
      <Header />
      {updateAvailable && <AppUpdatePrompt onUpdate={() => updateSW(true)} />}
      <main className="flex flex-1 flex-col w-full items-center overflow-hidden">
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Outlet />
        </ErrorBoundary>
      </main>
    </div>
  );
}
