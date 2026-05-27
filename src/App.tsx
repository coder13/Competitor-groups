import { ApolloProvider } from '@apollo/client';
import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams, useNavigate } from 'react-router-dom';
import client from './apolloClient';
import { usePageTracking } from './hooks/usePageTracking';
import { CompetitionLayout } from './layouts/CompetitionLayout';
import { RootLayout } from './layouts/RootLayout';
import { FEATURE_FLAGS } from './lib/featureFlags';
import About from './pages/About';
import CompetitionAdmin from './pages/Competition/Admin';
import CompetitionEvents from './pages/Competition/ByGroup/Events';
import CompetitionGroup from './pages/Competition/ByGroup/Group';
import CompetitionGroupList from './pages/Competition/ByGroup/GroupList';
import CompetitionCompareSchedules from './pages/Competition/CompareSchedules';
import CompetitionGroupsOverview from './pages/Competition/GroupsOverview';
import CompetitionGroupsSchedule from './pages/Competition/GroupsSchedule';
import CompetitionHome from './pages/Competition/Home';
import CompetitionInformation from './pages/Competition/Information';
import CompetitionLive from './pages/Competition/Live';
import CompetitionPerson from './pages/Competition/Person';
import CompetitionPersonalBests from './pages/Competition/Person/PersonalBests';
import { PsychSheetEvent } from './pages/Competition/PsychSheet/PsychSheetEvent';
import CompetitionRemote from './pages/Competition/Remote';
import CompetitionResults from './pages/Competition/Results';
import {
  CompetitionActivity,
  CompetitionRoom,
  CompetitionRooms,
  Schedule,
} from './pages/Competition/Schedule';
import CompetitionScramblerSchedule from './pages/Competition/ScramblerSchedule';
import CompetitionStats from './pages/Competition/Stats';
import CompetitionStreamSchedule from './pages/Competition/StreamSchedule';
import CompetitionSumOfRanks from './pages/Competition/SumOfRanks';
import Home from './pages/Home';
import LiveActivitiesAbout from './pages/LiveActivities/About';
import Settings from './pages/Settings';
import Support from './pages/Support';
import Test from './pages/Test';
import UserPage from './pages/User';
import UserLogin from './pages/UserLogin';
import { AppProvider } from './providers/AppProvider';
import { AuthProvider, useAuth } from './providers/AuthProvider';
import { ConfirmProvider } from './providers/ConfirmProvider';
import { NotifyCompRemoteAuthProvider } from './providers/NotifyCompRemoteAuthProvider';
import { QueryProvider } from './providers/QueryProvider/QueryProvider';
import { UserSettingsProvider } from './providers/UserSettingsProvider';
import { useWCIF } from './providers/WCIFProvider';

const PersonalSchedule = () => {
  const navigate = useNavigate();
  const { competitionId } = useParams() as { competitionId: string };
  const { wcif } = useWCIF();
  const { user } = useAuth();

  useEffect(() => {
    const person = wcif?.persons.find(
      (p) => p.wcaUserId === user?.id && p.registration?.status === 'accepted',
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
    if (wcif && wcif.events?.length > 0) {
      navigate(`/competitions/${competitionId}/psych-sheet/${wcif.events[0].id}`, {
        replace: true,
      });
    }
  }, [wcif, competitionId, navigate]);

  return null;
};

const CompetitionPersonByWcaIdRedirect = ({ to }: { to: 'results' | 'records' }) => {
  const { competitionId, wcaId } = useParams() as { competitionId: string; wcaId: string };
  const { wcif } = useWCIF();
  const person = wcif?.persons.find((p) => p.wcaId?.toUpperCase() === wcaId.toUpperCase());

  if (!wcif) {
    return null;
  }

  if (!person) {
    return <Navigate to={`/competitions/${competitionId}`} replace />;
  }

  return (
    <Navigate to={`/competitions/${competitionId}/persons/${person.registrantId}/${to}`} replace />
  );
};

const CompetitionRedirect = ({ to }: { to: string }) => {
  const { competitionId } = useParams() as { competitionId: string };

  return <Navigate to={`/competitions/${competitionId}/${to}`} replace />;
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

          <Route
            path="persons/wca/:wcaId/results"
            element={<CompetitionPersonByWcaIdRedirect to="results" />}
          />
          <Route
            path="persons/wca/:wcaId/records"
            element={<CompetitionPersonByWcaIdRedirect to="records" />}
          />
          <Route path="persons/:registrantId/*" element={<CompetitionPerson />} />
          <Route path="personal-bests/:wcaId" element={<CompetitionPersonalBests />} />
          <Route path="personal-records/:wcaId" element={<CompetitionPersonalBests />} />
          <Route path="compare-schedules" element={<CompetitionCompareSchedules />} />

          <Route path="events" element={<CompetitionEvents />} />
          <Route path="events/:roundId" element={<CompetitionGroupList />} />
          <Route path="events/:roundId/:groupNumber" element={<CompetitionGroup />} />

          <Route path="activities" element={<Schedule />} />
          <Route path="activities/:activityId" element={<CompetitionActivity />} />
          <Route path="rooms" element={<CompetitionRooms />} />
          <Route path="rooms/:roomId" element={<CompetitionRoom />} />

          <Route path="psych-sheet" element={<PsychSheet />} />
          <Route path="psych-sheet/:eventId" element={<PsychSheetEvent />} />
          <Route path="results" element={<CompetitionResults />} />
          <Route path="results/:roundId" element={<CompetitionResults />} />

          <Route path="admin" element={<CompetitionAdmin />} />
          <Route path="admin/remote" element={<CompetitionRemote />} />
          <Route path="admin/scramblers" element={<CompetitionScramblerSchedule />} />
          <Route path="admin/stats" element={<CompetitionStats />} />
          <Route path="admin/sum-of-ranks" element={<CompetitionSumOfRanks />} />
          <Route path="remote" element={<CompetitionRedirect to="admin/remote" />} />
          <Route path="scramblers" element={<CompetitionRedirect to="admin/scramblers" />} />
          <Route path="stream" element={<CompetitionStreamSchedule />} />
          <Route path="information" element={<CompetitionInformation />} />
          <Route path="live" element={<CompetitionLive />} />

          {/* Following pages are not accessible: */}
          <Route path="personal-schedule" element={<PersonalSchedule />} />
          <Route path="explore" element={<CompetitionGroupsOverview />} />
          <Route path="groups-schedule" element={<CompetitionGroupsSchedule />} />
          <Route path="stats" element={<CompetitionRedirect to="admin/stats" />} />
          <Route path="sum-of-ranks" element={<CompetitionRedirect to="admin/sum-of-ranks" />} />
          <Route path="*" element={<p>Path not resolved</p>} />
        </Route>
        <Route path="/users/:userId" element={<UserLogin />} />
        {FEATURE_FLAGS.personalUserPage && (
          <>
            <Route path="/me" element={<Navigate to="/me/competitions" replace />} />
            <Route
              path="/me/results/:resultsMode"
              element={<Navigate to="/me/results" replace />}
            />
            <Route path="/me/:tab" element={<UserPage />} />
          </>
        )}
        <Route path="about" element={<About />} />
        <Route path="live-activities" element={<LiveActivitiesAbout />} />
        <Route path="settings" element={<Settings />} />
        <Route path="support" element={<Support />} />
      </Route>
      <Route path="test" element={<Test />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

const App = () => (
  <AppProvider>
    <UserSettingsProvider>
      <QueryProvider>
        <ApolloProvider client={client}>
          <BrowserRouter>
            <ConfirmProvider>
              <AuthProvider>
                <NotifyCompRemoteAuthProvider>
                  <Navigation />
                </NotifyCompRemoteAuthProvider>
              </AuthProvider>
            </ConfirmProvider>
          </BrowserRouter>
        </ApolloProvider>
      </QueryProvider>
    </UserSettingsProvider>
  </AppProvider>
);

export default App;
