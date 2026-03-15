import { Navigate, useLocation } from 'react-router-dom';

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const token = localStorage.getItem('access_token');
    const userStr = localStorage.getItem('user');
    const location = useLocation();

    if (!token || !userStr) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    try {
        const user = JSON.parse(userStr);
        // Ensure only ADMIN can access the dashboard
        if (user.role !== 'ADMIN') {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user');
            return <Navigate to="/login" state={{ error: 'Truy cập bị từ chối. Chỉ dành cho Admin.' }} replace />;
        }
    } catch (e) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
};
