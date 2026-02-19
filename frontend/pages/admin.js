import { useState, useEffect } from 'react';
import Head from 'next/head';
import { Lock, Trophy, Loader2, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AdminPage() {
    const [password, setPassword] = useState('');
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [loading, setLoading] = useState(false);
    const [info, setInfo] = useState(null);
    const [winner, setWinner] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isAuthorized) {
            fetchRaffleInfo();
        }
    }, [isAuthorized]);

    const fetchRaffleInfo = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/raffle-info`);
            const data = await res.json();
            setInfo(data);
            if (data.winner) setWinner(data.winner);
        } catch (err) {
            console.error("Fetch error:", err);
        }
    };

    const handleLogin = (e) => {
        e.preventDefault();
        if (password) {
            setIsAuthorized(true);
        }
    };

    const handleDraw = async () => {
        if (!window.confirm("ARE YOU SURE? This will pick the final winner and close the raffle forever.")) return;

        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/draw-winner`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${password}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Draw failed');

            setWinner(data.winner);
            fetchRaffleInfo(); // Update state
        } catch (err) {
            console.error("Draw error:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!isAuthorized) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6">
                <div className="w-full max-w-sm glass p-8 rounded-3xl border border-white/10">
                    <div className="w-12 h-12 bg-ronhub-blue rounded-xl flex items-center justify-center mb-6 mx-auto">
                        <Lock size={24} />
                    </div>
                    <h1 className="text-xl font-black text-center mb-8 uppercase tracking-widest">Admin Access</h1>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <input
                            type="password"
                            placeholder="Enter Admin Secret Key"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-ronhub-blue outline-none transition-all"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoFocus
                        />
                        <button className="w-full py-3 bg-ronhub-blue hover:bg-ronhub-electric text-white font-bold rounded-xl transition-all uppercase tracking-widest text-xs">
                            Enter Dashboard
                        </button>
                    </form>
                    <Link href="/" className="flex items-center justify-center gap-2 mt-6 text-[10px] text-white/40 uppercase font-black hover:text-white transition-colors">
                        <ArrowLeft size={12} /> Back to Raffle
                    </Link>
                </div>
            </div>
        );
    }

    const isEndDatePassed = info && new Date() >= new Date(info.endDate);

    return (
        <div className="min-h-screen p-6 md:p-12">
            <Head>
                <title>Admin Dashboard | RonHub Raffle</title>
            </Head>

            <div className="max-w-4xl mx-auto space-y-8">
                <header className="flex items-center justify-between">
                    <h1 className="text-3xl font-black uppercase tracking-tighter">
                        Admin <span className="text-ronhub-light-blue">Panel</span>
                    </h1>
                    <button
                        onClick={() => setIsAuthorized(false)}
                        className="text-xs font-bold text-white/40 hover:text-white transition-colors uppercase tracking-widest"
                    >
                        Logout
                    </button>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Raffle Stats */}
                    <div className="glass p-8 rounded-3xl border border-white/5 space-y-6">
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-ronhub-light-blue">Raffle Status</h3>
                        {info ? (
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-white/60">Tickets Sold</span>
                                    <span className="text-xl font-black">{info.totalTickets} / {info.maxTickets}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-white/60">Closing Date</span>
                                    <span className="text-sm font-bold">{new Date(info.endDate).toLocaleString()}</span>
                                </div>
                                <div className="pt-4 border-t border-white/5">
                                    {isEndDatePassed ? (
                                        <div className="flex items-center gap-2 text-green-400">
                                            <CheckCircle2 size={16} />
                                            <span className="text-xs font-bold uppercase">Ready for Draw</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 text-yellow-500">
                                            <Loader2 size={16} className="animate-spin" />
                                            <span className="text-xs font-bold uppercase">Raffle Ongoing</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="animate-pulse h-24 bg-white/5 rounded-xl" />
                        )}
                    </div>

                    {/* Draw Action */}
                    <div className="glass p-8 rounded-3xl border border-white/5 flex flex-col items-center justify-center text-center space-y-6">
                        {winner ? (
                            <>
                                <div className="w-16 h-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center">
                                    <CheckCircle2 size={32} />
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold uppercase tracking-widest text-green-400 mb-1">Winner Found</h4>
                                    <p className="text-3xl font-black">Ticket #{winner.ticketNumber}</p>
                                </div>
                            </>
                        ) : (
                            <>
                                <Trophy size={48} className={`text-white/20 ${isEndDatePassed ? 'text-yellow-500/50' : ''}`} />
                                <div className="space-y-4 w-full">
                                    <button
                                        onClick={handleDraw}
                                        disabled={!isEndDatePassed || loading}
                                        className="w-full py-4 bg-yellow-500 hover:bg-yellow-400 disabled:bg-white/5 disabled:text-white/20 text-ronhub-dark font-black uppercase tracking-widest rounded-2xl transition-all shadow-xl hover:shadow-yellow-500/20 disabled:shadow-none"
                                    >
                                        {loading ? <Loader2 className="animate-spin mx-auto" /> : 'Draw Winner Now'}
                                    </button>
                                    {!isEndDatePassed && (
                                        <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                                            Button will unlock after closing date
                                        </p>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-4">
                        <AlertCircle className="text-red-500" />
                        <p className="text-sm font-medium text-red-400">{error}</p>
                    </div>
                )}

                {/* Participant List (Optional but helpful) */}
                <div className="glass p-8 rounded-3xl border border-white/5">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-ronhub-light-blue mb-6">Recent Tickets</h3>
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-4">
                        {/* We can fetch this from /api/tickets if needed, for now just a note */}
                        <p className="text-xs text-white/40 italic">Check Supabase dashboard for the full verifiable list of {info?.totalTickets || 0} participants.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
