import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    User,
    Briefcase,
    MapPin,
    ShieldCheck,
    ChevronRight,
    ChevronLeft,
    Upload,
    CheckCircle2,
    Clock,
    Phone,
    Building2,
    Calendar,
    IndianRupee,
    FileText
} from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";

const Enrollment = () => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [services, setServices] = useState([]);
    const [previews, setPreviews] = useState({
        profilePhoto: null,
        certification: null,
        idImage: null,
    });
    const apiUrl = import.meta.env.VITE_API_URL;
    const [formData, setFormData] = useState({
        // Step 1: Personal / Contact
        ownerName: "",
        email: "",
        businessName: "",
        phone: "",
        dob: "",
        gender: "Male",
        profilePhoto: null,

        // Step 2: Professional
        primaryService: "",
        experience: "",
        serviceCategory: "",
        certification: null,
        description: "",
        additionalSkills: "",

        // Step 3: Operational
        address: "",
        city: "",
        area: "",
        pincode: "",
        workingDays: [],
        workingHoursStart: "09:00",
        workingHoursEnd: "18:00",
        emergencyAvailability: false,

        // Step 4: Verification
        idType: "Aadhar",
        idNumber: "",
        idImage: null,
    });

    useEffect(() => {
        const fetchServices = async () => {
            try {

                const response = await axios.get(`${apiUrl}/api/services`);
                setServices(response.data.data || []);
            } catch (error) {
                console.error("Error fetching services:", error);
            }
        };
        fetchServices();
    }, []);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (type === "checkbox") {
            if (name === "workingDays") {
                const updatedDays = checked
                    ? [...formData.workingDays, value]
                    : formData.workingDays.filter(day => day !== value);
                setFormData({ ...formData, workingDays: updatedDays });
            } else {
                setFormData({ ...formData, [name]: checked });
            }
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        const file = files[0];
        if (file) {
            setFormData({ ...formData, [name]: file });
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviews({ ...previews, [name]: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const nextStep = () => {
        if (validateStep()) {
            setStep(step + 1);
            window.scrollTo(0, 0);
        }
    };

    const prevStep = () => {
        setStep(step - 1);
        window.scrollTo(0, 0);
    };

    const validateStep = () => {
        if (step === 1) {
            if (!formData.ownerName || !formData.email || !formData.businessName || !formData.phone || !formData.dob) {
                toast.error("Please fill all required personal and contact details");
                return false;
            }
            if (!formData.email.includes("@")) {
                toast.error("Please enter a valid email address");
                return false;
            }
        } else if (step === 2) {
            if (!formData.experience || !formData.primaryService || !formData.serviceCategory) {
                toast.error("Please provide all professional details including service category");
                return false;
            }
        } else if (step === 3) {
            if (!formData.address || !formData.city || !formData.area || !formData.pincode) {
                toast.error("Please fill address details");
                return false;
            }
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const data = new FormData();
        Object.keys(formData).forEach(key => {
            if (key === "workingDays") {
                data.append("workingDays", JSON.stringify(formData.workingDays));
            } else if (key === "workingHoursStart" || key === "workingHoursEnd") {
                // Skip these, handled below
            } else if (key === "idType" || key === "idNumber") {
                data.append(key, formData[key]);
            } else if (key === "additionalSkills") {
                data.append("additionalSkills", JSON.stringify(formData.additionalSkills ? formData.additionalSkills.split(',').map(s => s.trim()) : []));
            } else {
                data.append(key, formData[key]);
            }
        });

        // Handle workingHours as expected by backend parser
        data.append("workingHours", JSON.stringify({
            start: formData.workingHoursStart,
            end: formData.workingHoursEnd
        }));

        try {
            const response = await axios.post(`${apiUrl}/api/providers/enroll`, data, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            toast.success("Enrollment submitted successfully! We will verify your profile soon.");
            setStep(5); // Success step
        } catch (error) {
            toast.error(error.response?.data?.message || "Enrollment failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const steps = [
        { id: 1, name: "Personal", icon: User },
        { id: 2, name: "Professional", icon: Briefcase },
        { id: 3, name: "Operational", icon: MapPin },
        { id: 4, name: "Verification", icon: ShieldCheck },
    ];

    const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Progress Bar */}
                {step < 5 && (
                    <div className="mb-12">
                        <div className="flex items-center justify-between">
                            {steps.map((s, index) => (
                                <div key={s.id} className="flex flex-col items-center flex-1 relative">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${step >= s.id ? "bg-orange-500 border-orange-500 text-white" : "bg-white border-gray-300 text-gray-400"
                                        }`}>
                                        <s.icon size={20} />
                                    </div>
                                    <span className={`mt-2 text-xs font-semibold uppercase tracking-wider ${step >= s.id ? "text-orange-600" : "text-gray-400"
                                        }`}>
                                        {s.name}
                                    </span>
                                    {index < steps.length - 1 && (
                                        <div className={`absolute top-5 -right-1/2 w-full h-0.5 ${step > s.id ? "bg-orange-500" : "bg-gray-200"
                                            }`} />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="bg-white rounded-2xl shadow-xl overflow-hidden"
                    >
                        {step === 1 && (
                            <div className="p-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <User className="text-orange-500" /> Personal Identity
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-700">Owner Full Name *</label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            <input
                                                type="text"
                                                name="ownerName"
                                                value={formData.ownerName}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                                                placeholder="Enter your full name"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-700">Email Address *</label>
                                        <div className="relative">
                                            <Upload className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 rotate-180" size={18} />
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                                                placeholder="Enter your email"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-700">Business Name *</label>
                                        <div className="relative">
                                            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            <input
                                                type="text"
                                                name="businessName"
                                                value={formData.businessName}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                                                placeholder="Enter your business name"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-700">Phone Number *</label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                                                placeholder="Enter phone number"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-700">Date of Birth *</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            <input
                                                type="date"
                                                name="dob"
                                                value={formData.dob}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-700">Gender</label>
                                        <select
                                            name="gender"
                                            value={formData.gender}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all appearance-none bg-white"
                                        >
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                            <option value="Prefer not to say">Prefer not to say</option>
                                        </select>
                                    </div>
                                    <div className="md:col-span-2 space-y-4">
                                        <label className="block text-sm font-semibold text-gray-700">Profile Photo</label>
                                        <div className="flex items-center gap-6">
                                            <div className="w-24 h-24 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                                                {previews.profilePhoto ? (
                                                    <img src={previews.profilePhoto} alt="Profile Preview" className="w-full h-full object-cover" />
                                                ) : (
                                                    <User className="text-gray-400" size={32} />
                                                )}
                                            </div>
                                            <label className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-all font-medium text-gray-700 shadow-sm">
                                                <Upload size={18} />
                                                <span>Upload Photo</span>
                                                <input type="file" name="profilePhoto" onChange={handleFileChange} className="hidden" accept="image/*" />
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="p-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <Briefcase className="text-orange-500" /> Professional Details
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-700">Primary Service *</label>
                                        <select
                                            name="primaryService"
                                            value={formData.primaryService}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all bg-white"
                                        >
                                            <option value="">Select a service</option>
                                            {Array.isArray(services) && services.map(s => (
                                                <option key={s._id} value={s._id}>{s.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-700">Service Category *</label>
                                        <input
                                            type="text"
                                            name="serviceCategory"
                                            value={formData.serviceCategory}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                                            placeholder="E.g. Home Repairs, Beauty, etc."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-700">Years of Experience *</label>
                                        <input
                                            type="number"
                                            name="experience"
                                            value={formData.experience}
                                            onChange={handleInputChange}
                                            min="0"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                                        />
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="block text-sm font-semibold text-gray-700">Description / Bio</label>
                                        <textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            rows="4"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all resize-none"
                                            placeholder="Describe your skills and services..."
                                        />
                                    </div>
                                    <div className="md:col-span-2 space-y-4">
                                        <label className="block text-sm font-semibold text-gray-700">Professional Certification</label>
                                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-orange-400 transition-all cursor-pointer bg-gray-50 relative group">
                                            {previews.certification ? (
                                                <div className="flex flex-col items-center">
                                                    <FileText className="text-orange-500 mb-2" size={40} />
                                                    <span className="text-sm text-gray-600 truncate max-w-xs">{formData.certification.name}</span>
                                                </div>
                                            ) : (
                                                <>
                                                    <Upload className="mx-auto text-gray-400 group-hover:text-orange-500 transition-colors mb-3" size={32} />
                                                    <p className="text-sm text-gray-500">Upload your trade license or certification (PDF/Images)</p>
                                                </>
                                            )}
                                            <input type="file" name="certification" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="p-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <MapPin className="text-orange-500" /> Service Area & Hours
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="block text-sm font-semibold text-gray-700">Full Address *</label>
                                        <input
                                            type="text"
                                            name="address"
                                            value={formData.address}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                                            placeholder="House No, Street, Landmark"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-700">City *</label>
                                        <input
                                            type="text"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-700">Area / Locality *</label>
                                        <input
                                            type="text"
                                            name="area"
                                            value={formData.area}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-700">Pincode *</label>
                                        <input
                                            type="number"
                                            name="pincode"
                                            value={formData.pincode}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                                        />
                                    </div>
                                    <div className="md:col-span-2 space-y-4 pt-4 border-t border-gray-100">
                                        <label className="block text-sm font-semibold text-gray-700">Working Days</label>
                                        <div className="flex flex-wrap gap-2">
                                            {daysOfWeek.map(day => (
                                                <label key={day} className={`px-4 py-2 rounded-full text-sm font-medium cursor-pointer transition-all border ${formData.workingDays.includes(day)
                                                    ? "bg-orange-500 border-orange-500 text-white shadow-md"
                                                    : "bg-white border-gray-300 text-gray-600 hover:border-orange-400"
                                                    }`}>
                                                    <input
                                                        type="checkbox"
                                                        name="workingDays"
                                                        value={day}
                                                        checked={formData.workingDays.includes(day)}
                                                        onChange={handleInputChange}
                                                        className="hidden"
                                                    />
                                                    {day}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-4">
                                            <div className="flex-1 space-y-2">
                                                <label className="block text-sm font-semibold text-gray-700">Start Time</label>
                                                <input
                                                    type="time"
                                                    name="workingHoursStart"
                                                    value={formData.workingHoursStart}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                                                />
                                            </div>
                                            <div className="flex-1 space-y-2">
                                                <label className="block text-sm font-semibold text-gray-700">End Time</label>
                                                <input
                                                    type="time"
                                                    name="workingHoursEnd"
                                                    value={formData.workingHoursEnd}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 pt-6">
                                        <div className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                name="emergencyAvailability"
                                                checked={formData.emergencyAvailability}
                                                onChange={handleInputChange}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                                        </div>
                                        <span className="text-sm font-semibold text-gray-700">Available for Emergency Calls</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 4 && (
                            <div className="p-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <ShieldCheck className="text-orange-500" /> Identity Verification
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-700">ID Proof Type *</label>
                                        <select
                                            name="idType"
                                            value={formData.idType}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all bg-white"
                                        >
                                            <option value="Aadhar">Aadhar Card</option>
                                            <option value="PAN">PAN Card</option>
                                            <option value="Driving License">Driving License</option>
                                            <option value="Passport">Passport</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-700">ID Number *</label>
                                        <input
                                            type="text"
                                            name="idNumber"
                                            value={formData.idNumber}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                                            placeholder={`Enter ${formData.idType} number`}
                                        />
                                    </div>
                                    <div className="md:col-span-2 space-y-4">
                                        <label className="block text-sm font-semibold text-gray-700">ID Card Image (Front)</label>
                                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-orange-400 transition-all cursor-pointer bg-gray-50 relative">
                                            {previews.idImage ? (
                                                <div className="relative inline-block">
                                                    <img src={previews.idImage} alt="ID Preview" className="max-h-48 rounded-lg shadow-md" />
                                                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity rounded-lg">
                                                        <span className="text-white text-sm font-medium">Change Image</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="space-y-3">
                                                    <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto">
                                                        <Upload size={28} />
                                                    </div>
                                                    <p className="text-sm font-medium text-gray-600">Click to upload or drag and drop</p>
                                                    <p className="text-xs text-gray-400">PNG, JPG up to 5MB</p>
                                                </div>
                                            )}
                                            <input type="file" name="idImage" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                                        </div>
                                    </div>
                                    <div className="md:col-span-2 p-4 bg-orange-50 border border-orange-100 rounded-lg flex gap-3">
                                        <CheckCircle2 className="text-orange-500 shrink-0" size={20} />
                                        <p className="text-xs text-orange-800 leading-relaxed">
                                            By submitting, you agree to our terms of service and privacy policy. Your information will be encrypted and used only for verification purposes.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 5 && (
                            <div className="p-16 text-center">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                                    className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8"
                                >
                                    <CheckCircle2 size={48} />
                                </motion.div>
                                <h2 className="text-3xl font-bold text-gray-900 mb-4">Application Submitted!</h2>
                                <p className="text-gray-600 mb-10 max-w-md mx-auto leading-relaxed">
                                    Thank you for applying to join the LocalFix network. Our team will review your professional details and verification documents within 2-3 business days.
                                </p>
                                <button
                                    onClick={() => window.location.href = "/"}
                                    className="px-8 py-3 bg-orange-500 text-white font-bold rounded-full hover:bg-orange-600 transition-all shadow-lg hover:shadow-orange-200"
                                >
                                    Back to Home
                                </button>
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        {step < 5 && (
                            <div className="px-8 py-6 bg-gray-50 flex items-center justify-between border-t border-gray-100">
                                <button
                                    onClick={prevStep}
                                    disabled={step === 1}
                                    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold transition-all ${step === 1 ? "text-gray-300 cursor-not-allowed" : "text-gray-600 hover:bg-gray-100"
                                        }`}
                                >
                                    <ChevronLeft size={20} /> Previous
                                </button>
                                {step < 4 ? (
                                    <button
                                        onClick={nextStep}
                                        className="flex items-center gap-2 px-8 py-2.5 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-all shadow-md active:scale-95"
                                    >
                                        Next Step <ChevronRight size={20} />
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleSubmit}
                                        disabled={loading}
                                        className="flex items-center gap-2 px-10 py-2.5 bg-gray-900 text-white rounded-lg font-semibold hover:bg-black transition-all shadow-md active:scale-95 disabled:bg-gray-400"
                                    >
                                        {loading ? (
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <>Submit Application <CheckCircle2 size={20} /></>
                                        )}
                                    </button>
                                )}
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>

                {/* Info Cards */}
                {step < 5 && (
                    <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex gap-4">
                            <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-lg flex items-center justify-center shrink-0">
                                <Clock size={20} />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 text-sm">Quick Process</h4>
                                <p className="text-xs text-gray-500 mt-1">Takes about 5 minutes to complete the application.</p>
                            </div>
                        </div>
                        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex gap-4">
                            <div className="w-10 h-10 bg-purple-50 text-purple-500 rounded-lg flex items-center justify-center shrink-0">
                                <ShieldCheck size={20} />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 text-sm">Secure Data</h4>
                                <p className="text-xs text-gray-500 mt-1">Your ID and documents are stored securely.</p>
                            </div>
                        </div>
                        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex gap-4">
                            <div className="w-10 h-10 bg-orange-50 text-orange-500 rounded-lg flex items-center justify-center shrink-0">
                                <IndianRupee size={20} />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 text-sm">Earn More</h4>
                                <p className="text-xs text-gray-500 mt-1">Expand your reach and get more local leads.</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Enrollment;
