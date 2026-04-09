import React from 'react';
import { 
  Hammer, 
  ShieldCheck, 
  Zap, 
  Users, 
  ArrowRight, 
  Search, 
  ClipboardList, 
  Database 
} from 'lucide-react';

const AboutHero = () => {
  const coreFeatures = [
    {
      icon: <Search className="h-6 w-6" />,
      title: "Smart Discovery",
      desc: "Eliminating unverified sources by organizing local talent into a searchable, transparent database."
    },
    {
      icon: <ClipboardList className="h-6 w-6" />,
      title: "Centralized Management",
      desc: "A single interface to raise requests, manage bookings, and track service history seamlessly."
    },
    {
      icon: <Database className="h-6 w-6" />,
      title: "Technical Excellence",
      desc: "Built on modern auth and database management to ensure your data and requests are secure."
    }
  ];

  return (
    <div className="bg-white font-sans">
      {/* --- SECTION 1: THE MISSION HERO --- */}
      <section className="relative pt-10 pb-20 overflow-hidden bg-white">
        {/* Soft Background Accents */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-slate-50/50 -skew-x-12 translate-x-1/4 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Text Content */}
            <div className="space-y-8 text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                </span>
                <span className="text-xs font-black uppercase tracking-widest text-blue-600">
                  Our Mission
                </span>
              </div>

              <h1 className="text-5xl lg:text-7xl font-black tracking-tight text-slate-900 leading-[1.1]">
                Reinventing how your <br />
                <span className="text-blue-600">Community Connects.</span>
              </h1>

              <p className="text-xl text-slate-600 leading-relaxed max-w-xl">
                LocalFix was born from a simple observation: finding a reliable professional shouldn't feel like a gamble. We’ve built a centralized bridge that turns uncertainty into efficiency.
              </p>

              <div className="flex flex-wrap gap-4">
                <button className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-xl shadow-slate-200 flex items-center gap-2 group">
                  Learn Our Story
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <div className="flex -space-x-3 items-center ml-4">
                  {[12, 13, 14, 15].map((i) => (
                    <div key={i} className="h-12 w-12 rounded-full border-4 border-white bg-slate-200 overflow-hidden">
                      <img src={`https://i.pravatar.cc/150?img=${i}`} alt="Verified Pro" />
                    </div>
                  ))}
                  <p className="pl-6 text-sm font-bold text-slate-500">Joined by 2k+ Local Pros</p>
                </div>
              </div>
            </div>

            {/* Visual Feature Grid */}
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4 pt-12">
                  <div className="bg-blue-600 p-8 rounded-[2.5rem] shadow-xl shadow-blue-200 text-white group hover:-translate-y-2 transition-transform duration-500">
                    <ShieldCheck className="h-10 w-10 mb-4 opacity-80" />
                    <h3 className="text-lg font-bold">Verified Trust</h3>
                    <p className="text-blue-100 text-sm mt-2 leading-relaxed">No more unverified sources. Every pro is vetted for your peace of mind.</p>
                  </div>
                  <div className="bg-slate-100 p-8 rounded-[2.5rem] group hover:-translate-y-2 transition-transform duration-500 border border-slate-200">
                    <Zap className="h-10 w-10 text-blue-600 mb-4" />
                    <h3 className="text-lg font-bold text-slate-900">Instant Access</h3>
                    <p className="text-slate-500 text-sm mt-2 leading-relaxed">Search, book, and manage in one centralized interface.</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white group hover:-translate-y-2 transition-transform duration-500 shadow-2xl shadow-slate-300">
                    <Users className="h-10 w-10 text-blue-500 mb-4" />
                    <h3 className="text-lg font-bold">Local Growth</h3>
                    <p className="text-slate-400 text-sm mt-2 leading-relaxed">Empowering skilled workers with a digital space to thrive.</p>
                  </div>
                  <div className="bg-blue-50 p-8 rounded-[2.5rem] border border-blue-100 group hover:-translate-y-2 transition-transform duration-500">
                    <Hammer className="h-10 w-10 text-blue-600 mb-4" />
                    <h3 className="text-lg font-bold text-slate-900">Unified Fix</h3>
                    <p className="text-slate-500 text-sm mt-2 leading-relaxed">From plumbing to carpentry, we organize the chaos.</p>
                  </div>
                </div>
              </div>
              <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-100 rounded-full blur-3xl opacity-50" />
            </div>
          </div>
        </div>
      </section>

      {/* --- SECTION 2: THE PROBLEM & TECHNICAL STACK --- */}
      <section className="py-24 bg-slate-900 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2" />
        
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
            <div className="space-y-8">
              <h3 className="text-white text-4xl font-black leading-tight">
                Solving the household <br />
                <span className="text-blue-500">service challenge.</span>
              </h3>
              <p className="text-slate-400 text-lg leading-relaxed">
                Most users rely on unverified sources, leading to inconsistent quality and unclear pricing. 
                LocalFix organizes service information in one place, improving accessibility 
                and efficiency for both users and service providers.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  "Plumbing & Electrical",
                  "Appliance Repair",
                  "Verified Professionalism",
                  "Digital Skill Registration"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-slate-300">
                    <div className="h-2 w-2 rounded-full bg-blue-500" />
                    <span className="font-medium text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-6">
              {coreFeatures.map((feature, i) => (
                <div key={i} className="flex gap-6 p-6 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                  <div className="shrink-0 w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white">
                    {feature.icon}
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-lg mb-1">{feature.title}</h4>
                    <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Service Footer Labels */}
          <div className="pt-16 border-t border-white/10 text-center">
            <p className="text-slate-500 font-bold text-xs uppercase tracking-[0.3em] mb-8">Service Verticals</p>
            <div className="flex flex-wrap justify-center gap-x-12 gap-y-6">
              {['Plumbing', 'Electrical', 'Appliances', 'Carpentry'].map((item) => (
                <span key={item} className="text-xl font-black text-slate-600 hover:text-blue-500 transition-colors">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutHero;