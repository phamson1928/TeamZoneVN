import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Login } from './pages/Login';
import { Overview } from './pages/Overview';
import UserManagement from './pages/UserManagement';
import ZoneManagement from './pages/ZoneManagement';

const queryClient = new QueryClient();

import GroupManagement from './pages/GroupManagement';
import Moderation from './pages/Moderation';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Main App Routes (Protected) */}
          <Route element={<ProtectedRoute><MainLayout><Overview /></MainLayout></ProtectedRoute>} path="/" />
          <Route element={<ProtectedRoute><MainLayout><UserManagement /></MainLayout></ProtectedRoute>} path="/users" />
          <Route element={<ProtectedRoute><MainLayout><ZoneManagement /></MainLayout></ProtectedRoute>} path="/zones" />
          <Route element={<ProtectedRoute><MainLayout><GroupManagement /></MainLayout></ProtectedRoute>} path="/groups" />
          <Route element={<ProtectedRoute><MainLayout><Moderation /></MainLayout></ProtectedRoute>} path="/moderation" />

          {/* Auth Route */}
          <Route path="/login" element={<Login />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
