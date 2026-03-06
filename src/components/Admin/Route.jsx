import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const AdminRoute = () => {
    const { user, token } = useAuth();

    if (!token) {
        toast.error("Please login to access this page");
        return <Navigate to="/login" replace />;
    }

    if (user?.role !== 'admin') {
        toast.error("You are not authorized to access this page");
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default AdminRoute;
