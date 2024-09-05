import { Outlet } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import Header from './Header';
import { ErrorFallback } from '../../components/ErrorFallback';

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
