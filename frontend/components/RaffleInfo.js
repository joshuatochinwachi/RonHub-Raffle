import { useState, useEffect } from 'react';
import { Clock, Ticket, Trophy } from 'lucide-react';

export default function RaffleInfo() {
    const [info, setInfo] = useState(null);
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

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

            setTimeLeft({
                days,
                hours,
                minutes: mins,
                seconds: secs
            });
        };

        calculateTime();
        const timer = setInterval(calculateTime, 1000);
        return () => clearInterval(timer);
    }, [info]);

    if (!info) return (
        <div className="w-full max-w-2xl glass p-8 rounded-3xl animate-pulse h-48" />
    );

    const progress = (info.totalTickets / info.maxTickets) * 100;

    return (
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tickets Sold */}
            <div className="glass-card p-6 rounded-3xl flex flex-col justify-between group hover:border-ronhub-blue/30 transition-all duration-500">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Sold</span>
                    <div className="w-8 h-8 rounded-xl bg-ronhub-blue/10 flex items-center justify-center text-ronhub-light-blue group-hover:scale-110 transition-transform">
                        <Ticket size={14} />
                    </div>
                </div>
                <div className="space-y-1">
                    <p className="text-4xl font-black text-white font-display">
                        {(info?.totalTickets || 0).toLocaleString()}
                    </p>
                    <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">
                        Tickets Entered
                    </p>
                </div>
            </div>

            {/* Time Remaining */}
            <div className="glass-card p-6 rounded-3xl flex flex-col justify-between group hover:border-ronhub-blue/30 transition-all duration-500">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Ending</span>
                    <div className="w-8 h-8 rounded-xl bg-ronhub-blue/10 flex items-center justify-center text-ronhub-light-blue group-hover:animate-spin">
                        <Clock size={14} />
                    </div>
                </div>
                <div className="space-y-1">
                    <p className="text-2xl font-black text-white font-display tabular-nums leading-none">
                        {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m
                    </p>
                    <p className="text-xl font-black text-ronhub-light-blue/80 font-display tabular-nums">
                        {timeLeft.seconds}s
                    </p>
                </div>
            </div>

            {/* Progress Bar - Spans full width */}
            <div className="md:col-span-2 mt-4 glass-card p-8 rounded-3xl space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="px-3 py-1 bg-ronhub-blue/20 rounded-lg border border-ronhub-blue/30">
                            <span className="text-[10px] font-black text-ronhub-light-blue uppercase tracking-widest">
                                {progress > 0 && progress < 1 ? progress.toFixed(2) : Math.round(progress)}% Filled
                            </span>
                        </div>
                    </div>
                    <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.3em]">
                        Raffle Inventory: {(info?.maxTickets || 10000).toLocaleString()} Max
                    </span>
                </div>

                <div className="relative h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <div
                        className="absolute h-full bg-gradient-to-r from-ronhub-blue to-ronhub-light-blue transition-all duration-1000 ease-out flex items-center justify-end px-1"
                        style={{ width: `${Math.min(100, progress)}%` }}
                    >
                        <div className="w-1 h-full bg-white/40 blur-[2px]" />
                    </div>
                </div>
            </div>
        </div>
    );
}
