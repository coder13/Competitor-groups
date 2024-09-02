import { BrowserRouter, Routes, Route, Navigate, useParams, useNavigate } from 'react-router-dom';
import Layout from './layout';
import Competition from './pages/Competition/Layout';
import CompetitionHome from './pages/Competition/Home';
import CompetitionPerson from './pages/Competition/Person';
import CompetitionGroupsOverview from './pages/Competition/GroupsOverview';
import CompetitionEvents from './pages/Competition/ByGroup/Events';
import CompetitionGroup from './pages/Competition/ByGroup/Group';
import CompetitionGroupList from './pages/Competition/ByGroup/GroupList';
import CompetitionScramblerSchedule from './pages/Competition/ScramblerSchedule';
import CompetitionStreamSchedule from './pages/Competition/StreamSchedule';
import CompetitionGroupsSchedule from './pages/Competition/GroupsSchedule';
import CompetitionInformation from './pages/Competition/Information';
import CompetitionPersonalBests from './pages/Competition/Person/PersonalBests';
import CompetitionLive from './pages/Competition/Live';
import CompetitionStats from './pages/Competition/Stats';
import {
  CompetitionActivity,
  CompetitionRoom,
  CompetitionRooms,
  Schedule,
} from './pages/Competition/Schedule';
import Home from './pages/Home';
import AuthProvider, { useAuth } from './providers/AuthProvider';
import usePageTracking from './hooks/usePageTracking';
import { createContext, useEffect, useState } from 'react';
import About from './pages/About';
import Support from './pages/Support';
import { ApolloProvider } from '@apollo/client';
import client from './apolloClient';
import { QueryProvider } from './providers/QueryProvider';
import { PsychSheetEvent } from './pages/Competition/PsychSheet/PsychSheetEvent';
import { useWCIF } from './providers/WCIFProvider';

const PersonalSchedule = () => {
  const navigate = useNavigate();
  const { competitionId } = useParams() as { competitionId: string };
  const { wcif } = useWCIF();
  const { user } = useAuth();

  useEffect(() => {
    const person = wcif?.persons.find(
      (p) => p.wcaUserId === user?.id && p.registration?.status === 'accepted'
    );

    if (person) {
      navigate(`/competitions/${competitionId}/persons/${person.registrantId}`, {
        replace: true,
      });
    } else {
      navigate(`/competitions/${competitionId}`, {
        replace: true,
      });
    }
  }, [user, navigate, competitionId]);

  return null;
};

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
        <Route path="/competitions" element={<Navigate to="/" />} />
        <Route path="/competitions/:competitionId" element={<Competition />}>
          <Route index element={<CompetitionHome />} />

          <Route path="persons/:registrantId" element={<CompetitionPerson />} />
          <Route path="personal-bests/:wcaId" element={<CompetitionPersonalBests />} />

          <Route path="events" element={<CompetitionEvents />} />
          <Route path="events/:roundId" element={<CompetitionGroupList />} />
          <Route path="events/:roundId/:groupNumber" element={<CompetitionGroup />} />

          <Route path="activities" element={<Schedule />} />
          <Route path="activities/:activityId" element={<CompetitionActivity />} />
          <Route path="rooms" element={<CompetitionRooms />} />
          <Route path="rooms/:roomId" element={<CompetitionRoom />} />

          <Route path="scramblers" element={<CompetitionScramblerSchedule />} />
          <Route path="stream" element={<CompetitionStreamSchedule />} />
          <Route path="information" element={<CompetitionInformation />} />
          <Route path="live" element={<CompetitionLive />} />

          {/* Following pages are not accessible: */}
          <Route path="personal-schedule" element={<PersonalSchedule />} />
          <Route path="psych-sheet/:eventId" element={<PsychSheetEvent />} />
          <Route path="explore" element={<CompetitionGroupsOverview />} />
          <Route path="groups-schedule" element={<CompetitionGroupsSchedule />} />
          <Route path="stats" element={<CompetitionStats />} />
          <Route path="*" element={<p>Path not resolved</p>} />
        </Route>
        <Route path="about" element={<About />} />
        <Route path="support" element={<Support />} />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

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
      <QueryProvider>
        <ApolloProvider client={client}>
          <BrowserRouter>
            <AuthProvider>
              <Navigation />
            </AuthProvider>
          </BrowserRouter>
        </ApolloProvider>
      </QueryProvider>
    </GlobalStateContext.Provider>
  );
};

export default App;
