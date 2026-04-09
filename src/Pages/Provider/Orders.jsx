import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
    Calendar,
    Clock,
    AlertCircle,
    MapPin,
    Eye,
    X,
    User,
    FileText,
    Navigation,
    CreditCard
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Orders = () => {
    const { user } = useAuth();
    const [availableRequests, setAvailableRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [passedRequests, setPassedRequests] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    
    const apiUrl = import.meta.env.VITE_API_URL;

    useEffect(() => {
        const fetchAvailableRequests = async () => {
            try {
                const res = await axios.get(`${apiUrl}/api/booking/provider/available`, { withCredentials: true });
                if (res.data.success) {
                    setAvailableRequests(res.data.data);
                }
            } catch (error) {
                console.error("Failed to fetch requests", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAvailableRequests();
        
        const interval = setInterval(fetchAvailableRequests, 15000);
        return () => clearInterval(interval);
    }, [apiUrl]);

    const handleAccept = async (bookingId) => {
        try {
            const res = await axios.patch(`${apiUrl}/api/booking/provider/${bookingId}/accept`, {}, { withCredentials: true });
            if (res.data.success) {
                toast.success("Order Accepted!");
                setAvailableRequests(prev => prev.filter(req => req._id !== bookingId));
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to accept order");
        }
    };

    const handlePass = (bookingId) => {
        setPassedRequests(prev => [...prev, bookingId]);
    };
    
    const visibleRequests = availableRequests.filter(req => !passedRequests.includes(req._id));

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900">
                        Open <span className="text-orange-600">Orders</span>
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">Available service requests matching your skills.</p>
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 p-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                            <AlertCircle className="text-orange-600 w-5 h-5"/>
                            Open Service Requests
                        </h2>
                        <p className="text-slate-500 text-sm font-medium">All pending bookings for your service category</p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
                    </div>
                ) : visibleRequests.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="bg-slate-50 p-6 rounded-full mb-4">
                            <Clock className="text-slate-300 h-12 w-12" />
                        </div>
                        <h3 className="text-slate-900 font-bold text-lg">No open requests</h3>
                        <p className="text-slate-500 max-w-xs mt-2">
                            There are no open service requests right now. We'll notify you when a customer books!
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {visibleRequests.map(req => (
                            <div key={req._id} className="p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:border-orange-200 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] uppercase font-black tracking-widest bg-orange-100 text-orange-600 px-2 py-1 rounded-md">
                                            {req.service?.name || "Service"}
                                        </span>
                                        <span className="text-sm font-bold text-slate-900 bg-white px-2 py-1 rounded-md border border-slate-200 shadow-sm">
                                            ₹{req.totalPrice}
                                        </span>
                                    </div>
                                    <div>
                                        {req.problemItems.map(p => (
                                            <p key={p._id} className="text-slate-900 font-bold">{p.title}</p>
                                        ))}
                                    </div>
                                    
                                    <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
                                        <div className="flex items-center gap-1">
                                            <Calendar size={14} className="text-slate-400"/>
                                            {new Date(req.scheduledDate).toLocaleDateString()} at {req.startTime}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <MapPin size={14} className="text-slate-400"/>
                                            {req.area}, {req.city} - {req.pincode}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex md:flex-col gap-2 w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t border-slate-100 md:border-0">
                                    <button 
                                        onClick={() => handleAccept(req._id)}
                                        className="flex-1 md:flex-none px-8 py-2.5 bg-orange-600 text-white font-bold rounded-xl shadow-md shadow-orange-200 hover:bg-orange-700 transition"
                                    >
                                        Accept
                                    </button>
                                    <div className="flex gap-2 w-full">
                                        <button 
                                            onClick={() => setSelectedOrder(req)}
                                            className="flex-1 px-4 py-2.5 bg-blue-50 text-blue-600 border border-blue-100 font-bold rounded-xl hover:bg-blue-100 transition flex items-center justify-center gap-2"
                                            title="View Details"
                                        >
                                            <Eye size={18} /> 
                                        </button>
                                        <button 
                                            onClick={() => handlePass(req._id)}
                                            className="flex-1 px-4 py-2.5 bg-white text-slate-400 border border-slate-200 font-bold rounded-xl hover:bg-slate-50 hover:text-slate-600 transition flex items-center justify-center gap-2"
                                            title="Pass Order"
                                        >
                                            <X size={18} /> 
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Order Details Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setSelectedOrder(null)}>
                    <div className="bg-white rounded-[2rem] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative" onClick={e => e.stopPropagation()}>
                        {/* Header */}
                        <div className="sticky top-0 bg-white/80 backdrop-blur-md p-6 border-b border-slate-100 flex items-center justify-between z-10">
                            <div>
                                <h3 className="text-xl font-black text-slate-900">Order Details</h3>
                                <p className="text-sm font-medium text-slate-500">#{selectedOrder._id.slice(-8).toUpperCase()}</p>
                            </div>
                            <button onClick={() => setSelectedOrder(null)} className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-xl transition">
                                <X size={24} />
                            </button>
                        </div>
                        
                        {/* Body */}
                        <div className="p-6 space-y-6">
                            {/* Customer Info */}
                            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2"><User size={14}/> Customer Details</h4>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-slate-500 font-bold mb-1">Name</p>
                                        <p className="text-slate-900 font-bold">{selectedOrder.contactName || selectedOrder.customer?.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 font-bold mb-1">Phone</p>
                                        <p className="text-slate-900 font-bold">{selectedOrder.contactNumber || "Hidden"}</p>
                                    </div>
                                    <div className="sm:col-span-2">
                                        <p className="text-xs text-slate-500 font-bold mb-1">Service Address</p>
                                        <p className="text-slate-900 font-medium leading-relaxed">{selectedOrder.address}, {selectedOrder.area}, {selectedOrder.city} - {selectedOrder.pincode}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Service Details */}
                            <div className="bg-orange-50/50 rounded-2xl p-5 border border-orange-100">
                                <h4 className="text-xs font-black uppercase tracking-widest text-orange-400 mb-4 flex items-center gap-2"><Calendar size={14}/> Schedule & Items</h4>
                                <div className="space-y-4">
                                    <div className="flex flex-wrap gap-4">
                                        <div className="bg-white px-4 py-2 rounded-xl border border-orange-100 shadow-sm">
                                            <p className="text-xs text-orange-600 font-bold mb-0.5">Date</p>
                                            <p className="text-slate-900 font-black text-sm">{new Date(selectedOrder.scheduledDate).toLocaleDateString()}</p>
                                        </div>
                                        <div className="bg-white px-4 py-2 rounded-xl border border-orange-100 shadow-sm">
                                            <p className="text-xs text-orange-600 font-bold mb-0.5">Time Slot</p>
                                            <p className="text-slate-900 font-black text-sm">{selectedOrder.startTime}</p>
                                        </div>
                                    </div>
                                    <div className="border-t border-orange-100/50 pt-4">
                                        {selectedOrder.problemItems.map(p => (
                                            <div key={p._id} className="flex justify-between items-start mb-3 last:mb-0">
                                                <div>
                                                    <p className="text-slate-900 font-bold text-sm">{p.title}</p>
                                                    <p className="text-slate-500 text-xs mt-0.5 max-w-sm leading-relaxed">{p.description}</p>
                                                </div>
                                                <p className="text-slate-900 font-black text-sm">₹{p.price}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Additional Info */}
                            {selectedOrder.customerNotes && (
                                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2"><FileText size={14}/> Customer Notes</h4>
                                    <p className="text-slate-700 text-sm italic leading-relaxed">"{selectedOrder.customerNotes}"</p>
                                </div>
                            )}

                            {/* Payment Info */}
                            <div className="flex items-center justify-between p-5 bg-slate-900 rounded-2xl text-white shadow-xl shadow-slate-900/20">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/10 rounded-xl"><CreditCard size={20}/></div>
                                    <div>
                                        <p className="text-white/60 text-xs font-bold mb-0.5">Total Amount</p>
                                        <p className="text-xs font-medium uppercase tracking-wider text-orange-400">{selectedOrder.paymentMethod === 'online' ? 'Paid Online' : 'Cash'}</p>
                                    </div>
                                </div>
                                <p className="text-3xl font-black">₹{selectedOrder.totalPrice}</p>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="p-6 border-t border-slate-100 bg-slate-50 flex flex-col-reverse sm:flex-row gap-3 sticky bottom-0 z-10 rounded-b-[2rem]">
                            <button 
                                onClick={() => setSelectedOrder(null)}
                                className="px-6 py-3.5 bg-white text-slate-600 font-bold rounded-xl border border-slate-200 hover:bg-slate-100 active:scale-95 transition flex-1 sm:flex-none"
                            >
                                Close
                            </button>
                            <button 
                                onClick={() => { handleAccept(selectedOrder._id); setSelectedOrder(null); }}
                                className="flex-1 py-3.5 bg-orange-600 text-white font-black rounded-xl shadow-lg shadow-orange-200 hover:bg-orange-700 active:scale-95 transition"
                            >
                                Accept This Order
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Orders;
