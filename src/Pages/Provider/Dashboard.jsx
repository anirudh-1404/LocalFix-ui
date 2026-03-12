import React from 'react';
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

const Dashboard = () => {
    const { user } = useAuth();

    const stats = [
        { label: 'Total Bookings', value: '0', icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Completed', value: '0', icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
        { label: 'Pending', value: '0', icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' },
        { label: 'Rating', value: '5.0', icon: Star, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    ];

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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Bookings (Placeholder) */}
                <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-xl font-black text-slate-900">Recent Bookings</h2>
                            <p className="text-slate-500 text-sm font-medium">Your latest service requests</p>
                        </div>
                        <button className="text-orange-600 font-bold text-sm hover:underline flex items-center gap-1">
                            View All <ArrowUpRight size={16} />
                        </button>
                    </div>

                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="bg-slate-50 p-6 rounded-full mb-4">
                            <AlertCircle className="text-slate-300 h-12 w-12" />
                        </div>
                        <h3 className="text-slate-900 font-bold text-lg">No bookings yet</h3>
                        <p className="text-slate-500 max-w-xs mt-2">
                            When customers book your services, they will appear here. Make sure your profile is complete!
                        </p>
                    </div>
                </div>

                {/* Profile Completeness (Placeholder) */}
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 p-8">
                    <h2 className="text-xl font-black text-slate-900 mb-2">Service Profile</h2>
                    <p className="text-slate-500 text-sm font-medium mb-8">Improve your visibility</p>

                    <div className="space-y-6">
                        <div className="p-4 bg-orange-50 border border-orange-100 rounded-2xl">
                            <h4 className="text-orange-900 font-bold text-sm flex items-center gap-2">
                                <CheckCircle2 size={16} /> Verified account
                            </h4>
                            <p className="text-orange-700 text-xs mt-1">Your application was approved by the admin team.</p>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-600 font-bold">Profile Progress</span>
                                <span className="text-orange-600 font-black">40%</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                                <div className="bg-orange-600 h-full w-[40%] rounded-full shadow-lg shadow-orange-200" />
                            </div>
                        </div>

                        <ul className="space-y-3">
                            {[
                                { text: 'Add service description', done: true },
                                { text: 'Upload portfolio photos', done: false },
                                { text: 'Set your pricing', done: false },
                                { text: 'Add business hours', done: false },
                            ].map((item, idx) => (
                                <li key={idx} className="flex items-center gap-3 text-sm">
                                    <div className={`p-1 rounded-md ${item.done ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                                        <CheckCircle2 size={14} />
                                    </div>
                                    <span className={item.done ? 'text-slate-400 line-through font-medium' : 'text-slate-700 font-bold'}>
                                        {item.text}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
