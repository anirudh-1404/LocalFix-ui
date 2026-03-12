import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, MapPin, Phone, Plus, Trash2, Edit2, CheckCircle, ChevronRight, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Profile = () => {
    const { user, setUser } = useAuth();
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
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

    const apiUrl = import.meta.env.VITE_API_URL;

    useEffect(() => {
        if (user) {
            fetchAddresses();
        }
    }, [user]);

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
            <div className="max-w-4xl mx-auto px-6">
                {/* Profile Header */}
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 mb-8 flex flex-col md:flex-row items-center gap-8">
                    <div className="relative">
                        <div className="w-24 h-24 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-blue-200">
                            {user.name.charAt(0)}
                        </div>
                        <div className="absolute -bottom-2 -right-2 p-2 bg-white rounded-xl shadow-md border border-slate-100">
                            <Settings className="w-4 h-4 text-slate-400" />
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
                    <button className="px-6 py-2 border-2 border-slate-100 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition">
                        Edit Profile
                    </button>
                </div>

                {/* Addresses Section */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-blue-600" />
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
                            <h3 className="text-lg font-bold text-slate-900 mb-6">
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

                {/* Other Settings Placeholder */}
                <div className="mt-12 bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                    <h2 className="text-xl font-black text-slate-900 mb-6">Account Settings</h2>
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
        </div>
    );
};

export default Profile;
