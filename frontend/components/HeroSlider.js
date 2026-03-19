import { useState, useEffect } from 'react';

const Card3D = ({ frontSrc, backSrc, desc, title, fallback }) => {
    const [flipped, setFlipped] = useState(false);
    const [rotate, setRotate] = useState({ x: 0, y: 0 });
    const [imgSrc, setImgSrc] = useState(frontSrc);

    useEffect(() => {
        const interval = setInterval(() => {
            setFlipped((prev) => !prev);
        }, 5000 + Math.random() * 2000);
        return () => clearInterval(interval);
    }, []);

    const handleMouseMove = (e) => {
        const card = e.currentTarget;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * 15;
        const rotateY = ((centerX - x) / centerX) * 15;
        setRotate({ x: rotateX, y: rotateY });
    };

    const handleMouseLeave = () => setRotate({ x: 0, y: 0 });

    return (
        <div className="relative aspect-[2.5/3.5] perspective-1000 group"
             style={{ width: 'clamp(130px, 22vw, 280px)' }}>
            <div
                className={`relative w-full h-full transition-all duration-500 transform-style-3d cursor-pointer rounded-2xl shadow-2xl group-hover:scale-[1.05] ${flipped ? 'rotate-y-180' : ''}`}
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
                <div className="absolute inset-0 backface-hidden rounded-2xl overflow-hidden border border-white/10 glass-card">
                    <div className="absolute inset-0 premium-shimmer opacity-30 z-10 pointer-events-none" />
                    <img
                        src={imgSrc}
                        alt={title}
                        className="w-full h-full object-cover"
                        onError={() => {
                            if (imgSrc !== fallback) {
                                setImgSrc(fallback || 'https://placehold.co/300x420/070B14/1D4ED8?text=Prize');
                            }
                        }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-tr from-ronhub-blue/0 via-white/5 to-ronhub-light-blue/0 opacity-50 z-20" />
                    <div className="absolute bottom-3 left-2 right-2 glass p-1.5 rounded-xl border border-white/10 text-center backdrop-blur-xl z-30">
                        <p className="text-[6px] md:text-[7px] font-black text-white/40 uppercase tracking-widest leading-tight">{title}</p>
                    </div>
                </div>

                {/* Back Face */}
                <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-2xl overflow-hidden border border-white/10 glass-card">
                    <img
                        src={backSrc}
                        alt="Prize Back"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            e.target.src = 'https://placehold.co/300x420/070B14/1E40AF?text=Auth';
                        }}
                    />
                    <div className="absolute inset-0 bg-ronhub-dark/60 backdrop-blur-[2px]" />
                    <div className="absolute inset-0 flex items-center justify-center p-4 text-center">
                        <div className="space-y-2">
                            <span className="glass px-2 py-1 rounded-full text-[7px] font-black tracking-widest border border-white/10">
                                {desc}
                            </span>
                            <p className="text-[8px] text-white/40 font-medium italic">Gem Mint Authentic</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function HeroSlider() {
    return (
        <section className="w-full flex justify-center py-4 md:py-8 relative">
            <div className="absolute inset-0 bg-ronhub-blue/10 blur-[150px] rounded-full -z-10" />

            {/* Cards row — always side by side, fluid sizing via clamp() */}
            <div className="flex flex-row gap-3 md:gap-6 items-end justify-center w-full">
                {/* Card 1 — slight left tilt */}
                <div className="transform -rotate-3 hover:rotate-0 transition-transform duration-500 hover:z-10 relative flex-shrink-0">
                    <Card3D
                        frontSrc="/pikachu-front.jpg"
                        backSrc="/pikachu-back.jpg"
                        title="Poncho Pikachu (Rayquaza) #231"
                        desc="PSA 10 GEM MINT"
                        fallback="https://placehold.co/300x420/070B14/1D4ED8?text=Rayquaza+%23231"
                    />
                </div>

                {/* Divider */}
                <div className="flex flex-col items-center gap-1 pb-8 md:pb-12 opacity-30 shrink-0">
                    <div className="w-px h-8 md:h-12 bg-gradient-to-t from-white/50 to-transparent" />
                    <span className="text-xs md:text-sm font-black text-white/30">+</span>
                    <div className="w-px h-8 md:h-12 bg-gradient-to-b from-white/50 to-transparent" />
                </div>

                {/* Card 2 — slight right tilt */}
                <div className="transform rotate-3 hover:rotate-0 transition-transform duration-500 hover:z-10 relative flex-shrink-0">
                    <Card3D
                        frontSrc="/poncho-pikachu-front.jpg"
                        backSrc="/pikachu-back.jpg"
                        title="Poncho Pikachu (Charizard) #208"
                        desc="PSA 10 GEM MINT"
                        fallback="https://placehold.co/300x420/0a101f/F59E0B?text=Charizard+%23208"
                    />
                </div>
            </div>

            <style jsx global>{`
                .perspective-1000 { perspective: 1600px; }
                .transform-style-3d { transform-style: preserve-3d; }
                .backface-hidden { backface-visibility: hidden; }
                .rotate-y-180 { transform: rotateY(180deg); }
                .glass-card {
                    background: linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01));
                }
            `}</style>
        </section>
    );
}
