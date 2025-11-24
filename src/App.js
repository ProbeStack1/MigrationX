import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import '@/App.css';
import Dashboard from './pages/Dashboard';
import NewMigration from './pages/NewMigration';
import MigrationDetail from './pages/MigrationDetail';
import DiffViewer from './pages/DiffViewer';
import ResourceBrowser from './pages/ResourceBrowser';
import Layout from './components/Layout';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/new-migration" element={<NewMigration />} />
          <Route path="/migration/:id" element={<MigrationDetail />} />
          <Route path="/diff-viewer" element={<DiffViewer />} />
          <Route path="/resources" element={<ResourceBrowser />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
