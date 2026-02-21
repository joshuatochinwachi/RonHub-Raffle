import { useState, useEffect } from 'react';
import HeroSlider from '@/components/HeroSlider';
import RaffleInfo from '@/components/RaffleInfo';
import WalletButton from '@/components/WalletButton';
import BuyTicketButton from '@/components/BuyTicketButton';
import UserTickets from '@/components/UserTickets';

export default function Home() {
    const [address, setAddress] = useState(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    useEffect(() => {
        // Only run mouse tracking on desktop to save mobile battery/GPU
        if (window.innerWidth < 768) return;

        const handleMouseMove = (e) => {
            const x = (e.clientX / window.innerWidth) * 100;
            const y = (e.clientY / window.innerHeight) * 100;
            document.documentElement.style.setProperty('--mouse-x', `${x}%`);
            document.documentElement.style.setProperty('--mouse-y', `${y}%`);
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const handlePurchaseSuccess = (ticketNumber) => {
        // Increment trigger to refresh UserTickets
        setRefreshTrigger(prev => prev + 1);
    };

    return (
        <div className="relative min-h-screen pb-24 selection:bg-ronhub-blue/30 overflow-x-hidden bg-[#03050c]">
            {/* Premium Background Layer */}
            <div className="fixed inset-0 pointer-events-none z-0 fixed-bg-layer bg-[radial-gradient(circle_at_var(--mouse-x)_var(--mouse-y),rgba(29,78,216,0.15)_0%,transparent_50%)]" />
            <div className="mesh-glow" />
            <div className="noise-overlay" />

            {/* Header / Navbar */}
            <header className="w-full max-w-7xl mx-auto flex items-center justify-between p-6 md:p-10 sticky top-0 z-50 backdrop-blur-md bg-transparent">
                <div className="flex items-center gap-3 group cursor-pointer">
                    <div className="w-12 h-12 rounded-2xl overflow-hidden flex items-center justify-center shadow-[0_0_20px_rgba(29,78,216,0.3)] transition-transform group-hover:scale-110 duration-500">
                        <img
                            src="/logo.png"
                            alt="RonHub Logo"
                            className="w-full h-full object-contain mix-blend-lighten"
                        />
                    </div>
                    <div className="flex flex-col -space-y-1">
                        <h1 className="text-2xl font-black uppercase tracking-tighter leading-none">
                            RonHub
                        </h1>
                        <span className="text-[10px] font-bold text-ronhub-light-blue uppercase tracking-[0.3em]">
                            Raffle
                        </span>
                    </div>
                </div>

                <WalletButton onAddressChange={setAddress} />
            </header>

            {/* Hero Section */}
            <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center px-6 mt-8 md:mt-16">

                {/* Left: Info & Action (7 cols on desktop) */}
                <div className="lg:col-span-7 space-y-10 flex flex-col items-center lg:items-start text-center lg:text-left order-1 prize-reveal">
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full border border-white/10">
                            <div className="w-2 h-2 rounded-full bg-ronhub-light-blue animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/80">
                                Live Ronin Giveaway
                            </span>
                        </div>

                        <h2 className="text-5xl md:text-7xl lg:text-8xl font-black leading-[0.9] text-hero tracking-tighter">
                            WIN THE <br />
                            <span className="text-liquid">
                                {process.env.NEXT_PUBLIC_RAFFLE_PRIZE?.toUpperCase() || "BGS 7.5 CHARIZARD"}
                            </span>
                        </h2>

                        <p className="text-white/50 text-base md:text-lg max-w-xl font-medium leading-relaxed opacity-80">
                            Experience the elite standard of digital collectible giveaways. Powered by the Ronin Network, every entry is
                            <span className="text-white ml-1">100% transparent and verifiable on-chain</span>.
                        </p>
                    </div>

                    {/* Prominent Prize Highlight */}
                    <div className="w-full glass p-8 rounded-[2.5rem] relative overflow-hidden group prize-card-glow transition-all duration-700 hover:scale-[1.02]">
                        <div className="absolute inset-0 prize-highlight-bg opacity-30" />
                        <div className="relative flex flex-col items-center justify-center text-center">
                            <div className="space-y-2">
                                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gold/60 block">Grand Prize Value</span>
                                <h3 className="text-6xl md:text-8xl font-black text-gold font-display leading-none">
                                    {process.env.NEXT_PUBLIC_RAFFLE_VALUE || "£19,299"}
                                </h3>
                            </div>
                        </div>
                    </div>

                    <div className="w-full max-w-2xl">
                        <RaffleInfo />
                    </div>

                    <div className="w-full max-w-md lg:max-w-xl group">
                        <BuyTicketButton
                            address={address}
                            onPurchaseSuccess={handlePurchaseSuccess}
                        />
                    </div>
                </div>

                {/* Right: 3D Showcase (5 cols on desktop) */}
                <div className="lg:col-span-5 order-2 flex justify-center">
                    <div className="relative w-full max-w-[450px]">
                        <div className="absolute inset-0 bg-ronhub-blue/10 blur-[150px] -z-10 animate-pulse" />
                        <HeroSlider />
                    </div>
                </div>
            </div>

            {/* User Area */}
            {address && (
                <div className="w-full max-w-7xl mx-auto px-6 flex flex-col items-center">
                    <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-20" />
                    <UserTickets address={address} refreshTrigger={refreshTrigger} />
                </div>
            )}

            {/* Footer */}
            <footer className="mt-32 w-full max-w-7xl mx-auto p-10 border-t border-white/5 flex flex-col items-center gap-8 text-center relative z-10">
                <div className="space-y-4 flex flex-col items-center">
                    <div className="flex items-center gap-2">
                        <img src="/logo.png" className="w-6 h-6 object-contain mix-blend-lighten" alt="RonHub" />
                        <span className="text-sm font-black uppercase tracking-tighter">RonHub</span>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">
                            © 2026 RonHub. All rights reserved.
                        </p>
                        <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest leading-loose max-w-md mx-auto">
                            18+ Only. Every entry is independently verifiable on the Ronin blockchain to ensure total transparency.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
