import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './layout';
import Competition from './pages/Competition';
import CompetitionHome from './pages/Competition/Home';
import CompetitionPerson from './pages/Competition/Person';
import CompetitionGroupsOverview from './pages/Competition/GroupsOverview';
import CompetitionEvents from './pages/Competition/Events';
import CompetitionRound from './pages/Competition/Round';
import CompetitionActivity from './pages/Competition/Activity';
import CompetitionSchedule from './pages/Competition/Schedule';
import CompetitionScramblerSchedule from './pages/Competition/ScramblerSchedule';
import CompetitionStreamSchedule from './pages/Competition/StreamSchedule';
import CompetitionGroupsSchedule from './pages/Competition/GroupsSchedule';
import CompetitionRooms from './pages/Competition/Rooms';
import CompetitionRoom from './pages/Competition/Room';
import CompetitionInformation from './pages/Competition/Information';
import CompetitionPersonalBests from './pages/Competition/PersonalBests';
import Home from './pages/Home';
import AuthProvider from './providers/AuthProvider';
import usePageTracking from './hooks/usePageTracking';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createContext, useEffect, useState } from 'react';
import About from './pages/About';

export const GlobalStateContext = createContext<{
  online: boolean;
}>({
  online: true,
});

const Navigation = () => {
  usePageTracking(import.meta.env.VITE_GA_MEASUREMENT_ID);

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="/competitions/:competitionId" element={<Competition />}>
          <Route index element={<CompetitionHome />} />
          <Route path="persons/:registrantId" element={<CompetitionPerson />} />
          <Route
            path="personal-bests/:wcaId"
            element={<CompetitionPersonalBests />}
          />
          <Route path="overview" element={<CompetitionGroupsOverview />} />
          <Route path="events/:roundId" element={<CompetitionRound />} />
          <Route path="events" element={<CompetitionEvents />} />
          <Route path="activities" element={<CompetitionSchedule />} />
          <Route
            path="activities/:activityId"
            element={<CompetitionActivity />}
          />
          <Route path="scramblers" element={<CompetitionScramblerSchedule />} />
          <Route path="stream" element={<CompetitionStreamSchedule />} />
          <Route path="rooms" element={<CompetitionRooms />} />
          <Route path="rooms/:roomId" element={<CompetitionRoom />} />
          <Route path="information" element={<CompetitionInformation />} />
          {/* Following pages are not accessible: */}
          <Route
            path="groups-schedule"
            element={<CompetitionGroupsSchedule />}
          />
          <Route path="*" element={<p>Path not resolved</p>} />
        </Route>
        <Route path="about" element={<About />} />
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
