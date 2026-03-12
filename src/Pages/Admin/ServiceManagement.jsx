
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Plus,
    Edit2,
    Trash2,
    Wrench,
    ChevronDown,
    ChevronUp,
    Search,
    AlertCircle,
    CheckCircle2,
    X
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const ServiceManagement = () => {
    const { user } = useAuth();
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedServiceId, setExpandedServiceId] = useState(null);
    const [problems, setProblems] = useState({}); // Map serviceId -> problems array
    const [loadingProblems, setLoadingProblems] = useState({}); // Map serviceId -> boolean

    // Modals
    const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
    const [isProblemModalOpen, setIsProblemModalOpen] = useState(false);

    // Form States
    const [currentService, setCurrentService] = useState(null); // If null, adding new service
    const [currentProblem, setCurrentProblem] = useState(null); // If null, adding new problem
    const [targetServiceId, setTargetServiceId] = useState(null); // For adding problem to a specific service

    const apiUrl = import.meta.env.VITE_API_URL;

    // --- Service Fetching ---
    const fetchServices = async () => {
        try {
            const res = await axios.get(`${apiUrl}/api/services`);
            setServices(res.data.data);
        } catch (error) {
            toast.error("Failed to load services");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchServices();
    }, []);

    // --- Problem Fetching ---
    const fetchProblems = async (serviceId) => {
        setLoadingProblems(prev => ({ ...prev, [serviceId]: true }));
        try {
            const res = await axios.get(`${apiUrl}/api/problems/service/${serviceId}`);
            setProblems(prev => ({ ...prev, [serviceId]: res.data.data }));
        } catch (error) {
            toast.error("Failed to load problems");
        } finally {
            setLoadingProblems(prev => ({ ...prev, [serviceId]: false }));
        }
    };

    const toggleServiceExpansion = (serviceId) => {
        if (expandedServiceId === serviceId) {
            setExpandedServiceId(null);
        } else {
            setExpandedServiceId(serviceId);
            if (!problems[serviceId]) {
                fetchProblems(serviceId);
            }
        }
    };

    // --- Service CRUD ---
    const handleSaveService = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = {
            name: formData.get('name'),
            description: formData.get('description'),
            icon: formData.get('icon')
        };

        try {
            if (currentService) {
                await axios.put(`${apiUrl}/api/services/${currentService._id}`, data);
                toast.success("Service updated");
            } else {
                await axios.post(`${apiUrl}/api/services`, data);
                toast.success("Service created");
            }
            setIsServiceModalOpen(false);
            fetchServices();
        } catch (error) {
            toast.error(error.response?.data?.message || "Operation failed");
        }
    };

    const handleDeleteService = async (serviceId) => {
        if (!window.confirm("Are you sure? This will delete all associated problems.")) return;
        try {
            await axios.delete(`${apiUrl}/api/services/${serviceId}`);
            toast.success("Service deleted");
            fetchServices();
        } catch (error) {
            toast.error("Failed to delete service");
        }
    };

    // --- Problem CRUD ---
    const handleSaveProblem = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = {
            title: formData.get('title'),
            description: formData.get('description'),
            price: formData.get('price'),
            serviceId: targetServiceId
        };

        try {
            if (currentProblem) {
                await axios.put(`${apiUrl}/api/problems/${currentProblem._id}`, data);
                toast.success("Problem updated");
            } else {
                await axios.post(`${apiUrl}/api/problems`, data);
                toast.success("Problem created");
            }
            setIsProblemModalOpen(false);
            fetchProblems(targetServiceId);
        } catch (error) {
            toast.error(error.response?.data?.message || "Operation failed");
        }
    };

    const handleDeleteProblem = async (problemId, serviceId) => {
        if (!window.confirm("Are you sure?")) return;
        try {
            await axios.delete(`${apiUrl}/api/problems/${problemId}`);
            toast.success("Problem deleted");
            fetchProblems(serviceId);
        } catch (error) {
            toast.error("Failed to delete problem");
        }
    };

    const openServiceModal = (service = null) => {
        setCurrentService(service);
        setIsServiceModalOpen(true);
    };

    const openProblemModal = (serviceId, problem = null) => {
        setTargetServiceId(serviceId);
        setCurrentProblem(problem);
        setIsProblemModalOpen(true);
    };

    if (loading) return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div></div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Service Management</h1>
                    <p className="text-gray-500">Manage services and their associated problems.</p>
                </div>
                <button
                    onClick={() => openServiceModal()}
                    className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                    <Plus size={20} />
                    Add Service
                </button>
            </div>

            <div className="grid gap-4">
                {services.map(service => (
                    <div key={service._id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                        <div
                            className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                            onClick={() => toggleServiceExpansion(service._id)}
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                                    {/* Ideally render dynamic icon here, fallback to Wrench */}
                                    <Wrench size={20} />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-800">{service.name}</h3>
                                    <p className="text-sm text-gray-500 line-clamp-1">{service.description}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={(e) => { e.stopPropagation(); openServiceModal(service); }}
                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                >
                                    <Edit2 size={18} />
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleDeleteService(service._id); }}
                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                >
                                    <Trash2 size={18} />
                                </button>
                                <div className="text-gray-400">
                                    {expandedServiceId === service._id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                </div>
                            </div>
                        </div>

                        {/* Problems Section */}
                        {expandedServiceId === service._id && (
                            <div className="border-t border-gray-100 bg-gray-50/50 p-4 animate-in slide-in-from-top-2">
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="font-medium text-gray-700 flex items-center gap-2">
                                        <AlertCircle size={16} />
                                        Problems
                                    </h4>
                                    <button
                                        onClick={() => openProblemModal(service._id)}
                                        className="text-sm flex items-center gap-1 text-orange-600 hover:text-orange-700 font-medium"
                                    >
                                        <Plus size={16} />
                                        Add Problem
                                    </button>
                                </div>

                                {loadingProblems[service._id] ? (
                                    <div className="text-center py-4 text-gray-500">Loading problems...</div>
                                ) : problems[service._id]?.length === 0 ? (
                                    <div className="text-center py-4 text-gray-400 text-sm">No problems found for this service.</div>
                                ) : (
                                    <div className="grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                                        {problems[service._id]?.map(problem => (
                                            <div key={problem._id} className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm flex flex-col justify-between group">
                                                <div>
                                                    <div className="flex justify-between items-start">
                                                        <h5 className="font-medium text-gray-800">{problem.title}</h5>
                                                        <span className="text-sm font-bold text-green-600">₹{problem.price}</span>
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{problem.description}</p>
                                                </div>
                                                <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-gray-100 opacity-60 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => openProblemModal(service._id, problem)}
                                                        className="text-xs text-blue-600 hover:underline"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteProblem(problem._id, service._id)}
                                                        className="text-xs text-red-600 hover:underline"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Service Modal */}
            {isServiceModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-800">
                                {currentService ? "Edit Service" : "Add New Service"}
                            </h2>
                            <button onClick={() => setIsServiceModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSaveService} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Service Name</label>
                                <input
                                    name="name"
                                    defaultValue={currentService?.name}
                                    required
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                                    placeholder="e.g. Plumbing"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    name="description"
                                    defaultValue={currentService?.description}
                                    required
                                    rows="3"
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                                    placeholder="Describe the service..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Icon Identifier</label>
                                <input
                                    name="icon"
                                    defaultValue={currentService?.icon || "Hammer"}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                                    placeholder="e.g. Hammer, Wrench"
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsServiceModalOpen(false)}
                                    className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                                >
                                    {currentService ? "Update Service" : "Create Service"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Problem Modal */}
            {isProblemModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-800">
                                {currentProblem ? "Edit Problem" : "Add New Problem"}
                            </h2>
                            <button onClick={() => setIsProblemModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSaveProblem} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Problem Title</label>
                                <input
                                    name="title"
                                    defaultValue={currentProblem?.title}
                                    required
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                                    placeholder="e.g. Leaking Tap"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    name="description"
                                    defaultValue={currentProblem?.description}
                                    rows="2"
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                                    placeholder="Describe the problem..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Base Price (₹)</label>
                                <input
                                    name="price"
                                    type="number"
                                    defaultValue={currentProblem?.price}
                                    required
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                                    placeholder="e.g. 500"
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsProblemModalOpen(false)}
                                    className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                                >
                                    {currentProblem ? "Update Problem" : "Create Problem"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ServiceManagement;
