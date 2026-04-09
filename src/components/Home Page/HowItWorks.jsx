import React, { useState } from 'react';
import { Search, CalendarCheck, Wrench, ThumbsUp, ArrowRight, X } from 'lucide-react';

const steps = [
    {
        icon: <Search size={32} />,
        title: "Find Your Service",
        tagline: "Explore Solutions",
        details: "Our AI-powered search filters by proximity, rating, and specialization. Simply type your problem, and we'll match you with a vetted pro.",
        description: "Browse our range of expert home solutions from plumbing to painting."
    },
    {
        icon: <CalendarCheck size={32} />,
        title: "Book a Slot",
        tagline: "Easy Scheduling",
        details: "Real-time calendar syncing ensures you get an appointment that fits. No back-and-forth calls needed.",
        description: "Pick a date and time that fits your schedule. No more waiting all day."
    },
    {
        icon: <Wrench size={32} />,
        title: "Expert arrives",
        tagline: "Verified Pros",
        details: "Every technician undergoes a 20-point background check. Track their arrival live on your dashboard.",
        description: "Our verified technician arrives with all tools to solve your problem."
    },
    {
        icon: <ThumbsUp size={32} />,
        title: "Job Done",
        tagline: "Quality Assured",
        details: "Payment is held in escrow until you approve the work. Includes a 30-day service guarantee.",
        description: "Inspect the work, pay securely, and enjoy your perfectly fixed home."
    }
];

export const HowItWorks = () => {
    const [selectedStep, setSelectedStep] = useState(null);

    return (
        <section className="bg-white py-24 px-6 relative">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="mb-16">
                    <h2 className="text-4xl font-black text-slate-900">
                        The <span className="text-blue-600">Smart way</span> to fix things.
                    </h2>
                </div>

                {/* 2x2 Dynamic Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {steps.map((step, index) => (
                        <div 
                            key={index} 
                            className="group relative p-10 rounded-[2.5rem] border-2 border-slate-50 bg-white transition-all duration-500 hover:bg-blue-600 hover:border-blue-600 hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-200 cursor-default"
                        >
                            {/* Watermark Number */}
                            <div className="absolute top-6 right-10 text-8xl font-black text-slate-50 group-hover:text-blue-500/20 transition-colors">
                                0{index}
                            </div>

                            <div className="relative z-10">
                                {/* Icon Container */}
                                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-white group-hover:scale-110 transition-all duration-500">
                                    {step.icon}
                                </div>

                                <h3 className="text-2xl font-black text-slate-900 group-hover:text-white mb-4 transition-colors">
                                    {step.title}
                                </h3>
                                <p className="text-slate-500 group-hover:text-blue-50 mb-8 transition-colors">
                                    {step.description}
                                </p>

                                {/* Learn More Trigger */}
                                <button 
                                    onClick={() => setSelectedStep(step)}
                                    className="flex items-center gap-2 text-sm font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-full group-hover:bg-white/20 group-hover:text-white transition-all transform active:scale-95"
                                >
                                    Learn More <ArrowRight size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Popup Modal for different processes */}
            {selectedStep && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div 
                        className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl relative animate-in zoom-in-95 duration-300"
                    >
                        <button 
                            onClick={() => setSelectedStep(null)}
                            className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 transition-colors"
                        >
                            <X size={20} className="text-slate-400" />
                        </button>

                        <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-100">
                            {selectedStep.icon}
                        </div>

                        <h4 className="text-xs font-black text-blue-600 uppercase tracking-widest mb-2">
                            {selectedStep.tagline}
                        </h4>
                        <h3 className="text-3xl font-black text-slate-900 mb-4">
                            {selectedStep.title}
                        </h3>
                        <p className="text-slate-600 leading-relaxed mb-8">
                            {selectedStep.details}
                        </p>

                        <button 
                            onClick={() => setSelectedStep(null)}
                            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-blue-600 transition-colors"
                        >
                            Got it, thanks!
                        </button>
                    </div>
                </div>
            )}
        </section>
    );
};

export default HowItWorks;