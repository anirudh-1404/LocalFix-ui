import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Hammer, Mail, Lock, User, Eye, EyeOff, ArrowRight, Chrome, Facebook, Loader2, CheckCircle2 } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);

        try {
            const apiUrl = import.meta.env.VITE_API_URL;
            const response = await axios.post(`${apiUrl}/api/auth/signup`, formData, { withCredentials: true });

            if (response.data.success) {
                setSuccess(true);
                login(response.data.data);

                setTimeout(() => {
                    const role = response.data.data.role;
                    if (role === 'admin') {
                        navigate('/admin/dashboard');
                    } else if (role === 'serviceProvider') {
                        navigate('/provider/dashboard');
                    } else {
                        navigate('/');
                    }
                }, 1500);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
            <div className="w-full max-w-[460px] relative z-10">
                {/* Header */}
                <div className="flex flex-col items-center mb-8">
                    <div className="p-3 bg-blue-600 rounded-2xl shadow-xl shadow-blue-200 mb-4 group hover:rotate-12 transition-transform duration-300">
                        <Hammer className="text-white h-8 w-8" />
                    </div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 text-center">
                        Create <span className="text-blue-600">Account</span>
                    </h1>
                    <p className="text-slate-500 mt-2 font-medium">Join the LocalFix community today</p>
                </div>

                {/* Main Card */}
                <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-8 md:p-10 shadow-xl shadow-slate-200/60 border border-white">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm font-bold rounded-2xl animate-shake">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Name Field */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-slate-700 ml-1">Full Name</label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="John Doe"
                                    className="w-full bg-slate-100/50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all font-medium text-slate-900"
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        {/* Email Field */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-slate-700 ml-1">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                                <input
                                    type="email"
                                    placeholder="name@example.com"
                                    className="w-full bg-slate-100/50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all font-medium text-slate-900"
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-slate-700 ml-1">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Create a password"
                                    className="w-full bg-slate-100/50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-12 focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all font-medium text-slate-900"
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            disabled={loading || success}
                            className={`w-full py-4 rounded-2xl font-black text-base shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 group mt-4 disabled:cursor-not-allowed ${success
                                ? 'bg-green-500 text-white shadow-green-200'
                                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200'
                                }`}
                        >
                            {loading ? (
                                <Loader2 className="h-6 w-6 animate-spin text-white" />
                            ) : success ? (
                                <div className="flex items-center gap-2 animate-bounce-slow">
                                    <CheckCircle2 className="h-6 w-6" />
                                    Welcome Aboard!
                                </div>
                            ) : (
                                <>
                                    Get Started
                                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-100"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-4 text-slate-400 font-bold tracking-widest">Or sign up with</span>
                        </div>
                    </div>

                    {/* Social Grid */}
                    <div className="grid grid-cols-2 gap-3">
                        <button className="flex items-center justify-center gap-2 py-3 px-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors font-bold text-slate-700 text-xs">
                            <Chrome className="h-4 w-4" /> Google
                        </button>
                        <button className="flex items-center justify-center gap-2 py-3 px-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors font-bold text-slate-700 text-xs">
                            <Facebook className="h-4 w-4 text-blue-600 fill-blue-600" /> Facebook
                        </button>
                    </div>
                </div>

                {/* Terms & Footer */}
                <div className="text-center mt-8 space-y-4">
                    <p className="text-xs text-slate-400 px-8 leading-relaxed font-medium">
                        By signing up, you agree to our
                        <a href="#" className="text-slate-600 font-bold hover:underline"> Terms </a>
                        &
                        <a href="#" className="text-slate-600 font-bold hover:underline"> Privacy Policy</a>.
                    </p>

                    <p className="text-slate-500 font-medium">
                        Already have an account? {' '}
                        <Link to="/login" className="text-blue-600 font-bold hover:underline">
                            Log in here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
