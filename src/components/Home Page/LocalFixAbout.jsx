import React, { useRef, useState } from 'react';
import { CheckCircle, Play } from 'lucide-react';
import Intro from '../../assets/Intro.mp4';


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
        <div className="max-w-7xl mx-auto p-6 md:p-12 font-sans text-[#0f172a]">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

                {/* Left Side: Image and Badge */}
                <div className="relative">
                    {/* Experience Badge */}
                    <div className="absolute -top-6 left-6 z-10 bg-[#bada55] px-6 py-4 rounded-xl shadow-md">
                        <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-black italic">1+</span>
                            <div className="text-[10px] leading-tight font-bold uppercase tracking-wider">
                                Years Of <br /> Experience
                            </div>
                        </div>
                    </div>

                    {/* Main Image Container */}
                    <div className="rounded-[2rem] overflow-hidden border-8 border-white shadow-2xl">
                        <img
                            src="https://media.istockphoto.com/id/1943281621/photo/professional-plumber-taking-adjustable-wrench-from-tool-bag-indoors-closeup.jpg?s=612x612&w=0&k=20&c=dJE172R6CVz3ZSwcIbaNWWaqslvarEPHjHqcH1fk18g= "
                            alt="LocalFix Professional"
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>

                {/* Right Side: Content */}
                <div className="space-y-8">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-[2px] bg-[#bada55]"></div>
                        <span className="text-sm font-semibold uppercase tracking-widest text-gray-500">About LocalFix</span>
                    </div>

                    <h2 className="text-5xl font-black leading-tight tracking-tight">
                        Meet The Experts Behind <br />
                        <span className="text-[#0f172a]">Your Home Solutions</span>
                    </h2>

                    <p className="text-gray-600 text-lg leading-relaxed">
                        At LocalFix, we are more than just technicians; we are a team of dedicated
                        problem solvers committed to keeping your home in perfect shape.
                    </p>

                    {/* Service Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                        {[
                            "Expert Plumbing Services",
                            "Professional Carpentry",
                            "Quality Interior Painting",
                            "Verified Technicians",
                            "Always Here For You 24/7",
                            "Problem Solver's Heart"
                        ].map((item, index) => (
                            <div key={index} className="flex items-center gap-3">
                                <CheckCircle className="text-[#bada55] fill-[#bada55]/20" size={24} />
                                <span className="font-bold text-sm">{item}</span>
                            </div>
                        ))}
                    </div>

                    <button className="bg-[#bada55] hover:bg-[#a8c744] transition-colors text-black font-bold py-4 px-10 rounded-full text-sm uppercase tracking-widest">
                        Book a Service
                    </button>

                    {/* Video / Secondary Section */}
                    <div
                        className="relative mt-8 group cursor-pointer"
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                    >
                        <div className="rounded-3xl overflow-hidden h-78 relative shadow-lg">
                            <video
                                ref={videoRef}
                                className={`w-full h-full object-cover transition-all duration-500 ${isPlaying ? 'grayscale-0' : 'grayscale group-hover:grayscale-0'
                                    }`}
                                poster="/api/placeholder/400/200" // Image shown before video plays
                                loop
                                muted
                                playsInline
                            >
                                <source src={Intro} type="video/mp4" />
                                Your browser does not support the video tag.
                            </video>
                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                <div className="w-14 h-14 bg-[#bada55] rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                    <Play fill="black" size={24} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 pt-12 border-t border-gray-100">
                <div className="text-center md:text-left">
                    <h3 className="text-4xl font-black">5K+</h3>
                    <p className="text-gray-500 font-semibold uppercase text-xs tracking-widest mt-2">Tasks Completed</p>
                </div>
                <div className="text-center md:text-left">
                    <h3 className="text-4xl font-black">99%</h3>
                    <p className="text-gray-500 font-semibold uppercase text-xs tracking-widest mt-2">Satisfaction Rating</p>
                </div>
                <div className="text-center md:text-left">
                    <h3 className="text-4xl font-black">30 Min</h3>
                    <p className="text-gray-500 font-semibold uppercase text-xs tracking-widest mt-2">Response Available</p>
                </div>
            </div>
        </div>
    );
};

// export default LocalFixAbout;