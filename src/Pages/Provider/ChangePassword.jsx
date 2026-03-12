import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle2, Loader2, ShieldCheck } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const ChangePassword = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [passwords, setPasswords] = useState({ newPassword: '', confirmPassword: '' });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const navigate = useNavigate();
    const { logout } = useAuth();
    const apiUrl = import.meta.env.VITE_API_URL;

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (passwords.newPassword !== passwords.confirmPassword) {
            return toast.error("Passwords do not match");
        }

        if (passwords.newPassword.length < 6) {
            return toast.error("Password must be at least 6 characters long");
        }

        setLoading(true);

        try {
            const response = await axios.patch(
                `${apiUrl}/api/auth/update-password`,
                { newPassword: passwords.newPassword }
            );

            if (response.data.success) {
                setSuccess(true);
                toast.success("Password updated successfully!");

                // Log out after password change for security, or redirect to dashboard
                setTimeout(() => {
                    toast.success("Please login again with your new password");
                    logout();
                    navigate('/login');
                }, 2000);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
            <div className="w-full max-w-[440px] relative z-10">
                <div className="flex flex-col items-center mb-8">
                    <div className="p-3 bg-orange-600 rounded-2xl shadow-xl shadow-orange-200 mb-4">
                        <ShieldCheck className="text-white h-8 w-8" />
                    </div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 text-center">
                        Secure Your <span className="text-orange-600">Account</span>
                    </h1>
                    <p className="text-slate-500 mt-2 font-medium text-center">Please set a new password to continue</p>
                </div>

                <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-8 md:p-10 shadow-xl shadow-slate-200/60 border border-white">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">New Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-orange-600 transition-colors" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    className="w-full bg-slate-100/50 border border-slate-200 rounded-2xl py-4 pl-12 pr-12 focus:outline-none focus:ring-4 focus:ring-orange-600/5 focus:border-orange-600 transition-all font-medium text-slate-900"
                                    onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
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

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">Confirm New Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-orange-600 transition-colors" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    className="w-full bg-slate-100/50 border border-slate-200 rounded-2xl py-4 pl-12 pr-12 focus:outline-none focus:ring-4 focus:ring-orange-600/5 focus:border-orange-600 transition-all font-medium text-slate-900"
                                    onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <button
                            disabled={loading || success}
                            className={`w-full py-4 rounded-2xl font-black text-base shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 group mt-2 disabled:cursor-not-allowed ${success
                                ? 'bg-green-500 text-white shadow-green-200'
                                : 'bg-orange-600 hover:bg-orange-700 text-white shadow-orange-200'
                                }`}
                        >
                            {loading ? (
                                <Loader2 className="h-6 w-6 animate-spin text-white" />
                            ) : success ? (
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="h-6 w-6" />
                                    Updated!
                                </div>
                            ) : (
                                "Update Password"
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ChangePassword;
