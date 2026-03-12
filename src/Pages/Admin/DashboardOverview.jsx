import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Users,
    Briefcase,
    Clock,
    ArrowUpRight,
    TrendingUp
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const DashboardOverview = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalProviders: 0,
        pendingApplications: 0
    });
    const [loading, setLoading] = useState(true);
    const apiUrl = import.meta.env.VITE_API_URL;

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [usersRes, providersRes] = await Promise.all([
                    axios.get(`${apiUrl}/api/auth/users`),
                    axios.get(`${apiUrl}/api/providers`)
                ]);

                const users = usersRes.data.data || [];
                const providers = providersRes.data.data || [];
                const pending = providers.filter(p => p.status === 'pending').length;

                setStats({
                    totalUsers: users.length,
                    totalProviders: providers.length,
                    pendingApplications: pending
                });
            } catch (error) {
                console.error("Error fetching stats:", error);
                toast.error("Failed to load dashboard statistics");
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [apiUrl]);

    const statCards = [
        {
            title: 'Total Users',
            value: stats.totalUsers,
            icon: Users,
            color: 'bg-blue-500',
            trend: '+12%',
            description: 'Registered customers'
        },
        {
            title: 'Active Providers',
            value: stats.totalProviders,
            icon: Briefcase,
            color: 'bg-orange-500',
            trend: '+5%',
            description: 'Verified service partners'
        },
        {
            title: 'Pending Apps',
            value: stats.pendingApplications,
            icon: Clock,
            color: 'bg-amber-500',
            trend: 'Action required',
            description: 'Enrollment requests'
        },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
                <p className="text-gray-500">Welcome back, Admin! Here's what's happening today.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {statCards.map((card, index) => (
                    <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                            <div className={`p-3 rounded-xl ${card.color} text-white`}>
                                <card.icon size={24} />
                            </div>
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${index === 2 ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'}`}>
                                {card.trend}
                            </span>
                        </div>
                        <div className="mt-4">
                            <h3 className="text-sm font-medium text-gray-500">{card.title}</h3>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-bold text-gray-800">{card.value}</span>
                                <TrendingUp size={16} className="text-green-500" />
                            </div>
                            <p className="text-xs text-gray-400 mt-1">{card.description}</p>
                        </div>
                    </div>
                ))}
            </div>


        </div>
    );
};

export default DashboardOverview;
