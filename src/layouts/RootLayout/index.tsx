import { useRef } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Outlet } from 'react-router-dom';
import { AppUpdatePrompt, ErrorFallback } from '@/components';
import { usePWAUpdate } from '@/hooks/useRegisterSW/useRegisterSW';
import { useSessionScrollRestoration } from '@/hooks/useSessionScrollRestoration/useSessionScrollRestoration';
import Header from './Header';

export function RootLayout() {
  const { updateAvailable, updateSW } = usePWAUpdate();
  const mainRef = useRef<HTMLElement>(null);
  useSessionScrollRestoration(mainRef);

  return (
    <div className="flex flex-col flex-1 full-viewport-height overflow-hidden bg-app">
      <Header />
      {updateAvailable && <AppUpdatePrompt onUpdate={updateSW} />}
      <main
        ref={mainRef}
        data-scroll-restoration="root"
        className="flex min-h-0 flex-1 flex-col w-full items-center overflow-y-auto">
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Outlet />
        </ErrorBoundary>
      </main>
    </div>
  );
}
