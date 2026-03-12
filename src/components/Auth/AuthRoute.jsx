import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AuthRoute = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
            </div>
        );
    }

    if (user) {
        // Redirect based on role if already logged in
        if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
        if (user.role === 'serviceProvider') return <Navigate to="/provider/dashboard" replace />;
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default AuthRoute;
