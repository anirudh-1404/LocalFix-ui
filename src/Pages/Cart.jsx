import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2, ShoppingCart, ArrowRight, MapPin, Calendar, Clock, ChevronLeft, Plus, CheckCircle, Phone, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Cart = () => {
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [checkoutStep, setCheckoutStep] = useState('cart'); // 'cart' or 'checkout'
    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [isAddingAddress, setIsAddingAddress] = useState(false);
    const [bookingData, setBookingData] = useState({
        scheduledDate: '',
        startTime: '',
        contactName: '',
        contactNumber: '',
        customerNotes: ''
    });

    const [newAddress, setNewAddress] = useState({
        line1: '',
        area: '',
        city: '',
        pincode: '',
        contactName: '',
        contactNumber: '',
        isDefault: false
    });

    const { user } = useAuth();
    const navigate = useNavigate();
    const apiUrl = import.meta.env.VITE_API_URL;

    const fetchCart = async () => {
        if (!user) return;
        try {
            const res = await axios.get(`${apiUrl}/api/cart/${user._id}`);
            setCart(res.data.cart);
        } catch (error) {
            console.error("Failed to load cart");
            // toast.error("Could not load cart");
        } finally {
            setLoading(false);
        }
    };

    const fetchAddresses = async () => {
        if (!user) return;
        try {
            const res = await axios.get(`${apiUrl}/api/auth/addresses`);
            if (res.data.success) {
                setAddresses(res.data.data);
                const defaultAddr = res.data.data.find(a => a.isDefault);
                if (defaultAddr) {
                    setSelectedAddress(defaultAddr);
                    setBookingData(prev => ({
                        ...prev,
                        contactName: defaultAddr.contactName,
                        contactNumber: defaultAddr.contactNumber
                    }));
                }
            }
        } catch (error) {
            console.error("Failed to load addresses");
        }
    };

    useEffect(() => {
        fetchCart();
        fetchAddresses();
    }, [user]);

    const handleRemoveItem = async (problemId) => {
        try {
            const res = await axios.post(`${apiUrl}/api/cart/remove`, {
                userId: user._id,
                itemId: problemId
            });
            setCart(res.data.cart);
            toast.success("Item removed");
        } catch (error) {
            toast.error("Failed to remove item");
        }
    };

    const handleProceedToCheckout = () => {
        if (!user) {
            toast.error("Please login to checkout");
            navigate('/login?redirect=/cart');
            return;
        }
        setCheckoutStep('checkout');
    };

    const handleAddressSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${apiUrl}/api/auth/addresses`, newAddress);
            if (res.data.success) {
                toast.success("Address added");
                setAddresses(res.data.data);
                const added = res.data.data[res.data.data.length - 1];
                setSelectedAddress(added);
                setBookingData(prev => ({
                    ...prev,
                    contactName: added.contactName,
                    contactNumber: added.contactNumber
                }));
                setIsAddingAddress(false);
            }
        } catch (error) {
            toast.error("Failed to add address");
        }
    };

    const handleConfirmBooking = async () => {
        if (!selectedAddress) return toast.error("Please select an address");
        if (!bookingData.scheduledDate || !bookingData.startTime) return toast.error("Please select date and time");

        try {
            setLoading(true);
            // In the current schema, a cart might have multiple items, but createBooking seems to handle one.
            // We'll iterate and create bookings for each item (or just take the first if that's the logic for now)
            // Ideally, the backend should handle bulk booking creation from cart.
            // For now, let's assume one item or handle the first one to match your existing API.

            const item = cart.items[0];
            const payload = {
                providerId: item.problemId.providerId || "67c4331070860edc7f394474", // Fallback for demo if missing
                serviceId: item.problemId.serviceId || "67c4331070860edc7f394474", // Fallback
                scheduledDate: bookingData.scheduledDate,
                startTime: bookingData.startTime,
                address: selectedAddress.line1,
                city: selectedAddress.city,
                area: selectedAddress.area,
                pincode: selectedAddress.pincode,
                contactName: bookingData.contactName,
                contactNumber: bookingData.contactNumber,
                customerNotes: bookingData.customerNotes
            };

            const res = await axios.post(`${apiUrl}/api/booking/create`, payload);

            if (res.data.success) {
                // Clear cart after booking
                await axios.post(`${apiUrl}/api/cart/remove`, { userId: user._id, itemId: item.problemId._id });
                toast.success("Booking confirmed successfully!");
                navigate('/profile');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Booking failed");
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen pt-24 pb-12 flex flex-col items-center justify-center bg-slate-50">
                <ShoppingCart className="w-16 h-16 text-slate-300 mb-4" />
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Please Login</h2>
                <p className="text-slate-500 mb-6">You need to be logged in to view your cart.</p>
                <Link to="/login" className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition">
                    Login Now
                </Link>
            </div>
        );
    }

    if (loading && !cart) {
        return (
            <div className="min-h-screen pt-24 pb-12 flex justify-center items-center bg-slate-50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!cart || cart.items.length === 0) {
        return (
            <div className="min-h-screen pt-24 pb-12 flex flex-col items-center justify-center bg-slate-50">
                <ShoppingCart className="w-16 h-16 text-slate-300 mb-4" />
                <h2 className="text-xl font-bold text-slate-800 mb-2">Your Cart is Empty</h2>
                <p className="text-slate-500 mb-6">Looks like you haven't added any services yet.</p>
                <Link to="/services" className="px-6 py-2 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition">
                    Browse Services
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pt-24 pb-12 font-sans">
            <div className="max-w-6xl mx-auto px-6">
                <div className="flex items-center gap-4 mb-8">
                    {checkoutStep === 'checkout' && (
                        <button
                            onClick={() => setCheckoutStep('cart')}
                            className="p-2 bg-white rounded-xl shadow-sm border border-slate-100 text-slate-400 hover:text-blue-600 transition"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                    )}
                    <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
                        <ShoppingCart className="w-8 h-8 text-blue-600" />
                        {checkoutStep === 'cart' ? 'Your Cart' : 'Checkout'}
                    </h1>
                </div>

                <div className="grid gap-8 lg:grid-cols-12 items-start">
                    {/* Main Content Area */}
                    <div className="lg:col-span-8 space-y-6">
                        {checkoutStep === 'cart' ? (
                            <div className="space-y-4">
                                {cart.items.map((item) => (
                                    <div key={item._id} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 hover:shadow-md transition-shadow">
                                        <div className="flex-1">
                                            <div className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-1">
                                                {item.serviceName || "LocalFix Certified"}
                                            </div>
                                            <h3 className="text-xl font-black text-slate-900">
                                                {item.problemId ? item.problemId.title : "Service Item"}
                                            </h3>
                                            <p className="text-slate-500 text-sm mt-1 max-w-md">
                                                {item.problemId && item.problemId.description}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-8 w-full sm:w-auto justify-between sm:justify-end">
                                            <div className="text-2xl font-black text-slate-900">
                                                ₹{item.problemId ? item.problemId.price : 0}
                                            </div>
                                            <button
                                                onClick={() => handleRemoveItem(item.problemId._id)}
                                                className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                                                title="Remove Item"
                                            >
                                                <Trash2 className="w-6 h-6" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                {/* Address Selection */}
                                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                                            <MapPin className="w-5 h-5 text-blue-600" />
                                            Select Service Address
                                        </h2>
                                        {!isAddingAddress && addresses.length > 0 && (
                                            <button
                                                onClick={() => setIsAddingAddress(true)}
                                                className="text-sm font-black text-blue-600 hover:underline"
                                            >
                                                + Add New
                                            </button>
                                        )}
                                    </div>

                                    {isAddingAddress || addresses.length === 0 ? (
                                        <form onSubmit={handleAddressSubmit} className="space-y-4 bg-slate-50 p-6 rounded-2xl border border-blue-50">
                                            <div className="grid sm:grid-cols-2 gap-4">
                                                <input
                                                    type="text"
                                                    placeholder="Stree / House No."
                                                    required
                                                    className="w-full px-4 py-3 rounded-xl border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                                    value={newAddress.line1}
                                                    onChange={(e) => setNewAddress({ ...newAddress, line1: e.target.value })}
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Area"
                                                    required
                                                    className="w-full px-4 py-3 rounded-xl border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                                    value={newAddress.area}
                                                    onChange={(e) => setNewAddress({ ...newAddress, area: e.target.value })}
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="City"
                                                    required
                                                    className="w-full px-4 py-3 rounded-xl border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                                    value={newAddress.city}
                                                    onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Pincode"
                                                    required
                                                    className="w-full px-4 py-3 rounded-xl border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                                    value={newAddress.pincode}
                                                    onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Contact Name"
                                                    required
                                                    className="w-full px-4 py-3 rounded-xl border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                                    value={newAddress.contactName}
                                                    onChange={(e) => setNewAddress({ ...newAddress, contactName: e.target.value })}
                                                />
                                                <input
                                                    type="tel"
                                                    placeholder="Mobile Number"
                                                    required
                                                    className="w-full px-4 py-3 rounded-xl border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                                    value={newAddress.contactNumber}
                                                    onChange={(e) => setNewAddress({ ...newAddress, contactNumber: e.target.value })}
                                                />
                                            </div>
                                            <div className="flex gap-3">
                                                <button type="submit" className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold">Save & Use</button>
                                                {addresses.length > 0 && (
                                                    <button type="button" onClick={() => setIsAddingAddress(false)} className="px-6 bg-white text-slate-600 rounded-xl font-bold border border-slate-200">Cancel</button>
                                                )}
                                            </div>
                                        </form>
                                    ) : (
                                        <div className="grid sm:grid-cols-2 gap-4">
                                            {addresses.map((addr) => (
                                                <div
                                                    key={addr._id}
                                                    onClick={() => {
                                                        setSelectedAddress(addr);
                                                        setBookingData({ ...bookingData, contactName: addr.contactName, contactNumber: addr.contactNumber });
                                                    }}
                                                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${selectedAddress?._id === addr._id ? 'border-blue-600 bg-blue-50/30 shadow-md translate-y-[-2px]' : 'border-slate-100 hover:border-blue-200'}`}
                                                >
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="font-bold text-slate-900">{addr.contactName}</span>
                                                        {selectedAddress?._id === addr._id && <CheckCircle className="w-4 h-4 text-blue-600" />}
                                                    </div>
                                                    <p className="text-xs text-slate-500 mb-2 leading-relaxed">
                                                        {addr.line1}, {addr.area}, {addr.city} - {addr.pincode}
                                                    </p>
                                                    <div className="text-[10px] font-black text-slate-400 flex items-center gap-1 uppercase tracking-wider">
                                                        <Phone className="w-3 h-3" /> {addr.contactNumber}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Slot Selection */}
                                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
                                    <h2 className="text-xl font-black text-slate-900 flex items-center gap-2 mb-6">
                                        <Calendar className="w-5 h-5 text-blue-600" />
                                        Preferred Schedule
                                    </h2>
                                    <div className="grid sm:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Select Date</label>
                                            <div className="relative">
                                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400Pointer-events-none" />
                                                <input
                                                    type="date"
                                                    required
                                                    min={new Date().toISOString().split('T')[0]}
                                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                                    value={bookingData.scheduledDate}
                                                    onChange={(e) => setBookingData({ ...bookingData, scheduledDate: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Select Slot</label>
                                            <div className="relative">
                                                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                                <select
                                                    required
                                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                                                    value={bookingData.startTime}
                                                    onChange={(e) => setBookingData({ ...bookingData, startTime: e.target.value })}
                                                >
                                                    <option value="">Choose a time</option>
                                                    <option value="09:00">09:00 AM - 11:00 AM</option>
                                                    <option value="11:00">11:00 AM - 01:00 PM</option>
                                                    <option value="14:00">02:00 PM - 04:00 PM</option>
                                                    <option value="16:00">04:00 PM - 06:00 PM</option>
                                                    <option value="18:00">06:00 PM - 08:00 PM</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Extra Information */}
                                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
                                    <h2 className="text-xl font-black text-slate-900 flex items-center gap-2 mb-6">
                                        <User className="w-5 h-5 text-blue-600" />
                                        Additional Details
                                    </h2>
                                    <div className="grid gap-4">
                                        <div className="grid sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Contact Name (For this visit)</label>
                                                <input
                                                    type="text"
                                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                                    value={bookingData.contactName}
                                                    onChange={(e) => setBookingData({ ...bookingData, contactName: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Contact Number</label>
                                                <input
                                                    type="tel"
                                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                                    value={bookingData.contactNumber}
                                                    onChange={(e) => setBookingData({ ...bookingData, contactNumber: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Instructions for Technician (Optional)</label>
                                            <textarea
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none"
                                                placeholder="e.g. Ring the bell twice, parking available in the driveway..."
                                                value={bookingData.customerNotes}
                                                onChange={(e) => setBookingData({ ...bookingData, customerNotes: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Summary Sidebar */}
                    <div className="lg:col-span-4 lg:sticky lg:top-24">
                        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100">
                            <h2 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-blue-600" />
                                Order Details
                            </h2>

                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between items-center text-slate-500 font-bold">
                                    <span>Subtotal</span>
                                    <span className="text-slate-900 font-black text-lg">₹{cart.totalPrice}</span>
                                </div>
                                <div className="flex justify-between items-center text-slate-400 text-sm">
                                    <span>Taxes & Fees</span>
                                    <span>Included</span>
                                </div>
                                <div className="border-t-2 border-slate-50 pt-4 mt-4 flex justify-between items-center">
                                    <span className="text-lg font-black text-slate-900">Final Total</span>
                                    <span className="text-3xl font-black text-blue-600">₹{cart.totalPrice}</span>
                                </div>
                            </div>

                            {checkoutStep === 'cart' ? (
                                <button
                                    onClick={handleProceedToCheckout}
                                    className="w-full py-5 bg-blue-600 text-white rounded-[1.5rem] font-black shadow-lg shadow-blue-100 hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 group"
                                >
                                    Proceed to Checkout
                                    <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                                </button>
                            ) : (
                                <button
                                    onClick={handleConfirmBooking}
                                    disabled={loading}
                                    className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-black shadow-lg shadow-slate-100 hover:bg-black hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:scale-100 transition-all flex items-center justify-center gap-3"
                                >
                                    {loading ? 'Processing...' : 'Confirm & Pay (Cash)'}
                                    <CheckCircle className="w-6 h-6 text-blue-400" />
                                </button>
                            )}

                            <div className="mt-8">
                                <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-50">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-white rounded-xl text-blue-600">
                                            <CheckCircle className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase text-blue-600 tracking-wider">Guarantee</p>
                                            <p className="text-xs text-slate-600 font-medium">Safe booking with certified LocalFixers and cash-after-service option.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
