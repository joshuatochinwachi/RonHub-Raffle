import { useState, useEffect } from 'react';
import { Clock, Ticket, Trophy } from 'lucide-react';

export default function RaffleInfo() {
    const [info, setInfo] = useState(null);
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        const fetchInfo = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/raffle-info`);
                const data = await res.json();
                setInfo(data);
            } catch (err) {
                console.error("Fetch raffle info error:", err);
            }
        };

        fetchInfo();
        const interval = setInterval(fetchInfo, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (!info?.endDate) return;

        const calculateTime = () => {
            const end = new Date(info.endDate).getTime();
            const now = new Date().getTime();
            const diff = end - now;

            if (diff <= 0) {
                setTimeLeft('RAFFLE ENDED');
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const secs = Math.floor((diff % (1000 * 60)) / 1000);

            setTimeLeft(`${days}d ${hours}h ${mins}m ${secs}s`);
        };

        calculateTime();
        const timer = setInterval(calculateTime, 1000);
        return () => clearInterval(timer);
    }, [info]);

    if (!info) return (
        <div className="w-full max-w-2xl glass p-8 rounded-3xl animate-pulse h-48" />
    );

    const progress = Math.max(5, (info.totalTickets / info.maxTickets) * 100);

    return (
        <div className="w-full max-w-2xl glass p-8 rounded-3xl border border-white/5 shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                {/* Stat 1: Tickets Sold */}
                <div className="flex flex-col items-center md:items-start">
                    <div className="flex items-center gap-2 text-ronhub-light-blue mb-2">
                        <Ticket size={18} />
                        <span className="text-xs font-bold uppercase tracking-widest">Tickets Sold</span>
                    </div>
                    <p className="text-3xl font-black text-white">{(info?.totalTickets || 0).toLocaleString()}</p>
                </div>

                {/* Stat 2: Time Remaining */}
                <div className="flex flex-col items-center md:items-start">
                    <div className="flex items-center gap-2 text-ronhub-light-blue mb-2">
                        <Clock size={18} />
                        <span className="text-xs font-bold uppercase tracking-widest">Ending In</span>
                    </div>
                    <p className="text-xl font-black text-white font-mono">{timeLeft}</p>
                </div>

                {/* Stat 3: Ticket Price */}
                <div className="flex flex-col items-center md:items-start">
                    <div className="flex items-center gap-2 text-ronhub-light-blue mb-2">
                        <Trophy size={18} />
                        <span className="text-xs font-bold uppercase tracking-widest">Prize Value</span>
                    </div>
                    <p className="text-xl font-black text-white">{info.priceDisplay}</p>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="relative">
                <div className="flex justify-between text-xs font-bold mb-3 uppercase tracking-wider">
                    <span className="text-ronhub-light-blue">Raffle Progress</span>
                    <span className="text-white">{Math.floor(progress)}% Filled</span>
                </div>
                <div className="h-4 w-full bg-white/5 rounded-full overflow-hidden border border-white/10 p-1">
                    <div
                        className="h-full bg-gradient-to-r from-ronhub-blue to-ronhub-light-blue rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(29,78,216,0.5)]"
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <div className="flex justify-between mt-2 text-[10px] text-white/40 font-bold uppercase tracking-tighter">
                    <span>0 Sold</span>
                    <span>{(info?.maxTickets || 10000).toLocaleString()} Max</span>
                </div>
            </div>
        </div>
    );
}
