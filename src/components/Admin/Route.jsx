import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const AdminRoute = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
            </div>
        );
    }

    if (!user) {
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
