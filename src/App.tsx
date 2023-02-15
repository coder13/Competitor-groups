import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './layout';
import Competition from './pages/Competition';
import CompetitionHome from './pages/Competition/Home';
import CompetitionPerson from './pages/Competition/Person';
import CompetitionGroupsOverview from './pages/Competition/GroupsOverview';
import CompetitionEvents from './pages/Competition/Events';
import CompetitionRound from './pages/Competition/Round';
import CompetitionGroup from './pages/Competition/Group';
import CompetitionSchedule from './pages/Competition/Schedule';
import CompetitionScramblerSchedule from './pages/Competition/ScramblerSchedule';
import CompetitionGroupsSchedule from './pages/Competition/GroupsSchedule';
import Home from './pages/Home';
import AuthProvider from './providers/AuthProvider';
import usePageTracking from './hooks/usePageTracking';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createContext, useEffect, useState } from 'react';

export const GlobalStateContext = createContext<{
  online: boolean;
}>({
  online: true,
});

const Navigation = () => {
  usePageTracking(process.env.REACT_APP_GA_MEASUREMENT_ID);

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="/competitions/:competitionId" element={<Competition />}>
          <Route index element={<CompetitionHome />} />
          <Route path="persons/:registrantId" element={<CompetitionPerson />} />
          <Route path="overview" element={<CompetitionGroupsOverview />} />
          <Route path="events/:eventId-r:roundNumber" element={<CompetitionRound />} />
          <Route path="events" element={<CompetitionEvents />} />
          <Route path="activities" element={<CompetitionSchedule />} />
          <Route path="activities/:activityId" element={<CompetitionGroup />} />
          <Route path="scramblers" element={<CompetitionScramblerSchedule />} />
          <Route path="groups-schedule" element={<CompetitionGroupsSchedule />} />
        </Route>
      </Route>
    </Routes>
  );
};

const queryClient = new QueryClient();

const App = () => {
  const [online, setOnline] = useState(navigator.onLine);

  const handleOnline = () => {
    setOnline(true);
  };

  const handleOffline = () => {
    setOnline(false);
  };

  console.log(61, online);

  useEffect(() => {
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <GlobalStateContext.Provider
      value={{
        online,
      }}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <Navigation />
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </GlobalStateContext.Provider>
  );
};

export default App;
