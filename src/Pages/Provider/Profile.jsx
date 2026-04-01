import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { 
    User, Mail, Phone, MapPin, Briefcase, 
    FileText, Calendar, Clock, Image as ImageIcon,
    ShieldCheck, CreditCard, LayoutDashboard, Edit2, X, Save, Upload
} from 'lucide-react';

const getImageUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${import.meta.env.VITE_API_URL}/${path.replace(/\\/g, '/')}`;
};

const Profile = () => {
    const { user } = useAuth();
    const [provider, setProvider] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Edit state
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({});
    const [selectedPhoto, setSelectedPhoto] = useState(null);
    const fileInputRef = useRef(null);

    const fetchProvider = async () => {
        if (!user?._id) return;
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/providers/${user._id}`);
            setProvider(res.data.data);
            setFormData({
                ownerName: res.data.data.ownerName || '',
                businessName: res.data.data.businessName || '',
                phone: res.data.data.phone || '',
                city: res.data.data.city || '',
                pincode: res.data.data.pincode || '',
                address: res.data.data.address || '',
                area: res.data.data.area || '',
                experience: res.data.data.experience || '',
                description: res.data.data.description || '',
                serviceCategory: res.data.data.serviceCategory || '',
            });
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch provider details:", err);
            setError(err.response?.data?.message || err.message);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProvider();
    }, [user]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePhotoChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedPhoto(e.target.files[0]);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const submitData = new FormData();
            Object.keys(formData).forEach(key => {
                submitData.append(key, formData[key]);
            });
            
            if (selectedPhoto) {
                submitData.append('profilePhoto', selectedPhoto);
            }

            const res = await axios.put(
                `${import.meta.env.VITE_API_URL}/api/providers/profile/${user._id}`, 
                submitData,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            );

            setProvider(res.data.data);
            setIsEditing(false);
            setSelectedPhoto(null);
            toast.success("Profile updated successfully");
        } catch (err) {
            console.error("Failed to update profile", err);
            toast.error(err.response?.data?.message || "Failed to update profile");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="p-8 flex items-center justify-center min-h-[50vh]">
            <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin"></div>
        </div>;
    }

    if (error) {
        return <div className="p-8 text-red-500 bg-red-50 rounded-xl m-4 border border-red-100">{error}</div>;
    }

    if (!provider) {
        return <div className="p-8 text-slate-500">Provider details not found.</div>;
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-10">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-black text-slate-900">Profile Settings</h1>
                {!isEditing ? (
                    <button 
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl shadow-md hover:bg-slate-800 transition-colors"
                    >
                        <Edit2 size={16} /> Edit Profile
                    </button>
                ) : (
                    <div className="flex gap-3">
                        <button 
                            onClick={() => { setIsEditing(false); setSelectedPhoto(null); }}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-200"
                        >
                            <X size={16} /> Cancel
                        </button>
                        <button 
                            onClick={handleSave}
                            disabled={saving}
                            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-xl shadow-md hover:bg-orange-700 disabled:opacity-70"
                        >
                            <Save size={16} /> {saving ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                )}
            </div>

            {/* Basic Info */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 p-8 flex flex-col md:flex-row gap-6 items-start">
                <div className="relative group shrink-0">
                    <div className="w-32 h-32 rounded-2xl bg-slate-100 overflow-hidden border-4 border-white shadow-lg">
                        {selectedPhoto ? (
                            <img src={URL.createObjectURL(selectedPhoto)} alt="Preview" className="w-full h-full object-cover" />
                        ) : provider.profilePhoto ? (
                            <img 
                                src={getImageUrl(provider.profilePhoto)} 
                                alt="Profile" 
                                className="w-full h-full object-cover"
                                onError={(e) => { e.target.src = 'https://via.placeholder.com/150'; }}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                                <User size={48} />
                            </div>
                        )}
                    </div>
                    {isEditing && (
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute -bottom-2 -right-2 p-2 bg-orange-600 text-white rounded-full shadow-lg hover:bg-orange-700 transition"
                        >
                            <Upload size={16} />
                        </button>
                    )}
                    <input type="file" ref={fileInputRef} accept="image/jpeg, image/png, image/webp" onChange={handlePhotoChange} className="hidden" />
                </div>
                
                <div className="flex-1 w-full space-y-4">
                    {isEditing ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Owner Name</label>
                                <input type="text" name="ownerName" value={formData.ownerName} onChange={handleInputChange} className="mt-1 w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Business Name</label>
                                <input type="text" name="businessName" value={formData.businessName} onChange={handleInputChange} className="mt-1 w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Phone Number</label>
                                <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} className="mt-1 w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">City</label>
                                <input type="text" name="city" value={formData.city} onChange={handleInputChange} className="mt-1 w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
                            </div>
                        </div>
                    ) : (
                        <>
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900">{provider.ownerName}</h2>
                                <p className="text-orange-600 font-medium">{provider.businessName}</p>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                <div className="flex items-center gap-3 text-slate-600">
                                    <div className="p-2 bg-slate-50 rounded-lg"><Mail size={16} className="text-slate-400" /></div>
                                    <span className="text-sm font-medium">{provider.email}</span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-600">
                                    <div className="p-2 bg-slate-50 rounded-lg"><Phone size={16} className="text-slate-400" /></div>
                                    <span className="text-sm font-medium">{provider.phone}</span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-600">
                                    <div className="p-2 bg-slate-50 rounded-lg"><MapPin size={16} className="text-slate-400" /></div>
                                    <span className="text-sm font-medium">{provider.city}, {provider.pincode}</span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-600">
                                    <div className="p-2 bg-slate-50 rounded-lg"><ShieldCheck size={16} className="text-slate-400" /></div>
                                    <span className="text-sm font-medium capitalize bg-orange-100 text-orange-700 px-3 py-1 rounded-full">{provider.status}</span>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">
                {/* Professional Details */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 p-8 space-y-6">
                    <h3 className="text-xl font-bold text-slate-900 border-b pb-4 flex items-center gap-2">
                        <Briefcase className="text-orange-600" /> Professional Details
                    </h3>
                    
                    {isEditing ? (
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Years of Experience</label>
                                <input type="number" name="experience" value={formData.experience} onChange={handleInputChange} className="mt-1 w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Description</label>
                                <textarea name="description" rows="4" value={formData.description} onChange={handleInputChange} className="mt-1 w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Service Category</label>
                                <input type="text" name="serviceCategory" value={formData.serviceCategory} onChange={handleInputChange} className="mt-1 w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Primary Service</label>
                                <input type="text" disabled value={provider.primaryService?.name || "N/A"} className="mt-1 w-full p-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed" />
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="grid grid-cols-3">
                                <span className="text-slate-500 font-medium text-sm">Experience</span>
                                <span className="col-span-2 text-slate-900 font-semibold">{provider.experience} Years</span>
                            </div>
                            <div className="grid grid-cols-3 items-center">
                                <span className="text-slate-500 font-medium text-sm">Service Category</span>
                                <span className="col-span-2">
                                    <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full font-semibold text-xs border border-blue-200 shadow-sm inline-block">
                                        {provider.serviceCategory || "N/A"}
                                    </span>
                                </span>
                            </div>
                            <div className="grid grid-cols-3 items-center">
                                <span className="text-slate-500 font-medium text-sm">Primary Service</span>
                                <span className="col-span-2">
                                    <span className="px-3 py-1 bg-orange-50 text-orange-700 rounded-full font-bold text-sm border border-orange-200 shadow-sm inline-block">
                                        {provider.primaryService?.name || "N/A"}
                                    </span>
                                </span>
                            </div>
                            <div className="grid grid-cols-3">
                                <span className="text-slate-500 font-medium text-sm">Skills</span>
                                <span className="col-span-2 flex flex-wrap gap-2">
                                    {provider.additionalSkills && provider.additionalSkills.length > 0 ? (
                                        provider.additionalSkills.map((skill, idx) => (
                                            <span key={idx} className="bg-slate-100 text-slate-700 text-xs px-2 py-1 rounded-md font-medium">{skill}</span>
                                        ))
                                    ) : (
                                        <span className="text-slate-400 text-sm">No specific skills listed</span>
                                    )}
                                </span>
                            </div>
                            <div className="grid grid-cols-3">
                                <span className="text-slate-500 font-medium text-sm">Description</span>
                                <span className="col-span-2 text-slate-700 text-sm leading-relaxed">{provider.description || "No description provided."}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Service Area & Availability */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 p-8 space-y-6">
                    <h3 className="text-xl font-bold text-slate-900 border-b pb-4 flex items-center gap-2">
                        <LayoutDashboard className="text-orange-600" /> Location & Availability
                    </h3>
                    
                    {isEditing ? (
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Address</label>
                                <input type="text" name="address" value={formData.address} onChange={handleInputChange} className="mt-1 w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Area</label>
                                    <input type="text" name="area" value={formData.area} onChange={handleInputChange} className="mt-1 w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pincode</label>
                                    <input type="number" name="pincode" value={formData.pincode} onChange={handleInputChange} className="mt-1 w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Working Days</label>
                                <input type="text" disabled value={provider.workingDays?.join(", ") || "N/A"} className="mt-1 w-full p-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Working Hours</label>
                                <input type="text" disabled value={provider.workingHours ? `${provider.workingHours.start} to ${provider.workingHours.end}` : "N/A"} className="mt-1 w-full p-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed" />
                            </div>
                            <p className="text-xs text-orange-600 bg-orange-50 p-2 rounded block">Working hours edits must be performed via admin currently.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="bg-slate-50 p-4 rounded-2xl flex items-start gap-3">
                                <MapPin className="text-slate-400 mt-0.5" size={20} />
                                <div>
                                    <h4 className="font-semibold text-slate-900 text-sm">Full Address</h4>
                                    <p className="text-slate-600 text-sm mt-1">{provider.address}</p>
                                    <p className="text-slate-500 text-xs mt-1">{provider.area}, {provider.city} - {provider.pincode}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <Calendar className="text-slate-400" size={20} />
                                <div className="flex-1">
                                    <h4 className="font-medium text-slate-700 text-sm">Working Days</h4>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                                            <span key={day} className={`text-xs px-2 py-1 rounded-md font-medium ${provider.workingDays?.includes(day) ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-400'}`}>
                                                {day}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <Clock className="text-slate-400" size={20} />
                                <div>
                                    <h4 className="font-medium text-slate-700 text-sm">Working Hours</h4>
                                    <p className="text-slate-900 font-semibold text-sm mt-1">
                                        {provider.workingHours?.start || "N/A"} to {provider.workingHours?.end || "N/A"}
                                    </p>
                                </div>
                            </div>

                            {provider.emergencyAvailability && (
                                <div className="bg-orange-50 text-orange-700 px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-2">
                                    <ShieldCheck size={18} /> Available for Emergency Services
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Identity Verification Details */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 p-8 space-y-6 xl:col-span-2">
                    <h3 className="text-xl font-bold text-slate-900 border-b pb-4 flex items-center gap-2">
                        <CreditCard className="text-orange-600" /> Identity & Verification
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="grid grid-cols-3">
                                <span className="text-slate-500 font-medium text-sm">ID Type</span>
                                <span className="col-span-2 text-slate-900 font-semibold">{provider.idProof?.idType}</span>
                            </div>
                            <div className="grid grid-cols-3">
                                <span className="text-slate-500 font-medium text-sm">ID Number</span>
                                <span className="col-span-2 text-slate-900 font-semibold">••••••••{provider.idProof?.idNumber?.slice(-4) || 'N/A'}</span>
                            </div>
                            <div className="grid grid-cols-3">
                                <span className="text-slate-500 font-medium text-sm">DOB</span>
                                <span className="col-span-2 text-slate-900 font-semibold">{provider.dob ? new Date(provider.dob).toLocaleDateString() : "N/A"}</span>
                            </div>
                            <div className="grid grid-cols-3">
                                <span className="text-slate-500 font-medium text-sm">Gender</span>
                                <span className="col-span-2 text-slate-900 font-semibold">{provider.gender}</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                                <h4 className="font-semibold text-slate-700 text-sm mb-3">Uploaded Documents</h4>
                                <ul className="space-y-3">
                                    {provider.certification && (
                                        <li className="flex flex-col gap-2">
                                            <div className="flex items-center gap-2 text-sm text-slate-600 group cursor-pointer hover:text-orange-600">
                                                <FileText size={16} className="text-slate-400 group-hover:text-orange-500" />
                                                <span className="font-medium text-slate-700">Primary Certification</span>
                                            </div>
                                            <a href={getImageUrl(provider.certification)} target="_blank" rel="noreferrer" className="block w-fit">
                                                <img src={getImageUrl(provider.certification)} alt="Certification" className="max-w-[200px] h-24 object-cover rounded-lg border border-slate-200 shadow-sm hover:opacity-80 transition-opacity" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                                                <div className="hidden items-center gap-2 px-3 py-2 bg-white rounded-lg border border-slate-200 hover:bg-slate-50 shadow-sm">
                                                    <FileText className="text-orange-500" size={18} />
                                                    <span className="text-sm font-medium text-slate-700">View Document</span>
                                                </div>
                                            </a>
                                        </li>
                                    )}
                                    {provider.idProof?.idImage && (
                                        <li className="flex flex-col gap-2">
                                            <div className="flex items-center gap-2 text-sm text-slate-600 group cursor-pointer hover:text-orange-600">
                                                <ImageIcon size={16} className="text-slate-400 group-hover:text-orange-500" />
                                                <span className="font-medium text-slate-700">ID Proof</span>
                                            </div>
                                            <a href={getImageUrl(provider.idProof.idImage)} target="_blank" rel="noreferrer" className="block w-fit">
                                                <img src={getImageUrl(provider.idProof.idImage)} alt="ID Proof" className="max-w-[200px] h-24 object-cover rounded-lg border border-slate-200 shadow-sm hover:opacity-80 transition-opacity" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                                                <div className="hidden items-center gap-2 px-3 py-2 bg-white rounded-lg border border-slate-200 hover:bg-slate-50 shadow-sm">
                                                    <FileText className="text-orange-500" size={18} />
                                                    <span className="text-sm font-medium text-slate-700">View Default Document</span>
                                                </div>
                                            </a>
                                        </li>
                                    )}
                                    {provider.documents && provider.documents.map((doc, idx) => (
                                        <li key={idx} className="flex flex-col gap-2">
                                            <div className="flex items-center gap-2 text-sm text-slate-600 group cursor-pointer hover:text-orange-600">
                                                <FileText size={16} className="text-slate-400 group-hover:text-orange-500" /> 
                                                <span className="font-medium text-slate-700 truncate max-w-[200px]">{doc.name}</span>
                                            </div>
                                            <a href={getImageUrl(doc.path)} target="_blank" rel="noreferrer" className="block w-fit">
                                                <img src={getImageUrl(doc.path)} alt={doc.name} className="max-w-[200px] h-24 object-cover rounded-lg border border-slate-200 shadow-sm hover:opacity-80 transition-opacity" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                                                <div className="hidden items-center gap-2 px-3 py-2 bg-white rounded-lg border border-slate-200 hover:bg-slate-50 shadow-sm">
                                                    <FileText className="text-orange-500" size={18} />
                                                    <span className="text-sm font-medium text-slate-700">View Document</span>
                                                </div>
                                            </a>
                                        </li>
                                    ))}
                                    {!provider.certification && !provider.idProof?.idImage && (!provider.documents || provider.documents.length === 0) && (
                                        <li className="text-sm text-slate-400">No documents uploaded.</li>
                                    )}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
