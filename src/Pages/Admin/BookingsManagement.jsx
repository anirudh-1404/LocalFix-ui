import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Search,
    MapPin,
    CreditCard,
    CheckCircle,
    Clock,
    XCircle,
    User,
    Briefcase,
    Eye,
    X,
    Phone
} from 'lucide-react';
import toast from 'react-hot-toast';

const BookingsManagement = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedBooking, setSelectedBooking] = useState(null);
    const apiUrl = import.meta.env.VITE_API_URL;

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const response = await axios.get(`${apiUrl}/api/booking/admin/all`, {
                    withCredentials: true
                });
                setBookings(response.data.data || []);
            } catch (error) {
                console.error("Error fetching bookings:", error);
                toast.error("Failed to load bookings");
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, [apiUrl]);

    const filteredBookings = bookings.filter(booking =>
        booking._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.provider?.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.service?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusStyle = (status) => {
        switch (status) {
            case 'completed': return 'bg-green-50 text-green-600 border-green-200';
            case 'cancelled': return 'bg-red-50 text-red-600 border-red-200';
            case 'confirmed': return 'bg-blue-50 text-blue-600 border-blue-200';
            default: return 'bg-orange-50 text-orange-600 border-orange-200'; // pending
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Bookings Management</h1>
                    <p className="text-gray-500">View and manage all service bookings.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by ID, customer..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-64 transition-all"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Booking Info</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer / Provider</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Schedule</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Payment / Amount</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredBookings.length > 0 ? (
                                filteredBookings.map((booking) => (
                                    <tr key={booking._id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-semibold text-gray-800">#{booking._id.toString().slice(-6).toUpperCase()}</span>
                                                <span className="text-xs text-blue-600 font-medium">{booking.service?.name || 'Unknown Service'}</span>
                                                <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                                    <MapPin size={12} /> {booking.area}, {booking.city}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center gap-2">
                                                    <User size={14} className="text-gray-400" />
                                                    <span className="text-sm font-medium text-gray-700">{booking.customer?.name || "N/A"}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Briefcase size={14} className="text-gray-400" />
                                                    <span className="text-xs text-gray-500">{booking.provider?.businessName || "Unassigned"}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-700 font-medium">
                                                {new Date(booking.scheduledDate).toLocaleDateString(undefined, {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                                                <Clock size={12} /> {booking.startTime}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-bold text-gray-800">₹{booking.totalPrice}</div>
                                            <div className="text-xs text-gray-500 flex items-center gap-1 capitalize mt-0.5">
                                                <CreditCard size={12} /> {booking.paymentMethod} ({booking.paymentStatus})
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${getStatusStyle(booking.status)} capitalize`}>
                                                {booking.status === 'completed' && <CheckCircle size={12} />}
                                                {booking.status === 'cancelled' && <XCircle size={12} />}
                                                {(booking.status === 'pending' || booking.status === 'confirmed') && <Clock size={12} />}
                                                {booking.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button 
                                                onClick={() => setSelectedBooking(booking)}
                                                className="p-2 hover:bg-blue-50 text-gray-400 hover:text-blue-600 rounded-lg transition-colors"
                                                title="View Details"
                                            >
                                                <Eye size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-400 italic">
                                        No bookings found matching your search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Booking Details Modal */}
            {selectedBooking && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 p-6 flex items-center justify-between z-10">
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">Booking Details</h2>
                                <p className="text-sm text-gray-500">#{selectedBooking._id.toString().toUpperCase()}</p>
                            </div>
                            <button 
                                onClick={() => setSelectedBooking(null)}
                                className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        
                        {/* Modal Body */}
                        <div className="p-6 space-y-6">
                            {/* Service & Schedule */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-gray-100">
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Service Details</h3>
                                    <div className="space-y-4">
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Briefcase size={18} /></div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-800">{selectedBooking.service?.name}</p>
                                                <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">{selectedBooking.service?.description || 'No description provided'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-orange-50 text-orange-600 rounded-lg"><Clock size={18} /></div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-800">
                                                    {new Date(selectedBooking.scheduledDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-0.5">{selectedBooking.startTime}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Location</h3>
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-green-50 text-green-600 rounded-lg mt-1"><MapPin size={18} /></div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-800">{selectedBooking.contactName}</p>
                                            <p className="text-sm text-gray-600 mt-1">{selectedBooking.address}</p>
                                            <p className="text-sm text-gray-600">{selectedBooking.area}, {selectedBooking.city} {selectedBooking.pincode}</p>
                                            <p className="text-sm text-gray-500 mt-1 flex items-center gap-1.5 font-medium"><Phone size={14}/> {selectedBooking.contactNumber}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* People */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-gray-100">
                                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Customer</h3>
                                    {selectedBooking.customer ? (
                                        <>
                                            <p className="font-semibold text-gray-800">{selectedBooking.customer.name}</p>
                                            <p className="text-sm text-gray-500 mt-1">{selectedBooking.customer.email}</p>
                                            <p className="text-sm text-gray-500">{selectedBooking.customer.phone}</p>
                                        </>
                                    ) : (
                                        <p className="text-sm text-gray-400 italic">No customer info</p>
                                    )}
                                </div>
                                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Assigned Provider</h3>
                                    {selectedBooking.provider ? (
                                        <>
                                            <p className="font-semibold text-gray-800">{selectedBooking.provider.businessName}</p>
                                            <p className="text-sm text-gray-500 mt-1">Owner: {selectedBooking.provider.ownerName}</p>
                                            <p className="text-sm text-gray-500">{selectedBooking.provider.phone}</p>
                                        </>
                                    ) : (
                                        <p className="text-sm text-gray-400 italic">Unassigned</p>
                                    )}
                                </div>
                            </div>

                            {/* Order Items & Payment */}
                            <div>
                                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Problem Items & Payment</h3>
                                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                                    <div className="divide-y divide-gray-100">
                                        {selectedBooking.problemItems?.length > 0 ? (
                                            selectedBooking.problemItems.map((item, idx) => (
                                                <div key={idx} className="flex items-center justify-between p-4 bg-gray-50/50">
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-800">{item.title}</p>
                                                        {item.description && <p className="text-xs text-gray-500 leading-relaxed mt-1">{item.description}</p>}
                                                    </div>
                                                    <div className="text-sm font-semibold text-gray-800 bg-white px-3 py-1 rounded-lg border border-gray-100 shadow-sm">
                                                        ₹{item.price}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-4 text-sm text-gray-500 italic">No specific items listed</div>
                                        )}
                                    </div>
                                    <div className="bg-gray-50 p-4 border-t border-gray-200">
                                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                            <div>
                                                <p className="text-sm text-gray-600 mb-1">
                                                    Payment Method: <span className="font-medium uppercase">{selectedBooking.paymentMethod}</span>
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    Payment Status: <span className={`font-medium uppercase ${selectedBooking.paymentStatus === 'paid' ? 'text-green-600' : 'text-orange-600'}`}>{selectedBooking.paymentStatus}</span>
                                                </p>
                                                {selectedBooking.razorpayOrderId && (
                                                    <p className="text-xs text-gray-400 mt-2 font-mono">Order ID: {selectedBooking.razorpayOrderId}</p>
                                                )}
                                                {selectedBooking.razorpayPaymentId && (
                                                    <p className="text-xs text-gray-400 mt-1 font-mono">Payment ID: {selectedBooking.razorpayPaymentId}</p>
                                                )}
                                            </div>
                                            <div className="text-left md:text-right">
                                                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total Amount</p>
                                                <p className="text-2xl font-bold text-gray-900 border-b-2 border-blue-500 inline-block pb-1">₹{selectedBooking.totalPrice}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {selectedBooking.customerNotes && (
                                    <div className="mt-6 p-4 bg-yellow-50 border border-yellow-100 rounded-xl">
                                        <h4 className="text-xs font-semibold text-yellow-800 uppercase tracking-wider mb-2">Customer Notes</h4>
                                        <p className="text-sm text-yellow-900 leading-relaxed">{selectedBooking.customerNotes}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BookingsManagement;
