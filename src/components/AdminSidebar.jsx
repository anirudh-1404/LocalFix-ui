import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    ClipboardList,
    ChevronLeft,
    ChevronRight,
    LogOut,
    Menu,
    X,
    Wrench
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AdminSidebar = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();
    const { logout } = useAuth();

    const menuItems = [
        { title: 'Overview', icon: LayoutDashboard, path: '/admin/dashboard' },
        { title: 'Services', icon: Wrench, path: '/admin/services' },
        { title: 'Users', icon: Users, path: '/admin/users' },
        { title: 'Provider Applications', icon: ClipboardList, path: '/admin/applications' },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <>
            {/* Mobile Menu Toggle */}
            <div className="lg:hidden fixed top-[72px] left-4 z-50">
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2.5 bg-white rounded-xl shadow-xl text-blue-600 border border-slate-100 active:scale-95 transition-all"
                >
                    {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </div>

            {/* Backdrop for mobile */}
            {isMobileMenuOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar Container */}
            <aside
                className={`
                    fixed lg:static inset-y-0 left-0 z-40
                    bg-white border-r border-gray-100 transition-all duration-300 ease-in-out
                    ${isCollapsed ? 'w-20' : 'w-64'}
                    ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                `}
            >
                <div className="h-full flex flex-col p-4">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8 px-2">
                        {!isCollapsed && (
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-blue-600 rounded-lg">
                                    <Wrench className="text-white h-4 w-4" />
                                </div>
                                <span className="text-xl font-bold text-slate-800">Admin</span>
                            </div>
                        )}
                        <button
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            className="hidden lg:block p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-blue-600 transition-colors"
                        >
                            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 space-y-2">
                        {menuItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`
                                    flex items-center p-3 rounded-xl transition-all duration-200 group
                                    ${isActive(item.path)
                                        ? 'bg-blue-50 text-blue-600'
                                        : 'text-gray-500 hover:bg-blue-50/50 hover:text-blue-600'}
                                `}
                            >
                                <item.icon className={`transition-colors ${isActive(item.path) ? 'text-blue-600' : 'group-hover:text-blue-600'}`} size={22} />
                                {!isCollapsed && <span className="ml-3 font-medium">{item.title}</span>}
                            </Link>
                        ))}
                    </nav>

                    {/* Footer */}
                    <div className="mt-auto pt-4 border-t border-gray-100">
                        <button
                            onClick={logout}
                            className={`
                                flex items-center w-full p-3 rounded-xl text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200
                            `}
                        >
                            <LogOut size={22} />
                            {!isCollapsed && <span className="ml-3 font-medium">Logout</span>}
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default AdminSidebar;
