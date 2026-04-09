import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Briefcase,
    CheckCircle2,
    XCircle,
    Eye,
    Search,
    User,
    Mail,
    Phone,
    Calendar,
    MapPin,
    Clock,
    FileText,
    ExternalLink,
    X
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const getImageUrl = (path, apiUrl) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${apiUrl}/${path.replace(/\\/g, '/')}`;
};

const ProviderApplications = () => {
    const { user } = useAuth();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedProvider, setSelectedProvider] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const apiUrl = import.meta.env.VITE_API_URL;

    const fetchApplications = async () => {
        try {
            const response = await axios.get(`${apiUrl}/api/providers`);
            setApplications(response.data.data || []);
        } catch (error) {
            console.error("Error fetching applications:", error);
            toast.error("Failed to load applications");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApplications();
    }, [apiUrl]);

    const handleStatusUpdate = async (id, status, reason = "") => {
        try {
            const response = await axios.patch(`${apiUrl}/api/providers/status/${id}`,
                { status, reason }
            );
            if (response.data.success) {
                toast.success(`Application ${status} successfully`);
                fetchApplications(); // Refresh list
                if (selectedProvider?._id === id) {
                    setSelectedProvider({ ...selectedProvider, status });
                }
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update status");
        }
    };

    const handleViewDetails = (provider) => {
        setSelectedProvider(provider);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedProvider(null);
    };

    const filteredApps = applications.filter(app =>
        app.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.ownerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Provider Applications</h1>
                    <p className="text-gray-500">Review and verify service partner enrollment requests.</p>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search applications..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none w-full md:w-64 transition-all"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {filteredApps.length > 0 ? (
                    filteredApps.map((app) => (
                        <div key={app._id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                <div className="flex items-start gap-4">
                                    <div className="h-12 w-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                                        <Briefcase size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-800">{app.businessName}</h3>
                                        <div className="flex flex-wrap gap-4 mt-1">
                                            <span className="text-sm text-gray-500 flex items-center gap-1">
                                                <User size={14} /> {app.ownerName}
                                            </span>
                                            <span className="text-sm text-gray-500 flex items-center gap-1">
                                                <Mail size={14} /> {app.email}
                                            </span>
                                            <span className="text-sm text-gray-500 flex items-center gap-1">
                                                <Phone size={14} /> {app.phone}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center flex-wrap gap-3">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${app.status === 'approved' ? 'bg-green-50 text-green-600' :
                                        app.status === 'rejected' ? 'bg-red-50 text-red-600' :
                                            'bg-amber-50 text-amber-600'
                                        }`}>
                                        {app.status}
                                    </span>

                                    <div className="h-8 w-[1px] bg-gray-100 hidden lg:block mx-2"></div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleViewDetails(app)}
                                            title="View Details"
                                            className="p-2 border border-gray-100 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors"
                                        >
                                            <Eye size={18} />
                                        </button>

                                        {app.status === 'pending' && (
                                            <>
                                                <button
                                                    onClick={() => handleStatusUpdate(app._id, 'approved')}
                                                    className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors"
                                                >
                                                    <CheckCircle2 size={16} /> Approve
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        const reason = prompt("Enter reason for rejection (optional):");
                                                        if (reason !== null) handleStatusUpdate(app._id, 'rejected', reason);
                                                    }}
                                                    className="flex items-center gap-1 px-3 py-2 border border-red-100 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-50 transition-colors"
                                                >
                                                    <XCircle size={16} /> Reject
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="bg-white py-12 text-center rounded-2xl border border-dashed border-gray-200">
                        <p className="text-gray-400">No applications found.</p>
                    </div>
                )}
            </div>

            {/* Provider Details Modal */}
            {isModalOpen && selectedProvider && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in duration-300">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">{selectedProvider.businessName}</h2>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${selectedProvider.status === 'approved' ? 'bg-green-50 text-green-600' :
                                        selectedProvider.status === 'rejected' ? 'bg-red-50 text-red-600' :
                                            'bg-amber-50 text-amber-600'
                                        }`}>
                                        {selectedProvider.status}
                                    </span>
                                    <span className="text-sm text-gray-400">•</span>
                                    <span className="text-sm text-gray-500">Applied on {new Date(selectedProvider.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                            <button
                                onClick={closeModal}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-8">
                            {/* Personal & Professional Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <section>
                                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Personal Details</h3>
                                        <div className="space-y-3">
                                            <DetailItem icon={<User size={16} />} label="Owner" value={selectedProvider.ownerName} />
                                            <DetailItem icon={<Mail size={16} />} label="Email" value={selectedProvider.email} />
                                            <DetailItem icon={<Phone size={16} />} label="Phone" value={selectedProvider.phone} />
                                            <DetailItem icon={<Calendar size={16} />} label="DOB" value={selectedProvider.dob ? new Date(selectedProvider.dob).toLocaleDateString() : 'N/A'} />
                                            <DetailItem icon={<User size={16} />} label="Gender" value={selectedProvider.gender} />
                                        </div>
                                    </section>

                                    <section>
                                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Professional Details</h3>
                                        <div className="space-y-3">
                                            <DetailItem label="Service Category" value={selectedProvider.serviceCategory} />
                                            <DetailItem label="Primary Service" value={selectedProvider.primaryService?.name || 'N/A'} />
                                            <DetailItem label="Experience" value={`${selectedProvider.experience} Years`} />
                                            {selectedProvider.additionalSkills?.length > 0 && (
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-xs text-gray-400 font-medium">Additional Skills</span>
                                                    <div className="flex flex-wrap gap-2 mt-1">
                                                        {selectedProvider.additionalSkills.map((skill, idx) => (
                                                            <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">{skill}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </section>
                                </div>

                                <div className="space-y-6">
                                    <section>
                                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Service Area & Availability</h3>
                                        <div className="space-y-3">
                                            <DetailItem icon={<MapPin size={16} />} label="Address" value={`${selectedProvider.address}, ${selectedProvider.area}, ${selectedProvider.city} - ${selectedProvider.pincode}`} />
                                            <DetailItem icon={<Clock size={16} />} label="Working Days" value={selectedProvider.workingDays?.join(", ")} />
                                            <DetailItem icon={<Clock size={16} />} label="Working Hours" value={selectedProvider.workingHours ? `${selectedProvider.workingHours.start} - ${selectedProvider.workingHours.end}` : 'N/A'} />
                                            <DetailItem label="Emergency" value={selectedProvider.emergencyAvailability ? "Yes" : "No"} />
                                        </div>
                                    </section>

                                    <section>
                                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Identity Verification</h3>
                                        <div className="space-y-3">
                                            <DetailItem label="ID Type" value={selectedProvider.idProof?.idType} />
                                            <DetailItem label="ID Number" value={selectedProvider.idProof?.idNumber} />
                                            {selectedProvider.idProof?.idImage && (
                                                <a
                                                    href={getImageUrl(selectedProvider.idProof.idImage, apiUrl)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-2 text-sm text-orange-600 font-semibold hover:underline mt-2"
                                                >
                                                    <FileText size={16} /> View ID Proof <ExternalLink size={14} />
                                                </a>
                                            )}
                                        </div>
                                    </section>
                                </div>
                            </div>

                            {/* Description */}
                            {selectedProvider.description && (
                                <section>
                                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">About the Business</h3>
                                    <p className="text-gray-600 bg-gray-50 p-4 rounded-xl text-sm leading-relaxed">
                                        {selectedProvider.description}
                                    </p>
                                </section>
                            )}

                            {/* Documents */}
                            <section>
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Uploaded Documents</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                    {selectedProvider.certification && (
                                        <DocumentCard
                                            name="Primary Certification"
                                            path={selectedProvider.certification}
                                            apiUrl={apiUrl}
                                        />
                                    )}
                                    {selectedProvider.documents?.length > 0 ? (
                                        selectedProvider.documents.map((doc, idx) => (
                                            <DocumentCard
                                                key={idx}
                                                name={doc.name || `Document ${idx + 1}`}
                                                path={doc.path}
                                                apiUrl={apiUrl}
                                                date={doc.uploadDate}
                                            />
                                        ))
                                    ) : (
                                        !selectedProvider.certification && (
                                            <p className="text-sm text-gray-400 italic">No additional documents uploaded.</p>
                                        )
                                    )}
                                </div>
                            </section>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex flex-wrap gap-3 justify-end">
                            <button
                                onClick={closeModal}
                                className="px-6 py-2.5 border border-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-white transition-colors"
                            >
                                Close
                            </button>
                            {selectedProvider.status === 'pending' && (
                                <>
                                    <button
                                        onClick={() => {
                                            const reason = prompt("Enter reason for rejection (optional):");
                                            if (reason !== null) handleStatusUpdate(selectedProvider._id, 'rejected', reason);
                                        }}
                                        className="flex items-center gap-2 px-6 py-2.5 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-colors"
                                    >
                                        <XCircle size={18} /> Reject Application
                                    </button>
                                    <button
                                        onClick={() => handleStatusUpdate(selectedProvider._id, 'approved')}
                                        className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 shadow-lg shadow-green-200 transition-colors"
                                    >
                                        <CheckCircle2 size={18} /> Approve Application
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Helper Components
const DetailItem = ({ icon, label, value }) => (
    <div className="flex flex-col gap-1">
        <span className="text-xs text-gray-400 font-medium">{label}</span>
        <div className="flex items-center gap-2 text-gray-700 text-sm font-medium">
            {icon && <span className="text-gray-400">{icon}</span>}
            <span>{value || 'N/A'}</span>
        </div>
    </div>
);

const DocumentCard = ({ name, path, apiUrl, date }) => (
    <div className="p-4 border border-gray-100 rounded-xl bg-white hover:border-orange-200 transition-all group">
        <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-50 text-orange-600 rounded-lg group-hover:bg-orange-600 group-hover:text-white transition-colors">
                    <FileText size={20} />
                </div>
                <div>
                    <h4 className="text-sm font-bold text-gray-800 line-clamp-1">{name}</h4>
                    {date && <p className="text-[10px] text-gray-400 uppercase tracking-wider">{new Date(date).toLocaleDateString()}</p>}
                </div>
            </div>
            <a
                href={getImageUrl(path, apiUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all"
                title="View Document"
            >
                <ExternalLink size={16} />
            </a>
        </div>
    </div>
);

export default ProviderApplications;
