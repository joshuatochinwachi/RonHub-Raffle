import { useState, useEffect } from 'react';

export default function HeroSlider() {
    const [flipped, setFlipped] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setFlipped((prev) => !prev);
        }, 4000); // 3D flip every 4 seconds
        return () => clearInterval(interval);
    }, []);

    return (
        <section className="flex flex-col items-center justify-center py-12 px-4">
            <div className="relative w-full max-w-[400px] aspect-[2.5/3.5] perspective-1000 group">
                {/* Glow Behind Card */}
                <div className="absolute inset-0 bg-ronhub-blue/20 blur-[120px] rounded-full animate-pulse -z-10" />

                {/* 3D Card Container */}
                <div
                    className={`relative w-full h-full transition-transform duration-1000 transform-style-3d cursor-pointer card-glint rounded-2xl shadow-2xl ${flipped ? 'rotate-y-180' : ''}`}
                    onClick={() => setFlipped(!flipped)}
                >
                    {/* Front Face */}
                    <div className="absolute inset-0 backface-hidden rounded-2xl overflow-hidden border border-white/10 glass">
                        <img
                            src="/charizard-front.png"
                            alt="BGS 7.5 1st Edition Charizard Front"
                            className="w-full h-full object-cover scale-110"
                            onError={(e) => {
                                e.target.src = 'https://placehold.co/400x560/070B14/1D4ED8?text=Charizard+Front';
                            }}
                        />
                        {/* Valuation Overlay */}
                        <div className="absolute bottom-6 left-6 right-6 glass p-4 rounded-xl border border-white/10 text-center">
                            <p className="text-ronhub-light-blue text-xs font-semibold uppercase tracking-wider mb-1">Current Valuation</p>
                            <h2 className="text-2xl font-bold text-white animate-pulse">{process.env.NEXT_PUBLIC_RAFFLE_VALUE || "£19,299.00"}</h2>
                        </div>
                    </div>

                    {/* Back Face */}
                    <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-2xl overflow-hidden border border-white/10 glass">
                        <img
                            src="/charizard-back.png"
                            alt="BGS 7.5 1st Edition Charizard Back"
                            className="w-full h-full object-cover scale-110"
                            onError={(e) => {
                                e.target.src = 'https://placehold.co/400x560/070B14/1D4ED8?text=Charizard+Back';
                            }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-ronhub-dark/80 to-transparent" />
                        <div className="absolute bottom-6 left-6 right-6 text-center">
                            <span className="glass px-4 py-1.5 rounded-full text-xs font-bold border border-white/20">{process.env.NEXT_PUBLIC_RAFFLE_DESC || "BGS 7.5 GRADED"}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3D Transform CSS - typically added to globals.css but scoped here for 3D support */}
            <style jsx global>{`
        .perspective-1000 { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
        </section>
    );
}
