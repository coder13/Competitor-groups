import React from 'react';

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './pages/Layout';
import Competition from './pages/Competition';
import CompetitionHome from './pages/Competition/Home';
import CompetitionPerson from './pages/Competition/Person';
<<<<<<< Updated upstream
=======
import CompetitionGroupsOverview from './pages/Competition/GroupsOverview';
import CompetitionEvents from './pages/Competition/Events';
import CompetitionRound from './pages/Competition/Round';
import CompetitionGroup from './pages/Competition/Group';
import CompetitionSchedule from './pages/Competition/Schedule';
>>>>>>> Stashed changes
import Home from './pages/Home';
import history from './lib/history';
import AuthProvider from './providers/AuthProvider'

const App = () => (
  <BrowserRouter history={history}>
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="/competitions/:competitionId" element={<Competition />}>
            <Route index element={<CompetitionHome />} />
            <Route path="persons/:registrantId" element={<CompetitionPerson />} />
<<<<<<< Updated upstream
=======
            <Route path="overview" element={<CompetitionGroupsOverview />} />
            <Route path="events/:eventId-r:roundNumber" element={<CompetitionRound />} />
            <Route path="events" element={<CompetitionEvents />} />
            <Route path="activities" element={<CompetitionSchedule />} />
            <Route path="activities/:activityId" element={<CompetitionGroup />} />
>>>>>>> Stashed changes
          </Route>
        </Route>
      </Routes>
    </AuthProvider>
  </BrowserRouter>
);

export default App;