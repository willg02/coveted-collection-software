import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import AppLayout from './layouts/AppLayout';
import Dashboard from './pages/Dashboard';
import Properties from './pages/Properties';
import Financials from './pages/Financials';
import Sales from './pages/Sales';
import Operations from './pages/Operations';
import HR from './pages/HR';
import Chat from './pages/Chat';

import './styles/globals.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter basename="/coveted-collection-software">
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/properties" element={<Properties />} />
          <Route path="/financials" element={<Financials />} />
          <Route path="/sales" element={<Sales />} />
          <Route path="/operations" element={<Operations />} />
          <Route path="/hr" element={<HR />} />
          <Route path="/chat" element={<Chat />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
