import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, MapPin, Phone, Plus, Trash2, Edit2, CheckCircle, ChevronRight, Settings, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Profile = () => {
    const { user, setUser } = useAuth();
    const [addresses, setAddresses] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'bookings', 'addresses', 'settings'
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [isAddingAddress, setIsAddingAddress] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);
    const [formData, setFormData] = useState({
        line1: '',
        area: '',
        city: '',
        pincode: '',
        contactName: '',
        contactNumber: '',
        isDefault: false
    });

    const [rating, setRating] = useState(5);
    const [review, setReview] = useState('');
    const [submittingRating, setSubmittingRating] = useState(false);

    const apiUrl = import.meta.env.VITE_API_URL;

    useEffect(() => {
        if (user) {
            fetchAddresses();
            fetchBookings();
        }
    }, [user]);

    const fetchBookings = async () => {
        try {
            const res = await axios.get(`${apiUrl}/api/booking/my-bookings`);
            if (res.data.success) {
                setBookings(res.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch bookings", error);
        }
    };

    const fetchAddresses = async () => {
        try {
            const res = await axios.get(`${apiUrl}/api/auth/addresses`);
            if (res.data.success) {
                setAddresses(res.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch addresses", error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSubmitAddress = async (e) => {
        e.preventDefault();
        try {
            let res;
            if (editingAddress) {
                res = await axios.patch(`${apiUrl}/api/auth/addresses/${editingAddress._id}`, formData);
            } else {
                res = await axios.post(`${apiUrl}/api/auth/addresses`, formData);
            }

            if (res.data.success) {
                toast.success(editingAddress ? "Address updated" : "Address added");
                setAddresses(res.data.data);
                resetForm();
            }
        } catch (error) {
            toast.error("Operation failed");
        }
    };

    const resetForm = () => {
        setFormData({
            line1: '',
            area: '',
            city: '',
            pincode: '',
            contactName: '',
            contactNumber: '',
            isDefault: false
        });
        setIsAddingAddress(false);
        setEditingAddress(null);
    };

    const handleEdit = (address) => {
        setFormData({
            line1: address.line1,
            area: address.area,
            city: address.city,
            pincode: address.pincode,
            contactName: address.contactName,
            contactNumber: address.contactNumber,
            isDefault: address.isDefault
        });
        setEditingAddress(address);
        setIsAddingAddress(true);
    };

    const handleRatingSubmit = async (e) => {
        e.preventDefault();
        setSubmittingRating(true);
        try {
            const res = await axios.patch(`${apiUrl}/api/booking/customer/${selectedBooking._id}/rate`, { 
                customerRating: rating, 
                customerReview: review 
            }, { withCredentials: true });

            if (res.data.success) {
                toast.success("Provider rated successfully!");
                setBookings(prev => prev.map(b => b._id === selectedBooking._id ? res.data.data : b));
                setSelectedBooking(res.data.data);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to submit rating.");
        } finally {
            setSubmittingRating(false);
        }
    };

    const handleDelete = async (addressId) => {
        if (!window.confirm("Delete this address?")) return;
        try {
            const res = await axios.delete(`${apiUrl}/api/auth/addresses/${addressId}`);
            if (res.data.success) {
                toast.success("Address deleted");
                setAddresses(res.data.data);
            }
        } catch (error) {
            toast.error("Failed to delete address");
        }
    };

    const sidebarItems = [
        { id: 'overview', title: 'Overview', icon: User },
        { id: 'bookings', title: 'My Bookings', icon: ChevronRight },
        { id: 'addresses', title: 'Addresses', icon: MapPin },
        { id: 'settings', title: 'Settings', icon: Settings },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'overview':
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center gap-8">
                            <div className="relative">
                                <div className="w-24 h-24 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-blue-200">
                                    {user.name.charAt(0)}
                                </div>
                            </div>
                            <div className="flex-1 text-center md:text-left">
                                <h1 className="text-3xl font-black text-slate-900">{user.name}</h1>
                                <p className="text-slate-500 font-medium">{user.email}</p>
                                <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-2">
                                    <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold uppercase tracking-wider">
                                        {user.role}
                                    </span>
                                    <span className="px-3 py-1 bg-slate-50 text-slate-500 rounded-full text-xs font-bold uppercase tracking-wider">
                                        Member since Mar 2026
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                                <h3 className="text-lg font-bold text-slate-900 mb-4">Quick Stats</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-blue-50/50 rounded-2xl">
                                        <p className="text-2xl font-black text-blue-600">{bookings.length}</p>
                                        <p className="text-xs font-bold text-slate-500 uppercase">Total Bookings</p>
                                    </div>
                                    <div className="p-4 bg-slate-50 rounded-2xl">
                                        <p className="text-2xl font-black text-slate-800">{addresses.length}</p>
                                        <p className="text-xs font-bold text-slate-500 uppercase">Saved Addresses</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
                                <h3 className="text-lg font-bold text-slate-900 mb-4 relative z-10">Latest Activity</h3>
                                {bookings.length > 0 ? (
                                    <div className="space-y-3 relative z-10">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 bg-green-500 rounded-full" />
                                            <p className="text-sm text-slate-600">
                                                Last booking: <span className="font-bold">{bookings[0].service?.name}</span>
                                            </p>
                                        </div>
                                        <p className="text-xs text-slate-400 ml-5">{new Date(bookings[0].createdAt).toLocaleDateString()}</p>
                                    </div>
                                ) : (
                                    <p className="text-sm text-slate-500 italic relative z-10">No recent activity</p>
                                )}
                            </div>
                        </div>
                    </div>
                );
            case 'bookings':
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-black text-slate-900">Booking History</h2>
                            <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold">{bookings.length} Orders</span>
                        </div>
                        
                        {bookings.length > 0 ? (
                            <div className="grid gap-4">
                                {bookings.map((booking) => (
                                    <div key={booking._id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="text-lg font-bold text-slate-900">
                                                    {booking.problemItems && booking.problemItems.length > 0 
                                                        ? (booking.problemItems.length > 1 
                                                            ? `${booking.problemItems[0].title} + ${booking.problemItems.length - 1} more` 
                                                            : booking.problemItems[0].title)
                                                        : booking.service?.name}
                                                </h3>
                                                <p className="text-sm text-slate-500">Booking ID: <span className="font-mono text-xs">#{booking._id.slice(-8)}</span></p>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                                booking.status === 'pending' ? 'bg-amber-50 text-amber-600' :
                                                booking.status === 'accepted' ? 'bg-blue-50 text-blue-600' :
                                                booking.status === 'completed' ? 'bg-green-50 text-green-600' :
                                                'bg-red-50 text-red-600'
                                            }`}>
                                                {booking.status}
                                            </span>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-y border-slate-50">
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Date</p>
                                                <p className="text-sm font-bold text-slate-700">{new Date(booking.scheduledDate).toLocaleDateString()}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Time</p>
                                                <p className="text-sm font-bold text-slate-700">{booking.startTime}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Provider</p>
                                                <p className="text-sm font-bold text-slate-700">{booking.provider?.businessName || 'Assigning...'}</p>
                                            </div>
                                            <div className="text-right md:text-left">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total</p>
                                                <p className="text-sm font-black text-blue-600">₹{booking.totalPrice}</p>
                                            </div>
                                        </div>

                                        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${booking.paymentStatus === 'paid' ? 'bg-green-500' : 'bg-slate-300'}`} />
                                                <p className="text-xs font-bold text-slate-500 capitalize">Payment: {booking.paymentStatus} via {booking.paymentMethod}</p>
                                            </div>
                                            <button 
                                                onClick={() => setSelectedBooking(booking)}
                                                className="text-sm font-bold text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-xl transition"
                                            >
                                                View Details
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white p-16 rounded-4xl border border-dashed border-slate-200 text-center">
                                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <ChevronRight className="w-10 h-10 text-slate-200" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 mb-2">No bookings yet</h3>
                                <p className="text-slate-500 mb-8">Ready to get things fixed around your home?</p>
                                <button className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-200 hover:bg-blue-700 transition" onClick={() => setActiveTab('overview')}>
                                    Browse Services
                                </button>
                            </div>
                        )}
                    </div>
                );
            case 'addresses':
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                                <MapPin className="w-6 h-6 text-blue-600" />
                                Saved Addresses
                            </h2>
                            {!isAddingAddress && (
                                <button
                                    onClick={() => setIsAddingAddress(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition shadow-lg shadow-blue-100"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add New
                                </button>
                            )}
                        </div>

                        {isAddingAddress ? (
                            <div className="bg-white rounded-3xl p-8 border border-blue-100 shadow-xl shadow-blue-50/50">
                                <h3 className="text-lg font-bold text-slate-900 mb-6 font-black uppercase tracking-wider">
                                    {editingAddress ? "Edit Address" : "Add New Address"}
                                </h3>
                                <form onSubmit={handleSubmitAddress} className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Street / House No.</label>
                                            <input
                                                type="text"
                                                name="line1"
                                                required
                                                value={formData.line1}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                                                placeholder="Example: 123 Main St, Apt 4B"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Area / Locality</label>
                                            <input
                                                type="text"
                                                name="area"
                                                required
                                                value={formData.area}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                                                placeholder="Example: Indiranagar"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">City</label>
                                                <input
                                                    type="text"
                                                    name="city"
                                                    required
                                                    value={formData.city}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                                                    placeholder="Bangalore"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Pincode</label>
                                                <input
                                                    type="text"
                                                    name="pincode"
                                                    required
                                                    value={formData.pincode}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                                                    placeholder="560038"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Contact Name</label>
                                            <input
                                                type="text"
                                                name="contactName"
                                                required
                                                value={formData.contactName}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                                                placeholder="Recipient's Name"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Contact Number</label>
                                            <div className="relative">
                                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                <input
                                                    type="tel"
                                                    name="contactNumber"
                                                    required
                                                    value={formData.contactNumber}
                                                    onChange={handleInputChange}
                                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                                                    placeholder="10-digit mobile"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 pt-2">
                                            <input
                                                type="checkbox"
                                                name="isDefault"
                                                id="isDefault"
                                                checked={formData.isDefault}
                                                onChange={handleInputChange}
                                                className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <label htmlFor="isDefault" className="text-sm font-bold text-slate-700">Set as default address</label>
                                        </div>
                                    </div>
                                    <div className="md:col-span-2 flex gap-4 pt-4">
                                        <button
                                            type="submit"
                                            className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-200 hover:bg-blue-700 transition"
                                        >
                                            {editingAddress ? "Save Changes" : "Save Address"}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={resetForm}
                                            className="px-8 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {addresses.length > 0 ? (
                                    addresses.map((addr) => (
                                        <div key={addr._id} className={`bg-white p-6 rounded-3xl border transition-all ${addr.isDefault ? 'border-blue-200 shadow-lg shadow-blue-50/50' : 'border-slate-100 shadow-sm'}`}>
                                            <div className="flex justify-between items-start gap-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <h4 className="font-bold text-slate-900">{addr.contactName}</h4>
                                                        {addr.isDefault && (
                                                            <span className="flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-tighter">
                                                                <CheckCircle className="w-3 h-3" /> Default
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-slate-600 text-sm leading-relaxed">
                                                        {addr.line1}, {addr.area}<br />
                                                        {addr.city}, {addr.pincode}
                                                    </p>
                                                    <div className="mt-3 flex items-center gap-1.5 text-blue-600 text-sm font-bold">
                                                        <Phone className="w-4 h-4" />
                                                        {addr.contactNumber}
                                                    </div>
                                                </div>
                                                <div className="flex flex-col gap-2">
                                                    <button
                                                        onClick={() => handleEdit(addr)}
                                                        className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(addr._id)}
                                                        className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="bg-white p-12 rounded-3xl border border-dashed border-slate-200 text-center">
                                        <MapPin className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                                        <p className="text-slate-500 font-medium">No saved addresses yet</p>
                                        <button
                                            onClick={() => setIsAddingAddress(true)}
                                            className="mt-4 text-blue-600 font-black hover:underline"
                                        >
                                            Add your first address
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                );
            case 'settings':
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                        <h2 className="text-2xl font-black text-slate-900">Account Settings</h2>
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                            <div className="space-y-4">
                                <button className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-blue-50 rounded-2xl group transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2.5 bg-white rounded-xl shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                            <Settings className="w-5 h-5" />
                                        </div>
                                        <span className="font-bold text-slate-700 group-hover:text-blue-600 transition-colors">Change Password</span>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                                </button>
                                <button className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-red-50 rounded-2xl group transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2.5 bg-white rounded-xl shadow-sm group-hover:bg-red-600 group-hover:text-white transition-colors">
                                            <Trash2 className="w-5 h-5" />
                                        </div>
                                        <span className="font-bold text-slate-700 group-hover:text-red-600 transition-colors">Delete Account</span>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-red-600 group-hover:translate-x-1 transition-all" />
                                </button>
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 pt-20">
                <div className="text-center">
                    <User className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-slate-800">Please login to view profile</h2>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pt-24 pb-12">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Sidebar */}
                    <aside className="w-full md:w-64 space-y-2">
                        <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100">
                            {sidebarItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all duration-300 ${
                                        activeTab === item.id 
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 translate-x-1' 
                                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                    }`}
                                >
                                    <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'animate-pulse' : ''}`} />
                                    <span className="text-sm">{item.title}</span>
                                    {item.id === 'bookings' && bookings.length > 0 && (
                                        <span className={`ml-auto px-2 py-0.5 rounded-full text-[10px] font-black ${
                                            activeTab === item.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                                        }`}>
                                            {bookings.length}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Logout / Helpful Info */}
                        <div className="p-6 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl text-white shadow-xl shadow-blue-100 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-150 duration-700" />
                            <h4 className="font-black text-sm mb-1 relative z-10">Need Help?</h4>
                            <p className="text-[10px] text-blue-100 mb-4 relative z-10 opacity-80">Our support team is active 24/7 for your needs.</p>
                            <button className="w-full py-2 bg-white text-blue-600 rounded-xl text-xs font-black shadow-lg hover:bg-blue-50 transition relative z-10">
                                Contact Support
                            </button>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1">
                        {renderContent()}
                    </main>
                </div>
            </div>

            {/* Booking Detail Modal */}
            {selectedBooking && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setSelectedBooking(null)} />
                    <div className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-300">
                        {/* Modal Header */}
                        <div className="bg-slate-50 px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-black text-slate-900">Booking Details</h3>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">ID: #{selectedBooking._id.slice(-12)}</p>
                            </div>
                            <button 
                                onClick={() => setSelectedBooking(null)}
                                className="p-2 hover:bg-white rounded-full transition-colors text-slate-400 hover:text-slate-900"
                            >
                                <Plus className="w-6 h-6 rotate-45" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-8 overflow-y-auto max-h-[70vh]">
                            
                            {/* Provider Rating Core */}
                            {selectedBooking.status === 'completed' && !selectedBooking.customerRating && (
                                <form onSubmit={handleRatingSubmit} className="bg-blue-50 p-6 rounded-3xl border border-blue-200 mb-8">
                                    <h4 className="font-black text-blue-900 mb-2 flex items-center gap-2 border-b border-blue-200 pb-3"><Star size={18}/> Rate Provider</h4>
                                    
                                    <div className="mb-6 mt-4">
                                        <label className="block text-sm font-bold text-blue-800 mb-2">How was the service?</label>
                                        <div className="flex gap-2">
                                            {[1,2,3,4,5].map(star => (
                                                <Star 
                                                    key={star} 
                                                    size={36} 
                                                    className={`cursor-pointer transition-all ${rating >= star ? 'fill-blue-500 text-blue-500 drop-shadow-md scale-110' : 'text-blue-200'}`}
                                                    onClick={() => setRating(star)}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    <div className="mb-6">
                                        <label className="block text-sm font-bold text-blue-800 mb-2">Write a Review (Optional)</label>
                                        <textarea 
                                            rows="2" 
                                            className="w-full bg-white border border-blue-200 rounded-xl p-3 focus:ring-4 focus:ring-blue-100 focus:border-blue-400 outline-none transition text-sm"
                                            placeholder="Tell us about your experience..."
                                            value={review}
                                            onChange={(e) => setReview(e.target.value)}
                                        ></textarea>
                                    </div>

                                    <button type="submit" disabled={submittingRating} className="w-full py-3 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-200 disabled:opacity-70 disabled:cursor-not-allowed">
                                        {submittingRating ? 'Saving Rating...' : 'Submit Rating'}
                                    </button>
                                </form>
                            )}

                            {selectedBooking.status === 'completed' && selectedBooking.customerRating && (
                                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex justify-between items-center mb-8">
                                    <div>
                                        <p className="text-xs font-bold text-slate-500 mb-1">Your Rating for Provider</p>
                                        <div className="flex gap-1">
                                            {[1,2,3,4,5].map(star => (
                                                <Star key={star} size={16} className={selectedBooking.customerRating >= star ? 'fill-blue-500 text-blue-500' : 'text-slate-300'} />
                                            ))}
                                        </div>
                                    </div>
                                    <div className="bg-green-100 text-green-700 p-2 rounded-full font-bold text-xs"><CheckCircle size={16}/> Rating Saved</div>
                                </div>
                            )}

                            <div className="grid gap-8">
                                {/* Service Info */}
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center flex-shrink-0 text-blue-600">
                                        <CheckCircle className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-sm font-black text-slate-400 uppercase tracking-wider mb-2">Service Details</h4>
                                        <div className="space-y-3">
                                            {selectedBooking.problemItems && selectedBooking.problemItems.length > 0 ? (
                                                selectedBooking.problemItems.map((item, idx) => (
                                                    <div key={idx} className="bg-slate-50 rounded-2xl p-4">
                                                        <div className="flex justify-between items-center mb-1">
                                                            <p className="font-bold text-slate-900">{item.title}</p>
                                                            <p className="font-black text-blue-600">₹{item.price}</p>
                                                        </div>
                                                        <p className="text-sm text-slate-500 leading-relaxed">
                                                            {item.description || "Professional service by LocalFix expert."}
                                                        </p>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="bg-slate-50 rounded-2xl p-4 text-center">
                                                    <p className="font-bold text-slate-900">{selectedBooking.service?.name}</p>
                                                    <p className="text-sm text-slate-500 italic">No specific problem details available.</p>
                                                </div>
                                            )}
                                            
                                            <div className="flex justify-between items-center px-4 pt-2 border-t border-slate-100">
                                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Amount</p>
                                                <p className="text-xl font-black text-blue-600">₹{selectedBooking.totalPrice}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Appointment Info */}
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center flex-shrink-0 text-amber-600">
                                        <ChevronRight className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-sm font-black text-slate-400 uppercase tracking-wider mb-2">Appointment</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-slate-50 rounded-2xl p-4">
                                                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Date</p>
                                                <p className="font-bold text-slate-800">{new Date(selectedBooking.scheduledDate).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
                                            </div>
                                            <div className="bg-slate-50 rounded-2xl p-4">
                                                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Time Slot</p>
                                                <p className="font-bold text-slate-800">{selectedBooking.startTime}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Address & Contact */}
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center flex-shrink-0 text-green-600">
                                        <MapPin className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-sm font-black text-slate-400 uppercase tracking-wider mb-2">Service Location</h4>
                                        <div className="bg-slate-50 rounded-2xl p-5">
                                            <p className="font-bold text-slate-800 mb-1">{selectedBooking.contactName}</p>
                                            <p className="text-sm text-slate-600 leading-relaxed mb-3">
                                                {selectedBooking.address}, {selectedBooking.area}<br />
                                                {selectedBooking.city} - {selectedBooking.pincode}
                                            </p>
                                            <div className="flex items-center gap-2 text-blue-600 font-bold text-sm">
                                                <Phone className="w-4 h-4" />
                                                {selectedBooking.contactNumber}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Payment Status */}
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center flex-shrink-0 text-slate-600">
                                        <Settings className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-sm font-black text-slate-400 uppercase tracking-wider mb-2">Payment Info</h4>
                                        <div className="bg-slate-50 rounded-2xl p-4 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-3 h-3 rounded-full ${selectedBooking.paymentStatus === 'paid' ? 'bg-green-500' : 'bg-amber-500'}`} />
                                                <p className="font-bold text-slate-700 capitalize">{selectedBooking.paymentStatus} via {selectedBooking.paymentMethod}</p>
                                            </div>
                                            {selectedBooking.razorpayPaymentId && (
                                                <p className="text-[10px] font-mono text-slate-400">Ref: {selectedBooking.razorpayPaymentId}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex gap-3">
                            <button 
                                onClick={() => setSelectedBooking(null)}
                                className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black shadow-lg hover:bg-slate-800 transition"
                            >
                                Close Details
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;
