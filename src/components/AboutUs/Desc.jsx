import React from 'react';
import { Search, ClipboardCheck, Wrench, ShieldCheck, ArrowRight, MousePointer2, Star } from 'lucide-react';

const AboutDescription = () => {
    const steps = [
      {
        icon: <Search className="h-6 w-6" />,
        title: "Search & Discover",
        desc: "Browse our centralized database of verified local professionals filtered by your specific needs.",
        details: "AI-driven matching based on proximity, rating, and expertise.",
        color: "bg-blue-500"
      },
      {
        icon: <ClipboardCheck className="h-6 w-6" />,
        title: "Raise Request",
        desc: "Detail your repair needs—from plumbing to carpentry—and manage bookings through our interface.",
        details: "Instant dispatch to top-rated pros in your local area.",
        color: "bg-slate-900"
      },
      {
        icon: <Wrench className="h-6 w-6" />,
        title: "Expert Repair",
        desc: "A skilled local pro is dispatched to your location, equipped with the right tools for the job.",
        details: "Verified background checks and tool-readiness protocols.",
        color: "bg-blue-600"
      },
      {
        icon: <ShieldCheck className="h-6 w-6" />,
        title: "Quality Fixed",
        desc: "Every job is backed by our verification system, ensuring consistent quality and transparent pricing.",
        details: "Secure escrow payments and 30-day satisfaction warranty.",
        color: "bg-emerald-500"
      }
    ];

    return (
        <section className="py-24 bg-slate-50 overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                
                {/* Header Section */}
                <div className="flex flex-col lg:flex-row justify-between items-center gap-12 mb-20">
                    <div className="max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 border border-blue-200 mb-4">
                            <span className="text-[10px] font-black uppercase tracking-widest text-blue-700">How It Works</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                            From Request to Result: <br />
                            <span className="text-blue-600">The LocalFix Flow.</span>
                        </h2>
                    </div>

                    {/* Refreshed: Testimonials / Quick Stats Card */}
                    <div className="w-full lg:w-auto flex-shrink-0">
                        <div className="bg-white border border-slate-200 p-6 rounded-[2rem] shadow-sm flex flex-col gap-4 min-w-[300px]">
                            <div className="flex items-start gap-4">
                                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow">
                                    <Wrench className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-lg font-black text-slate-900">Explore Our Services</p>
                                    <p className="text-sm text-slate-500">120+ service types — plumbing, electrical, carpentry, HVAC and more.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-3">
                                <div className="bg-slate-50 p-3 rounded-lg">
                                    <p className="text-sm text-slate-700">"Quick electrical repair — showed up on time and fixed everything."</p>
                                    <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                                        <Star className="h-3 w-3 text-amber-400" />
                                        <span className="font-bold text-slate-900">4.8</span>
                                        <span>• Rated across service categories</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-6">
                                        <div className="text-center">
                                            <div className="text-2xl font-black text-slate-900">120+</div>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase">Service Types</p>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-black text-slate-900">45m</div>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase">Avg. Completion</p>
                                        </div>
                                    </div>
                                    <button onClick={() => window.location.href='/services'} className="px-4 py-2 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 transition">Explore Services</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Process Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
                    <div className="hidden lg:block absolute top-1/4 left-0 w-full h-px bg-slate-200 -z-0" />
                    
                    {steps.map((step, index) => (
                        <div key={index} className="relative z-10 group">
                            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 
                                          hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-100 
                                          transition-all duration-500 ease-in-out h-full overflow-hidden flex flex-col">
                                
                                <div className="flex justify-between items-start mb-8">
                                    <div className={`${step.color} h-14 w-14 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110 duration-500`}>
                                        {step.icon}
                                    </div>
                                    <span className="text-4xl font-black text-slate-100 group-hover:text-blue-50 transition-colors italic">
                                        0{index + 1}
                                    </span>
                                </div>

                                <h3 className="text-xl font-black text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">
                                    {step.title}
                                </h3>

                                <div className="relative h-24 overflow-hidden">
                                    <p className="absolute inset-0 text-slate-500 text-sm leading-relaxed transition-all duration-500 group-hover:opacity-0 group-hover:-translate-y-4">
                                        {step.desc}
                                    </p>
                                    <p className="absolute inset-0 text-blue-700 text-sm font-semibold leading-relaxed opacity-0 translate-y-4 transition-all duration-500 group-hover:opacity-100 group-hover:translate-y-0">
                                        {step.details}
                                    </p>
                                </div>

                                <div className="mt-auto pt-6 flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-10px] group-hover:translate-x-0">
                                    Learn More <ArrowRight className="h-3 w-3" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Technical Bottom Banner */}
                <div className="mt-20 p-8 bg-slate-900 rounded-[3rem] flex flex-col md:flex-row items-center justify-between gap-8 group/banner">
                    <div className="flex items-center gap-6">
                        <div className="h-12 w-12 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center group-hover/banner:bg-blue-600/40 transition-colors">
                            <MousePointer2 className="h-5 w-5 text-blue-400 animate-bounce" />
                        </div>
                        <div>
                            <p className="text-white font-bold">Driven by Modern Infrastructure</p>
                            <p className="text-slate-400 text-xs">Auth Security • Database Management • Real-time Requests</p>
                        </div>
                    </div>
                    <button className="px-8 py-4 bg-blue-600 hover:bg-white hover:text-blue-600 text-white rounded-2xl font-black transition-all flex items-center gap-2 active:scale-95">
                        Get Your First Fix
                        <ArrowRight className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </section>
    );
};

export default AboutDescription;