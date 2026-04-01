import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
    Calendar,
    MapPin,
    CheckCircle2,
    Clock,
    User,
    Eye,
    X,
    CreditCard,
    FileText,
    Navigation,
    PhoneCall,
    Truck,
    Wrench,
    CheckSquare,
    UploadCloud,
    Star
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const ProviderBookings = () => {
    const { user } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [activeTab, setActiveTab] = useState('active'); // 'active' or 'past'
    
    // Completion Form State
    const [isCompleting, setIsCompleting] = useState(false);
    const [beforeImage, setBeforeImage] = useState(null);
    const [afterImage, setAfterImage] = useState(null);
    const [rating, setRating] = useState(5);
    const [review, setReview] = useState('');
    const [submittingComplete, setSubmittingComplete] = useState(false);
    
    const apiUrl = import.meta.env.VITE_API_URL;

    const fetchBookings = async () => {
        try {
            const res = await axios.get(`${apiUrl}/api/booking/provider/bookings`, { withCredentials: true });
            if (res.data.success) {
                setBookings(res.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch provider bookings", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, [apiUrl]);

    const updateStatus = async (bookingId, newStatus) => {
        try {
            const res = await axios.patch(`${apiUrl}/api/booking/provider/${bookingId}/status`, { status: newStatus }, { withCredentials: true });
            if (res.data.success) {
                toast.success(`Order marked as ${newStatus.replace('_', ' ')}!`);
                setBookings(prev => prev.map(b => b._id === bookingId ? { ...b, status: newStatus } : b));
                if (selectedOrder && selectedOrder._id === bookingId) {
                    setSelectedOrder(prev => ({ ...prev, status: newStatus }));
                }
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update status");
        }
    };

    const handleCompleteSubmit = async (e) => {
        e.preventDefault();
        if (!selectedOrder) return;
        
        if (!beforeImage || !afterImage) {
            toast.error("Please provide both Before and After images for trust verification.");
            return;
        }

        setSubmittingComplete(true);
        try {
            const formData = new FormData();
            formData.append('beforeImage', beforeImage);
            formData.append('afterImage', afterImage);

            const res = await axios.patch(`${apiUrl}/api/booking/provider/${selectedOrder._id}/complete`, formData, { 
                withCredentials: true,
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (res.data.success) {
                toast.success("Job marked as Completed! Please rate the customer now.");
                setBookings(prev => prev.map(b => b._id === selectedOrder._id ? res.data.data : b));
                setSelectedOrder(res.data.data); // Keep modal open implicitly passing to rating step
                setIsCompleting(false);
                setBeforeImage(null);
                setAfterImage(null);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to complete job.");
        } finally {
            setSubmittingComplete(false);
        }
    };

    const handleRatingSubmit = async (e) => {
        e.preventDefault();
        setSubmittingComplete(true);
        try {
            const res = await axios.patch(`${apiUrl}/api/booking/provider/${selectedOrder._id}/rate`, { 
                providerRating: rating, 
                providerReview: review 
            }, { withCredentials: true });

            if (res.data.success) {
                toast.success("Customer rated successfully!");
                setBookings(prev => prev.map(b => b._id === selectedOrder._id ? res.data.data : b));
                setSelectedOrder(null);
                setActiveTab('past');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to submit rating.");
        } finally {
            setSubmittingComplete(false);
        }
    };

    const getStatusBadge = (status) => {
        switch(status) {
            case 'pending':
                return <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1 w-max"><Clock size={12}/> Pending</span>;
            case 'accepted':
                return <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1 w-max"><CheckCircle2 size={12}/> Accepted</span>;
            case 'en_route':
                return <span className="bg-indigo-100 text-indigo-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1 w-max"><Truck size={12}/> On The Way</span>;
            case 'in_progress':
                return <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1 w-max"><Wrench size={12}/> In Progress</span>;
            case 'completed':
                return <span className="bg-green-100 text-green-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1 w-max"><CheckSquare size={12}/> Completed</span>;
            case 'cancelled':
                return <span className="bg-red-100 text-red-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1 w-max"><X size={12}/> Cancelled</span>;
            default:
                return <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider w-max">{status}</span>;
        }
    };

    const StatusStepper = ({ currentStatus }) => {
        const steps = [
            { id: 'accepted', label: 'Accepted' },
            { id: 'en_route', label: 'On Way' },
            { id: 'in_progress', label: 'Working' },
            { id: 'completed', label: 'Done' }
        ];

        const currentIndex = steps.findIndex(s => s.id === currentStatus);
        
        if (currentStatus === 'cancelled') {
            return <div className="text-red-500 font-bold text-sm text-center py-4 bg-red-50 rounded-xl w-full">This order was cancelled.</div>;
        }

        return (
            <div className="flex items-center justify-between w-full px-2 max-w-md mx-auto">
                {steps.map((step, index) => {
                    const isCompleted = index <= currentIndex;
                    const isCurrent = index === currentIndex;
                    return (
                        <div key={step.id} className="flex flex-col items-center relative z-10 flex-1">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ring-4 ring-white transition-all duration-300 ${isCurrent ? 'bg-orange-600 text-white scale-110 shadow-lg shadow-orange-200' : isCompleted ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                {isCompleted && !isCurrent ? <CheckCircle2 size={16} /> : index + 1}
                            </div>
                            <span className={`text-[10px] font-black uppercase tracking-wider mt-2 transition-colors duration-300 ${isCurrent ? 'text-orange-600' : isCompleted ? 'text-green-600' : 'text-slate-400'}`}>
                                {step.label}
                            </span>
                            {index < steps.length - 1 && (
                                <div className={`absolute top-4 left-[50%] w-full h-1 -z-10 transition-colors duration-500 ${index < currentIndex ? 'bg-green-500' : 'bg-slate-100'}`} />
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    const getPrimaryAction = (booking) => {
        switch(booking.status) {
            case 'accepted':
                return (
                    <button onClick={() => updateStatus(booking._id, 'en_route')} className="w-full py-3.5 bg-orange-600 text-white font-black rounded-xl shadow-lg shadow-orange-200 hover:bg-orange-700 active:scale-95 transition flex items-center justify-center gap-2">
                        <Truck size={18} /> Start Journey
                    </button>
                );
            case 'en_route':
                return (
                    <button onClick={() => updateStatus(booking._id, 'in_progress')} className="w-full py-3.5 bg-indigo-600 text-white font-black rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition flex items-center justify-center gap-2">
                        <Wrench size={18} /> Arrived & Start Work
                    </button>
                );
            // In progress is handled directly in the render now
            default:
                return null;
        }
    };

    const activeBookings = bookings.filter(b => ['accepted', 'en_route', 'in_progress'].includes(b.status));
    const pastBookings = bookings.filter(b => ['completed', 'cancelled'].includes(b.status));
    const displayedBookings = activeTab === 'active' ? activeBookings : pastBookings;

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900">
                        My <span className="text-orange-600">Jobs</span>
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">Professional dashboard for managing assignments.</p>
                </div>

                <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm w-full md:w-auto">
                    <button 
                        onClick={() => setActiveTab('active')}
                        className={`flex-1 md:w-32 py-2.5 text-sm font-bold rounded-xl transition-all ${activeTab === 'active' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
                    >
                        Active ({activeBookings.length})
                    </button>
                    <button 
                        onClick={() => setActiveTab('past')}
                        className={`flex-1 md:w-32 py-2.5 text-sm font-bold rounded-xl transition-all ${activeTab === 'past' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
                    >
                        Past ({pastBookings.length})
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
                </div>
            ) : displayedBookings.length === 0 ? (
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 p-12 text-center flex flex-col items-center">
                    <div className="bg-slate-50 p-6 rounded-full mb-4">
                        <Calendar className="text-slate-300 h-12 w-12" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900">No {activeTab} jobs</h3>
                    <p className="text-slate-500 max-w-sm mt-3 leading-relaxed">
                        {activeTab === 'active' 
                            ? "You don't have any upcoming or ongoing jobs. Check the Open Orders tab to find new work!" 
                            : "You don't have any completed or cancelled history yet."}
                    </p>
                </div>
            ) : (
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-500 text-xs uppercase tracking-wider font-bold">
                                    <th className="p-6">Job ID / Date</th>
                                    <th className="p-6">Customer</th>
                                    <th className="p-6">Location</th>
                                    <th className="p-6">Amount</th>
                                    <th className="p-6">Status</th>
                                    <th className="p-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm font-medium">
                                {displayedBookings.map(booking => (
                                    <tr key={booking._id} className="hover:bg-slate-50/50 transition">
                                        <td className="p-6">
                                            <div className="text-slate-900 font-bold mb-1 uppercase text-xs">#{booking._id.slice(-8)}</div>
                                            <div className="text-slate-500 text-xs flex items-center gap-1"><Calendar size={12}/>{new Date(booking.scheduledDate).toLocaleDateString()}</div>
                                        </td>
                                        <td className="p-6">
                                            <div className="text-slate-900 font-bold">{booking.contactName || booking.customer?.name}</div>
                                            <div className="text-slate-500 text-xs flex mt-1"><PhoneCall size={12} className="mr-1"/> {booking.contactNumber || "Hidden"}</div>
                                        </td>
                                        <td className="p-6 max-w-[200px]">
                                            <div className="text-slate-900 truncate" title={booking.address}>{booking.address}</div>
                                            <div className="text-slate-500 text-xs mt-1">{booking.area}, {booking.city}</div>
                                        </td>
                                        <td className="p-6">
                                            <span className="text-slate-900 font-black">₹{booking.totalPrice}</span>
                                            <div className="text-slate-400 text-[10px] uppercase tracking-wider mt-1">{booking.paymentMethod}</div>
                                        </td>
                                        <td className="p-6">
                                            {getStatusBadge(booking.status)}
                                        </td>
                                        <td className="p-6">
                                            <div className="flex items-center justify-end gap-2">
                                                {activeTab === 'active' && (
                                                    <>
                                                        <a 
                                                            href={`tel:${booking.contactNumber}`}
                                                            className="p-2.5 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition" title="Call Customer"
                                                        >
                                                            <PhoneCall size={16} />
                                                        </a>
                                                        <a 
                                                            href={`https://maps.google.com/?q=${booking.address},${booking.area},${booking.city},${booking.pincode}`} 
                                                            target="_blank" rel="noreferrer"
                                                            className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition" title="Navigate"
                                                        >
                                                            <Navigation size={16} />
                                                        </a>
                                                    </>
                                                )}
                                                <button 
                                                    onClick={() => setSelectedOrder(booking)}
                                                    className="px-4 py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition flex items-center gap-2 shadow-md"
                                                >
                                                    <Eye size={16} /> <span className="hidden sm:inline">Details</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Comprehensive Detail & Completion Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => {if(!isCompleting) setSelectedOrder(null)}}>
                    <div className="bg-white rounded-[2rem] w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl relative" onClick={e => e.stopPropagation()}>
                        
                        {/* Header */}
                        <div className="sticky top-0 bg-white/90 backdrop-blur-md p-6 border-b border-slate-100 flex items-center justify-between z-10">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900">Job Dashboard</h3>
                                <p className="text-sm font-medium text-slate-500">Ref: #{selectedOrder._id.slice(-8).toUpperCase()}</p>
                            </div>
                            <button onClick={() => { setSelectedOrder(null); setIsCompleting(false); }} className="p-2.5 bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600 rounded-xl transition">
                                <X size={24} />
                            </button>
                        </div>
                        
                        <div className="p-6 md:p-8 space-y-8">
                            
                            {/* Visual Progress - Active states other than in_progress */}
                            {activeTab === 'active' && selectedOrder.status !== 'in_progress' && (
                                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center justify-center gap-2"><CheckSquare size={14}/> Job Progress</h4>
                                    <StatusStepper currentStatus={selectedOrder.status} />
                                    <div className="mt-8 max-w-sm mx-auto">
                                        {getPrimaryAction(selectedOrder)}
                                    </div>
                                </div>
                            )}

                            {/* In Progress state directly shows the Finalization Form */}
                            {activeTab === 'active' && selectedOrder.status === 'in_progress' && (
                                <form onSubmit={handleCompleteSubmit} className="bg-green-50/50 p-6 md:p-8 rounded-3xl border border-green-200 ring-4 ring-green-50 shadow-inner">
                                    
                                    <div className="mb-8">
                                        <h4 className="text-xs font-black uppercase tracking-widest text-green-600 mb-6 flex items-center justify-center gap-2"><CheckSquare size={14}/> Job Progress</h4>
                                        <StatusStepper currentStatus={selectedOrder.status} />
                                    </div>

                                    <div className="flex items-center gap-3 mb-6 border-t border-green-200/50 pt-8">
                                        <div className="bg-green-100 p-3 rounded-full text-green-600"><CheckCircle2 size={24}/></div>
                                        <div>
                                            <h3 className="text-xl font-black text-green-900 border-none">Finish The Job</h3>
                                            <p className="text-green-700 text-sm">Upload Before & After images to unlock completion.</p>
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6 mb-8">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Before Work Image *</label>
                                            <label className="flex flex-col items-center justify-center h-32 w-full border-2 border-dashed border-green-300 rounded-2xl cursor-pointer hover:bg-green-50 transition bg-white">
                                                {beforeImage ? (
                                                    <span className="text-green-600 font-bold overflow-hidden px-4 text-center text-xs w-full truncate">{beforeImage.name}</span>
                                                ) : (
                                                    <>
                                                        <UploadCloud className="text-green-400 mb-2" size={24} />
                                                        <span className="text-sm text-green-600 font-medium">Upload Image</span>
                                                    </>
                                                )}
                                                <input type="file" accept="image/*" className="hidden" onChange={(e) => setBeforeImage(e.target.files[0])} />
                                            </label>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">After Work Image *</label>
                                            <label className="flex flex-col items-center justify-center h-32 w-full border-2 border-dashed border-green-300 rounded-2xl cursor-pointer hover:bg-green-50 transition bg-white">
                                                {afterImage ? (
                                                    <span className="text-green-600 font-bold overflow-hidden px-4 text-center text-xs w-full truncate">{afterImage.name}</span>
                                                ) : (
                                                    <>
                                                        <UploadCloud className="text-green-400 mb-2" size={24} />
                                                        <span className="text-sm text-green-600 font-medium">Upload Image</span>
                                                    </>
                                                )}
                                                <input type="file" accept="image/*" className="hidden" onChange={(e) => setAfterImage(e.target.files[0])} />
                                            </label>
                                        </div>
                                    </div>

                                    <div className="mt-4">
                                        {(beforeImage && afterImage) ? (
                                            <button type="submit" disabled={submittingComplete} className="w-full py-4 bg-green-600 text-white font-black rounded-xl hover:bg-green-700 transition shadow-lg shadow-green-200 animate-in zoom-in duration-300">
                                                {submittingComplete ? 'Uploading...' : 'Submit Pictures & Finish Job'}
                                            </button>
                                        ) : (
                                            <div className="w-full py-4 bg-slate-100 text-slate-400 font-bold rounded-xl text-center border border-slate-200 border-dashed">
                                                Complete uploads to unlock Finish button
                                            </div>
                                        )}
                                    </div>
                                </form>
                            )}

                            {/* Job Details Core */}
                            <>
                                    {/* Rating Prompt After Completion */}
                                    {selectedOrder.status === 'completed' && !selectedOrder.providerRating && (
                                        <form onSubmit={handleRatingSubmit} className="bg-orange-50 p-6 rounded-3xl border border-orange-200 mb-6">
                                            <h4 className="font-black text-orange-900 mb-2 flex items-center gap-2 border-b border-orange-200 pb-3"><Star size={18}/> Rate Your Customer</h4>
                                            
                                            <div className="mb-6 mt-4">
                                                <label className="block text-sm font-bold text-orange-800 mb-2">How was your interaction?</label>
                                                <div className="flex gap-2">
                                                    {[1,2,3,4,5].map(star => (
                                                        <Star 
                                                            key={star} 
                                                            size={36} 
                                                            className={`cursor-pointer transition-all ${rating >= star ? 'fill-orange-500 text-orange-500 drop-shadow-md scale-110' : 'text-orange-200'}`}
                                                            onClick={() => setRating(star)}
                                                        />
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="mb-6">
                                                <label className="block text-sm font-bold text-orange-800 mb-2">Write a Review (Optional)</label>
                                                <textarea 
                                                    rows="2" 
                                                    className="w-full bg-white border border-orange-200 rounded-xl p-3 focus:ring-4 focus:ring-orange-100 focus:border-orange-400 outline-none transition text-sm"
                                                    placeholder="Was the customer polite? Easy to work with?"
                                                    value={review}
                                                    onChange={(e) => setReview(e.target.value)}
                                                ></textarea>
                                            </div>

                                            <button type="submit" disabled={submittingComplete} className="w-full py-3 bg-orange-600 text-white font-black rounded-xl hover:bg-orange-700 transition shadow-lg shadow-orange-200 disabled:opacity-70 disabled:cursor-not-allowed">
                                                {submittingComplete ? 'Saving Rating...' : 'Submit Rating'}
                                            </button>
                                        </form>
                                    )}

                                    {/* Display Rating if already exists */}
                                    {selectedOrder.status === 'completed' && selectedOrder.providerRating && (
                                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex justify-between items-center mb-6">
                                            <div>
                                                <p className="text-xs font-bold text-slate-500 mb-1">Your Rating for Customer</p>
                                                <div className="flex gap-1">
                                                    {[1,2,3,4,5].map(star => (
                                                        <Star key={star} size={16} className={selectedOrder.providerRating >= star ? 'fill-orange-400 text-orange-400' : 'text-slate-300'} />
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="bg-green-100 text-green-700 p-2 rounded-full font-bold text-xs"><CheckCircle2 size={16}/> Rating Saved</div>
                                        </div>
                                    )}

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                                            <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2"><User size={14}/> Customer Profile</h4>
                                            <p className="text-slate-500 font-bold text-xs mb-1">Name</p>
                                            <p className="text-slate-900 font-black mb-4">{selectedOrder.contactName || selectedOrder.customer?.name}</p>
                                            
                                            <p className="text-slate-500 font-bold text-xs mb-1">Service Address</p>
                                            <p className="text-slate-900 font-medium leading-relaxed">{selectedOrder.address}, {selectedOrder.area}, {selectedOrder.city} - {selectedOrder.pincode}</p>
                                        </div>

                                        <div className="bg-orange-50/50 rounded-2xl p-6 border border-orange-100">
                                            <h4 className="text-xs font-black uppercase tracking-widest text-orange-400 mb-4 flex items-center gap-2"><Calendar size={14}/> Schedule & Items</h4>
                                            
                                            <div className="flex gap-4 mb-4">
                                                <div>
                                                    <p className="text-orange-600 font-bold text-[10px] uppercase tracking-wider mb-1">Date</p>
                                                    <p className="text-slate-900 font-black">{new Date(selectedOrder.scheduledDate).toLocaleDateString()}</p>
                                                </div>
                                                <div>
                                                    <p className="text-orange-600 font-bold text-[10px] uppercase tracking-wider mb-1">Time</p>
                                                    <p className="text-slate-900 font-black">{selectedOrder.startTime}</p>
                                                </div>
                                            </div>

                                            <div className="border-t border-orange-100/50 pt-4 space-y-3">
                                                {selectedOrder.problemItems.map((p, i) => (
                                                    <div key={i} className="flex justify-between items-start">
                                                        <p className="text-slate-900 font-bold text-sm leading-tight">{p.title}</p>
                                                        <p className="text-slate-900 font-black text-sm whitespace-nowrap ml-4">₹{p.price}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Proof of Work (For Completed Orders) */}
                                    {selectedOrder.status === 'completed' && (selectedOrder.beforeImage || selectedOrder.afterImage) && (
                                        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                                            <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2"><CheckSquare size={14}/> Proof of Work</h4>
                                            <div className="grid grid-cols-2 gap-4">
                                                {selectedOrder.beforeImage && (
                                                    <div>
                                                        <p className="text-xs font-bold text-slate-500 mb-2">Before</p>
                                                        <img src={selectedOrder.beforeImage} alt="Before" className="w-full h-32 object-cover rounded-xl border border-slate-200 shadow-sm" />
                                                    </div>
                                                )}
                                                {selectedOrder.afterImage && (
                                                    <div>
                                                        <p className="text-xs font-bold text-slate-500 mb-2">After</p>
                                        <img src={selectedOrder.afterImage} alt="After" className="w-full h-32 object-cover rounded-xl border border-slate-200 shadow-sm" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between p-6 bg-slate-900 rounded-3xl text-white shadow-xl shadow-slate-900/20">
                                        <div className="flex items-center gap-3">
                                            <div className="p-3 bg-white/10 rounded-xl"><CreditCard size={24}/></div>
                                            <div>
                                                <p className="text-white/60 text-xs font-bold mb-1">Total Receivable</p>
                                                <p className="text-xs font-black uppercase tracking-wider text-orange-400 bg-white/10 px-2 py-0.5 rounded inline-block">{selectedOrder.paymentMethod === 'online' ? 'Paid Online' : 'Collect Cash'}</p>
                                            </div>
                                        </div>
                                        <p className="text-4xl font-black">₹{selectedOrder.totalPrice}</p>
                                    </div>

                                </>
                        </div>

                        <div className="p-6 border-t border-slate-100 bg-slate-50 flex sticky bottom-0 z-10 rounded-b-[2rem]"> </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProviderBookings;
