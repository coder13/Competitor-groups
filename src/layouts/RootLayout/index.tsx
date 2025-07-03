import { ErrorBoundary } from 'react-error-boundary';
import { Outlet } from 'react-router-dom';
import { Button, ErrorFallback } from '@/components';
import { usePWAUpdate } from '@/hooks/useRegisterSW/useRegisterSW';
import Header from './Header';

export function RootLayout() {
  const { updateAvailable, updateSW } = usePWAUpdate();

  return (
    <div className="flex flex-col flex-1 full-viewport-height overflow-hidden">
      <Header />
      {updateAvailable && (
        <div className="p-2 flex justify-center">
          <Button className="bg-green-300 text-black min-h-10" onClick={() => updateSW(true)}>
            Update available - Click to refresh
          </Button>
        </div>
      )}
      <main className="flex flex-1 flex-col w-full items-center overflow-hidden">
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Outlet />
        </ErrorBoundary>
      </main>
    </div>
  );
}
