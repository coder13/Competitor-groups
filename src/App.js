import React from 'react';

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './pages/Layout';
import Competition from './pages/Competition';
import CompetitionHome from './pages/Competition/Home';
import CompetitionPerson from './pages/Competition/Person';
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
          </Route>
        </Route>
      </Routes>
    </AuthProvider>
  </BrowserRouter>
);

export default App;