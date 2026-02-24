import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User, Hammer, ChevronRight, ArrowRight, LogOut, LayoutDashboard, ShoppingCart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();
    const { user, logout } = useAuth();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        // Prevent body scroll when mobile menu is open
        if (isOpen) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = 'unset';

        return () => window.removeEventListener('scroll', handleScroll);
    }, [isOpen]);

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Services', path: '/services' },
        { name: 'About', path: '/about' },
        { name: 'Contact', path: '/contact' },
    ];

    return (
        <>
            <nav
                className={`fixed top-0 w-full z-[100] transition-all duration-500 ease-in-out ${scrolled || isOpen
                    ? 'bg-white/70 backdrop-blur-md shadow-lg border-b border-white/20 py-3'
                    : 'bg-transparent py-5'
                    }`}
            >
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="flex justify-between items-center">
                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-3 group relative z-[110]">
                            <div className="p-2.5 bg-blue-600 rounded-xl group-hover:rotate-12 group-hover:scale-110 transition-all duration-300 shadow-lg shadow-blue-200/50">
                                <Hammer className="text-white h-5 w-5 md:h-6 md:w-6" />
                            </div>
                            <span className="text-xl md:text-2xl font-black tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
                                Local<span className="text-blue-600 group-hover:text-slate-900 transition-colors">Fixer</span>
                            </span>
                        </Link>

                        {/* Desktop Links */}
                        <div className="hidden md:flex items-center gap-1 bg-white/50 backdrop-blur-md p-1.5 rounded-full border border-slate-200/40 shadow-sm">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    className={`px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 ${location.pathname === link.path
                                        ? 'bg-blue-600 text-white shadow-md'
                                        : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50/50'
                                        }`}
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </div>

                        {/* Desktop Actions */}
                        <div className="hidden md:flex items-center gap-3">
                            <Link to="/provider-enrollment" className="text-slate-600 hover:text-blue-600 font-bold text-sm mr-2">
                                Become a Partner
                            </Link>
                            {user && (
                                <Link to="/cart" className="p-2 text-slate-600 hover:text-blue-600 transition-colors relative">
                                    <ShoppingCart className="w-5 h-5" />
                                    {/* Optional Badge if we want to fetch cart count in Navbar context/global state */}
                                </Link>
                            )}
                            {!user ? (
                                <Link to="/login" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-100 flex items-center gap-2 group">
                                    Login
                                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            ) : (
                                <div className="flex items-center gap-3">
                                    {user.role === 'admin' ? (
                                        <Link to="/admin/dashboard" className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg flex items-center gap-2 group">
                                            <LayoutDashboard className="h-4 w-4" />
                                            Dashboard
                                        </Link>
                                    ) : (
                                        <Link to="/profile" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-100 flex items-center gap-2 group">
                                            <User className="h-4 w-4" />
                                            Profile
                                        </Link>
                                    )}
                                    <button
                                        onClick={logout}
                                        className="p-2.5 text-slate-600 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors"
                                        title="Logout"
                                    >
                                        <LogOut className="h-5 w-5" />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Mobile Toggle */}
                        <button
                            className="md:hidden relative z-[110] p-2.5 rounded-xl bg-blue-600 text-white shadow-lg active:scale-95 hover:bg-blue-700 transition-all duration-300"
                            onClick={() => setIsOpen(!isOpen)}
                        >
                            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </nav>

            {/* FULL SCREEN MOBILE MENU */}
            <div
                className={`fixed inset-0 z-[90] md:hidden transition-all duration-500 ease-in-out ${isOpen ? 'visible opacity-100' : 'invisible opacity-0'
                    }`}
            >
                {/* Backdrop Overlay */}
                <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setIsOpen(false)} />

                {/* Menu Content */}
                <div
                    className={`absolute right-0 top-0 h-full w-[80%] max-w-sm bg-white shadow-2xl transition-transform duration-500 ease-out ${isOpen ? 'translate-x-0' : 'translate-x-full'
                        }`}
                >
                    <div className="flex flex-col h-full p-8 pt-24">
                        <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6">Navigation</p>

                        <div className="flex flex-col gap-2">
                            {navLinks.map((link, i) => (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    onClick={() => setIsOpen(false)}
                                    className={`flex items-center justify-between group p-4 rounded-2xl transition-all ${location.pathname === link.path
                                        ? 'bg-blue-50 text-blue-600'
                                        : 'hover:bg-slate-50 text-slate-800'
                                        }`}
                                    style={{ transitionDelay: `${i * 50}ms` }}
                                >
                                    <span className="text-xl font-bold">{link.name}</span>
                                    <ChevronRight className={`h-5 w-5 transition-transform ${location.pathname === link.path ? 'translate-x-0' : '-translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0'}`} />
                                </Link>
                            ))}
                            <Link
                                to="/provider-enrollment"
                                onClick={() => setIsOpen(false)}
                                className={`flex items-center justify-between group p-4 rounded-2xl transition-all ${location.pathname === '/provider-enrollment'
                                    ? 'bg-blue-50 text-blue-600'
                                    : 'hover:bg-slate-50 text-orange-600'
                                    }`}
                            >
                                <span className="text-xl font-bold">Become a Partner</span>
                                <ChevronRight className="h-5 w-5" />
                            </Link>
                        </div>

                        <div className="mt-auto space-y-4">
                            {!user ? (
                                <Link
                                    to="/login"
                                    onClick={() => setIsOpen(false)}
                                    className="w-full py-4 flex items-center justify-center gap-2 font-bold text-white bg-blue-600 rounded-2xl shadow-lg shadow-blue-100"
                                >
                                    <User className="h-5 w-5" />
                                    Account Login
                                </Link>
                            ) : (
                                <div className="space-y-3">
                                    {user.role === 'admin' ? (
                                        <Link
                                            to="/admin/dashboard"
                                            onClick={() => setIsOpen(false)}
                                            className="w-full py-4 flex items-center justify-center gap-2 font-bold text-white bg-slate-900 rounded-2xl shadow-lg"
                                        >
                                            <LayoutDashboard className="h-5 w-5" />
                                            Admin Dashboard
                                        </Link>
                                    ) : (
                                        <Link
                                            to="/profile"
                                            onClick={() => setIsOpen(false)}
                                            className="w-full py-4 flex items-center justify-center gap-2 font-bold text-white bg-blue-600 rounded-2xl shadow-lg shadow-blue-100"
                                        >
                                            <User className="h-5 w-5" />
                                            My Profile
                                        </Link>
                                    )}
                                    <button
                                        onClick={() => {
                                            logout();
                                            setIsOpen(false);
                                        }}
                                        className="w-full py-4 flex items-center justify-center gap-2 font-bold text-red-600 border border-red-100 bg-red-50 rounded-2xl"
                                    >
                                        <LogOut className="h-5 w-5" />
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Navbar;
