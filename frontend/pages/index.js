import { useState } from 'react';
import HeroSlider from '@/components/HeroSlider';
import RaffleInfo from '@/components/RaffleInfo';
import WalletButton from '@/components/WalletButton';
import BuyTicketButton from '@/components/BuyTicketButton';
import UserTickets from '@/components/UserTickets';

export default function Home() {
    const [address, setAddress] = useState(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const handlePurchaseSuccess = (ticketNumber) => {
        // Increment trigger to refresh UserTickets
        setRefreshTrigger(prev => prev + 1);
    };

    return (
        <div className="flex flex-col items-center min-h-screen pb-24">
            {/* Header / Navbar */}
            <header className="w-full max-w-7xl flex items-center justify-between p-6 md:p-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-ronhub-blue flex items-center justify-center shadow-[0_0_15px_rgba(29,78,216,0.5)]">
                        <span className="text-xl font-black italic">R</span>
                    </div>
                    <h1 className="text-xl font-black uppercase tracking-tighter hidden sm:block">
                        RonHub <span className="text-ronhub-light-blue">Raffle</span>
                    </h1>
                </div>

                <WalletButton onAddressChange={setAddress} />
            </header>

            {/* Hero Section */}
            <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center px-6 mt-4">
                {/* Left: 3D Showcase */}
                <div className="order-2 lg:order-1">
                    <HeroSlider />
                </div>

                {/* Right: Info & Action */}
                <div className="order-1 lg:order-2 space-y-8 flex flex-col items-center lg:items-start text-center lg:text-left">
                    <div className="space-y-4">
                        <span className="glass px-4 py-1.5 rounded-full text-xs font-bold border border-ronhub-blue/20 text-ronhub-light-blue uppercase tracking-widest">
                            Exclusive 1st Edition Raffle
                        </span>
                        <h2 className="text-4xl md:text-6xl font-black leading-tight">
                            Win the <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-ronhub-light-blue to-ronhub-blue">
                                {process.env.NEXT_PUBLIC_RAFFLE_PRIZE || "BGS 7.5 1st Edition Charizard"}
                            </span>
                        </h2>
                        <p className="text-white/60 text-lg max-w-md font-medium">
                            Join the Ronin ecosystem's most prestigious raffle. Collect your tickets and secure your chance to own a piece of history.
                        </p>
                    </div>

                    <RaffleInfo />

                    <div className="w-full max-w-md">
                        <BuyTicketButton
                            address={address}
                            onPurchaseSuccess={handlePurchaseSuccess}
                        />
                    </div>
                </div>
            </div>

            {/* User Area */}
            {address && (
                <div className="w-full max-w-7xl px-6 flex flex-col items-center">
                    <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-12" />
                    <UserTickets address={address} refreshTrigger={refreshTrigger} />
                </div>
            )}

            {/* Footer */}
            <footer className="mt-24 text-center space-y-6 px-6">
                <p className="text-[10px] text-white/20 font-bold uppercase tracking-[0.2em] max-w-2xl mx-auto leading-loose">
                    This raffle is for entertainment purposes. Participants must be 18+. Verifiable on-chain data on Ronin. Odds depend on total tickets sold. Void where prohibited by law.
                </p>
                <div className="flex items-center justify-center gap-6 text-[10px] font-black uppercase tracking-widest text-white/40">
                    <a href="#" className="hover:text-ronhub-light-blue transition-colors">Terms</a>
                    <a href="#" className="hover:text-ronhub-light-blue transition-colors">Privacy</a>
                    <a href="#" className="hover:text-ronhub-light-blue transition-colors">Support</a>
                </div>
            </footer>
        </div>
    );
}
