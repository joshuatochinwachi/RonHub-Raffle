import { useState, useEffect } from 'react';

export default function HeroSlider() {
    const [flipped, setFlipped] = useState(false);
    const [rotate, setRotate] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const interval = setInterval(() => {
            setFlipped((prev) => !prev);
        }, 4000); // 3D flip every 4 seconds
        return () => clearInterval(interval);
    }, []);

    const handleMouseMove = (e) => {
        const card = e.currentTarget;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * 15; // Max 15 deg
        const rotateY = ((centerX - x) / centerX) * 15; // Max 15 deg

        setRotate({ x: rotateX, y: rotateY });
    };

    const handleMouseLeave = () => {
        setRotate({ x: 0, y: 0 });
    };

    return (
        <section className="flex flex-col items-center justify-center py-12 px-4 relative">
            <div className="relative w-full max-w-[400px] aspect-[2.5/3.5] perspective-1000 group">
                {/* Glow Behind Card */}
                <div className="absolute inset-0 bg-ronhub-blue/20 blur-[150px] rounded-full animate-pulse -z-10" />

                {/* 3D Card Container */}
                <div
                    className={`relative w-full h-full transition-all duration-300 transform-style-3d cursor-pointer rounded-3xl shadow-[0_50px_100px_rgba(0,0,0,0.6)] hover:shadow-ronhub-blue/20 group-hover:scale-[1.02] ${flipped ? 'rotate-y-180' : ''}`}
                    onClick={() => setFlipped(!flipped)}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    style={{
                        transform: flipped
                            ? `rotateY(180deg) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`
                            : `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`
                    }}
                >
                    {/* Front Face */}
                    <div className="absolute inset-0 backface-hidden rounded-3xl overflow-hidden border border-white/10 glass-card">
                        {/* Shimmer Effect */}
                        <div className="absolute inset-0 premium-shimmer opacity-30 z-10 pointer-events-none" />

                        <img
                            src="/pikachu-front.jpg"
                            alt="Prize Front"
                            className="w-full h-full object-cover scale-105 group-hover:scale-110 transition-transform duration-700"
                            onError={(e) => {
                                e.target.src = 'https://placehold.co/400x560/070B14/1D4ED8?text=Prize+Front';
                            }}
                        />

                        {/* Holographic "Sheen" */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-ronhub-blue/0 via-white/5 to-ronhub-light-blue/0 opacity-50 z-20" />

                        {/* Valuation Overlay */}
                        <div className="absolute bottom-6 left-6 right-6 md:bottom-8 md:left-8 md:right-8 glass p-4 md:p-5 rounded-2xl border border-white/10 text-center backdrop-blur-2xl z-30">
                            <p className="text-ronhub-light-blue text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] mb-1">
                                Est. Valuation
                            </p>
                            <h2 className="text-2xl md:text-3xl font-black text-white font-display tracking-tight drop-shadow-lg">
                                {process.env.NEXT_PUBLIC_RAFFLE_VALUE || "£40,366.42"}
                            </h2>
                            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-12 h-1 bg-ronhub-light-blue rounded-full blur-sm animate-pulse" />
                        </div>
                    </div>

                    {/* Back Face */}
                    <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-3xl overflow-hidden border border-white/10 glass-card">
                        <img
                            src="/pikachu-back.jpg"
                            alt="Prize Back"
                            className="w-full h-full object-cover scale-105"
                            onError={(e) => {
                                e.target.src = 'https://placehold.co/400x560/070B14/1E40AF?text=Prize+Back';
                            }}
                        />
                        <div className="absolute inset-0 bg-ronhub-dark/60 backdrop-blur-[2px]" />
                        <div className="absolute inset-0 flex items-center justify-center p-8 md:p-12 text-center">
                            <div className="space-y-3 md:space-y-4">
                                <span className="glass px-4 py-1.5 md:px-6 md:py-2 rounded-full text-[8px] md:text-[10px] font-black tracking-[0.2em] border border-white/10 shadow-xl">
                                    {process.env.NEXT_PUBLIC_RAFFLE_DESC || "PSA 10 GEM MINT"}
                                </span>
                                <p className="text-[10px] md:text-xs text-white/60 font-medium">Click to flip card</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3D Transform CSS */}
            <style jsx global>{`
                .perspective-1000 { perspective: 2000px; }
                .transform-style-3d { transform-style: preserve-3d; }
                .backface-hidden { backface-visibility: hidden; }
                .rotate-y-180 { transform: rotateY(180deg); }
                .glass-card {
                    background: linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.01));
                }
            `}</style>
        </section>
    );
}
