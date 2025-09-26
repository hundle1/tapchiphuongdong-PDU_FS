'use client';

import { useEffect, useState, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function HeroSkeleton() {
    const [index, setIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const sliderRef = useRef<HTMLDivElement>(null);

    // Drag state
    const startX = useRef<number | null>(null);
    const currentTranslate = useRef(0);
    const isDragging = useRef(false);

    // Auto slide every 7 seconds
    useEffect(() => {
        if (isPaused) return; // pause when hovered
        const interval = setInterval(() => {
            handleNext();
        }, 7000);
        return () => clearInterval(interval);
    }, [isPaused]);

    const handlePrev = () => {
        setIndex((prev) => (prev === 0 ? 2 : prev - 1));
    };

    const handleNext = () => {
        setIndex((prev) => (prev === 2 ? 0 : prev + 1));
    };

    // Mouse events for drag
    const handleMouseDown = (e: React.MouseEvent) => {
        isDragging.current = true;
        startX.current = e.clientX;
        if (sliderRef.current) {
            sliderRef.current.style.transition = 'none';
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging.current || startX.current === null) return;
        const diff = e.clientX - startX.current;
        if (sliderRef.current) {
            sliderRef.current.style.transform = `translateX(calc(-${index * 100}% + ${diff}px))`;
        }
    };

    const handleMouseUp = (e: React.MouseEvent) => {
        if (!isDragging.current || startX.current === null) return;
        const diff = e.clientX - startX.current;
        isDragging.current = false;

        if (sliderRef.current) {
            sliderRef.current.style.transition = 'transform 0.5s ease';
        }

        if (diff > 50) {
            handlePrev();
        } else if (diff < -50) {
            handleNext();
        } else {
            // reset if drag too short
            if (sliderRef.current) {
                sliderRef.current.style.transform = `translateX(-${index * 100}%)`;
            }
        }
        startX.current = null;
    };

    return (
        <div
            className="bg-gradient-to-r from-[#060f51] via-[#091577] to-yellow-300 text-white py-20 relative"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            <div className="max-w-7xl mx-auto px-4">
                {/* Container slider */}
                <div className="overflow-hidden relative">
                    <div
                        ref={sliderRef}
                        className="flex transition-transform duration-1000"
                        style={{ transform: `translateX(-${index * 100}%)` }}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                    >
                        {[...Array(3)].map((_, i) => (
                            <div
                                key={i}
                                className="min-w-full flex items-center justify-center gap-4 px-4 cursor-grab active:cursor-grabbing select-none"
                            >
                                <div className="w-40 h-52 bg-white/30 rounded animate-pulse"></div>
                                <div className="flex flex-col gap-4">
                                    <div className="w-64 h-20 bg-white/30 rounded animate-pulse"></div>
                                    <div className="w-64 h-20 bg-white/30 rounded animate-pulse"></div>
                                </div>
                                <div className="w-40 h-52 bg-white/30 rounded animate-pulse"></div>
                            </div>
                        ))}
                    </div>

                    {/* Nút bấm trái */}
                    <button
                        onClick={handlePrev}
                        className="absolute top-1/2 -translate-y-1/2 left-2 bg-white/30 hover:bg-white/50 p-2 rounded-full"
                    >
                        <ChevronLeft className="w-6 h-6 text-white" />
                    </button>

                    {/* Nút bấm phải */}
                    <button
                        onClick={handleNext}
                        className="absolute top-1/2 -translate-y-1/2 right-2 bg-white/30 hover:bg-white/50 p-2 rounded-full"
                    >
                        <ChevronRight className="w-6 h-6 text-white" />
                    </button>

                    {/* Dots */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                        {[...Array(3)].map((_, i) => (
                            <div
                                key={i}
                                className={`w-3 h-3 rounded-full ${index === i ? 'bg-white' : 'bg-white/50'
                                    }`}
                            ></div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
