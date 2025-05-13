import { ErrorBoundary } from 'react-error-boundary';
import { Outlet } from 'react-router-dom';
import { ErrorFallback } from '@/components';
import Header from './Header';

export function RootLayout() {
  return (
    <div className="flex flex-col flex-1 full-viewport-height overflow-hidden">
      <Header />
      <main className="flex flex-1 flex-col w-full items-center overflow-hidden">
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Outlet />
        </ErrorBoundary>
      </main>
    </div>
  );
}
