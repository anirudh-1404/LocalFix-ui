import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    TrendingUp,
    Users,
    Calendar,
    Star,
    CheckCircle2,
    Clock,
    AlertCircle,
    ArrowUpRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const { user } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const apiUrl = import.meta.env.VITE_API_URL;

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const res = await axios.get(`${apiUrl}/api/booking/provider/bookings`, { withCredentials: true });
                if (res.data.success) {
                    setBookings(res.data.data);
                }
            } catch (error) {
                console.error("Failed to fetch dashboard bookings", error);
            } finally {
                setLoading(false);
            }
        };
        fetchBookings();
    }, [apiUrl]);

    // Derived stats
    const totalBookings = bookings.length;
    const completedBookings = bookings.filter(b => b.status === 'completed');
    const pendingBookings = bookings.filter(b => !['completed', 'cancelled'].includes(b.status)).length;
    
    // Calculate Average Rating based on customerRating
    const ratedBookings = completedBookings.filter(b => b.customerRating);
    const avgRating = ratedBookings.length > 0 
        ? (ratedBookings.reduce((sum, b) => sum + b.customerRating, 0) / ratedBookings.length).toFixed(1) 
        : '5.0'; // Default if no ratings

    const stats = [
        { label: 'Total Bookings', value: totalBookings.toString(), icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Completed', value: completedBookings.length.toString(), icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
        { label: 'Active Jobs', value: pendingBookings.toString(), icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' },
        { label: 'Rating', value: avgRating, icon: Star, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    ];

    const recentBookings = bookings.slice(0, 3);


    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Welcome Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900">
                        Hello, <span className="text-orange-600">{user?.name}</span>!
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">Here's what's happening with your services today.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm text-sm font-bold text-slate-600">
                        March 2026
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 hover:scale-[1.02] transition-transform duration-300">
                        <div className="flex items-start justify-between">
                            <div className={`${stat.bg} p-4 rounded-2xl`}>
                                <stat.icon className={`${stat.color} h-6 w-6`} />
                            </div>
                            <div className="flex items-center gap-1 text-green-600 text-xs font-black bg-green-50 px-2 py-1 rounded-full">
                                <TrendingUp size={12} />
                                +0%
                            </div>
                        </div>
                        <div className="mt-4">
                            <h3 className="text-slate-500 text-sm font-bold">{stat.label}</h3>
                            <p className="text-2xl font-black text-slate-900 mt-1">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Content Area */}
            <div className="w-full">
                {/* Recent Bookings */}
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-xl font-black text-slate-900">Recent Bookings</h2>
                            <p className="text-slate-500 text-sm font-medium">Your latest service requests</p>
                        </div>
                        <Link to="/provider/bookings" className="text-orange-600 font-bold text-sm hover:underline flex items-center gap-1">
                            View All <ArrowUpRight size={16} />
                        </Link>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
                        </div>
                    ) : recentBookings.length > 0 ? (
                        <div className="space-y-4">
                            {recentBookings.map(booking => (
                                <div key={booking._id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition border border-slate-100">
                                    <div className="flex gap-4 items-center">
                                        <div className="p-3 bg-white rounded-xl shadow-sm">
                                            <Calendar className="text-slate-400" size={20} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900">{booking.contactName || booking.customer?.name}</p>
                                            <p className="text-xs text-slate-500">{new Date(booking.scheduledDate).toLocaleDateString()} at {booking.startTime}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-black text-slate-900">₹{booking.totalPrice}</p>
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-orange-600">{booking.status.replace('_', ' ')}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="bg-slate-50 p-6 rounded-full mb-4">
                                <AlertCircle className="text-slate-300 h-12 w-12" />
                            </div>
                            <h3 className="text-slate-900 font-bold text-lg">No bookings yet</h3>
                            <p className="text-slate-500 max-w-xs mt-2">
                                When customers book your services, they will appear here. Make sure your profile is complete!
                            </p>
                        </div>
                    )}
                </div>
            </div>


        </div>
    );
};

export default Dashboard;
