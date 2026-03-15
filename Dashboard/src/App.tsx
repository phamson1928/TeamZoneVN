import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Login } from './pages/Login';
import { Overview } from './pages/Overview';
import UserManagement from './pages/UserManagement';

const queryClient = new QueryClient();

// Placeholder components for the other sections
const ZoneManagement = () => <div className="p-8 rounded-[32px] bg-white border border-gray-100 min-h-[600px] shadow-sm"><h2 className="text-2xl font-bold text-gray-900">Quản lý Zone</h2></div>;
const GroupManagement = () => <div className="p-8 rounded-[32px] bg-white border border-gray-100 min-h-[600px] shadow-sm"><h2 className="text-2xl font-bold text-gray-900">Quản lý nhóm</h2></div>;
const Moderation = () => <div className="p-8 rounded-[32px] bg-white border border-gray-100 min-h-[600px] shadow-sm"><h2 className="text-2xl font-bold text-gray-900">Kiểm duyệt & Báo cáo</h2></div>;

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
