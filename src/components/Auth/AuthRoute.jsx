import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AuthRoute = () => {
    const { user, token } = useAuth();

    if (token && user) {
        // Redirect based on role if already logged in
        if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
        if (user.role === 'serviceProvider') return <Navigate to="/provider/dashboard" replace />;
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default AuthRoute;
