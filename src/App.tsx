import { BrowserRouter, Routes, Route, Navigate, useParams, useNavigate } from 'react-router-dom';
import { RootLayout } from './layouts/RootLayout';
import { CompetitionLayout } from './layouts/CompetitionLayout';
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
import { AuthProvider, useAuth } from './providers/AuthProvider';
import usePageTracking from './hooks/usePageTracking';
import { useEffect } from 'react';
import About from './pages/About';
import Support from './pages/Support';
import { ApolloProvider } from '@apollo/client';
import client from './apolloClient';
import { QueryProvider } from './providers/QueryProvider/QueryProvider';
import { PsychSheetEvent } from './pages/Competition/PsychSheet/PsychSheetEvent';
import { useWCIF } from './providers/WCIFProvider';
import UserLogin from './pages/UserLogin';
import { AppProvider } from './providers/AppProvider';

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
  }, [user, navigate, competitionId, wcif?.persons]);

  return null;
};

const PsychSheet = () => {
  const navigate = useNavigate();
  const { competitionId } = useParams() as { competitionId: string };
  const { wcif } = useWCIF();

  useEffect(() => {
    if (wcif) {
      navigate(`/competitions/${competitionId}/psych-sheet/${wcif.events[0].id}`, {
        replace: true,
      });
    }
  }, [wcif, competitionId, navigate]);

  return null;
};

const Navigation = () => {
  usePageTracking(import.meta.env.VITE_GA_MEASUREMENT_ID);

  return (
    <Routes>
      <Route path="/" element={<RootLayout />}>
        <Route index element={<Home />} />
        <Route path="/competitions" element={<Navigate to="/" />} />
        <Route path="/competitions/:competitionId" element={<CompetitionLayout />}>
          <Route index element={<CompetitionHome />} />

          <Route path="persons/:registrantId" element={<CompetitionPerson />} />
          <Route path="personal-bests/:wcaId" element={<CompetitionPersonalBests />} />
          <Route path="personal-records/:wcaId" element={<CompetitionPersonalBests />} />

          <Route path="events" element={<CompetitionEvents />} />
          <Route path="events/:roundId" element={<CompetitionGroupList />} />
          <Route path="events/:roundId/:groupNumber" element={<CompetitionGroup />} />

          <Route path="activities" element={<Schedule />} />
          <Route path="activities/:activityId" element={<CompetitionActivity />} />
          <Route path="rooms" element={<CompetitionRooms />} />
          <Route path="rooms/:roomId" element={<CompetitionRoom />} />

          <Route path="psych-sheet" element={<PsychSheet />} />
          <Route path="psych-sheet/:eventId" element={<PsychSheetEvent />} />

          <Route path="scramblers" element={<CompetitionScramblerSchedule />} />
          <Route path="stream" element={<CompetitionStreamSchedule />} />
          <Route path="information" element={<CompetitionInformation />} />
          <Route path="live" element={<CompetitionLive />} />

          {/* Following pages are not accessible: */}
          <Route path="personal-schedule" element={<PersonalSchedule />} />
          <Route path="explore" element={<CompetitionGroupsOverview />} />
          <Route path="groups-schedule" element={<CompetitionGroupsSchedule />} />
          <Route path="stats" element={<CompetitionStats />} />
          <Route path="*" element={<p>Path not resolved</p>} />
        </Route>
        <Route path="/users/:userId" element={<UserLogin />} />
        <Route path="about" element={<About />} />
        <Route path="support" element={<Support />} />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

const App = () => (
  <AppProvider>
    <QueryProvider>
      <ApolloProvider client={client}>
        <BrowserRouter>
          <AuthProvider>
            <Navigation />
          </AuthProvider>
        </BrowserRouter>
      </ApolloProvider>
    </QueryProvider>
  </AppProvider>
);

export default App;
