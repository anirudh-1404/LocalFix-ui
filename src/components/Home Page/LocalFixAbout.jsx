import React, { useRef, useState, useEffect } from 'react';
import { CheckCircle, Play } from 'lucide-react';
import Intro from '../../assets/Intro.mp4';

// Updated StatCounter with Intersection Observer logic
const StatCounter = ({ end, duration = 2000, suffix = "" }) => {
    const [count, setCount] = useState(0);
    const [hasStarted, setHasStarted] = useState(false);
    const elementRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setHasStarted(true);
                }
            },
            { threshold: 0.5 } // Starts when 50% of the element is visible
        );

        if (elementRef.current) {
            observer.observe(elementRef.current);
        }

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!hasStarted) return;

        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            setCount(Math.floor(progress * end));
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }, [hasStarted, end, duration]);

    return <span ref={elementRef}>{count}{suffix}</span>;
};

export const LocalFixAbout = () => {
    const videoRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const handleMouseEnter = () => {
        if (videoRef.current) {
            videoRef.current.play();
            setIsPlaying(true);
        }
    };

    const handleMouseLeave = () => {
        if (videoRef.current) {
            videoRef.current.pause();
            setIsPlaying(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-6 md:p-12 font-sans text-slate-900">
            {/* Upper Content Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                {/* Image Side */}
                <div className="relative">
                    <div className="absolute -top-6 left-6 z-10 bg-blue-600 text-white px-6 py-4 rounded-xl shadow-xl shadow-blue-200">
                        <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-black italic">1+</span>
                            <div className="text-[10px] leading-tight font-bold uppercase tracking-wider opacity-90">
                                Years Of <br /> Experience
                            </div>
                        </div>
                    </div>
                    <div className="rounded-[2rem] overflow-hidden border-8 border-white shadow-2xl">
                        <img
                            src="https://media.istockphoto.com/id/1943281621/photo/professional-plumber-taking-adjustable-wrench-from-tool-bag-indoors-closeup.jpg?s=612x612&w=0&k=20&c=dJE172R6CVz3ZSwcIbaNWWaqslvarEPHjHqcH1fk18g="
                            alt="LocalFix Professional"
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>

                {/* Text Side */}
                <div className="space-y-8">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-[2px] bg-blue-600"></div>
                        <span className="text-sm font-semibold uppercase tracking-widest text-blue-600">About LocalFix</span>
                    </div>
                    <h2 className="text-5xl font-black leading-tight tracking-tight text-slate-900">
                        Meet The Experts Behind <br />
                        <span className="text-blue-600">Your Home Solutions</span>
                    </h2>
                    <p className="text-slate-600 text-lg leading-relaxed">
                        At LocalFix, we are more than just technicians; we are a team of dedicated
                        problem solvers committed to keeping your home in perfect shape.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                        {["Expert Plumbing", "Professional Carpentry", "Quality Painting", "Verified Technicians", "24/7 Support", "Problem Solvers"].map((item, index) => (
                            <div key={index} className="flex items-center gap-3">
                                <CheckCircle className="text-blue-600 fill-blue-50" size={24} />
                                <span className="font-bold text-slate-800 text-sm">{item}</span>
                            </div>
                        ))}
                    </div>
                    <button className="bg-blue-600 hover:bg-blue-700 transition-all shadow-lg text-white font-bold py-4 px-10 rounded-full text-sm uppercase tracking-widest transform hover:scale-105">
                        Book a Service
                    </button>
                    {/* Video Embed */}
                    <div className="relative mt-8 group cursor-pointer" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                        <div className="rounded-3xl overflow-hidden h-78 relative shadow-lg ring-1 ring-slate-200">
                            <video ref={videoRef} className={`w-full h-full object-cover transition-all duration-500 ${isPlaying ? 'grayscale-0' : 'grayscale'}`} poster="/api/placeholder/400/200" loop muted playsInline>
                                <source src={Intro} type="video/mp4" />
                            </video>
                            <div className="absolute inset-0 bg-blue-900/10 flex items-center justify-center">
                                <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                    <Play fill="white" className="text-white" size={24} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- Stats Section with Intersection Counting --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 pt-12 border-t border-slate-100">
                <div className="text-center md:text-left">
                    <h3 className="text-4xl font-black text-slate-900">
                        <StatCounter end={5} suffix="K+" />
                    </h3>
                    <p className="text-blue-600 font-bold uppercase text-xs tracking-widest mt-2">Tasks Completed</p>
                </div>
                <div className="text-center md:text-left">
                    <h3 className="text-4xl font-black text-slate-900">
                        <StatCounter end={99} suffix="%" />
                    </h3>
                    <p className="text-blue-600 font-bold uppercase text-xs tracking-widest mt-2">Satisfaction Rating</p>
                </div>
                <div className="text-center md:text-left">
                    <h3 className="text-4xl font-black text-slate-900">
                        <StatCounter end={30} suffix=" Min" />
                    </h3>
                    <p className="text-blue-600 font-bold uppercase text-xs tracking-widest mt-2">Response Available</p>
                </div>
            </div>
        </div>
    );
};

// export default LocalFixAbout;