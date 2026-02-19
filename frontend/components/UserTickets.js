import { useState, useEffect } from 'react';
import { getExplorerUrl } from '@/utils/ronin';
import { ExternalLink, Hash } from 'lucide-react';

export default function UserTickets({ address, refreshTrigger }) {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (address) {
            fetchTickets();
        } else {
            setTickets([]);
        }
    }, [address, refreshTrigger]);

    const fetchTickets = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tickets?wallet=${address}`);
            const data = await res.json();
            setTickets(data.tickets || []);
        } catch (err) {
            console.error("Fetch tickets error:", err);
        } finally {
            setLoading(false);
        }
    };

    if (!address) return null;

    return (
        <div className="w-full max-w-2xl mt-12">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-black uppercase tracking-widest text-white/80">Your Tickets</h3>
                <span className="glass px-3 py-1 rounded-full text-xs font-bold border border-white/5 text-ronhub-light-blue">
                    {tickets.length} {tickets.length === 1 ? 'Ticket' : 'Tickets'} Total
                </span>
            </div>

            {loading && tickets.length === 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-pulse">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-24 glass rounded-2xl" />
                    ))}
                </div>
            ) : tickets.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {tickets.map((ticket) => (
                        <div
                            key={ticket.id}
                            className="group relative glass p-4 rounded-2xl border border-white/5 hover:border-ronhub-blue/50 transition-all duration-300 hover:-translate-y-1"
                        >
                            <div className="flex flex-col items-center gap-2">
                                <Hash className="text-ronhub-light-blue opacity-50" size={14} />
                                <span className="text-xl font-black text-white">#{ticket.id}</span>
                                <a
                                    href={getExplorerUrl(ticket.tx_hash, process.env.NEXT_PUBLIC_RONIN_RPC_URL.includes('saigon'))}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[10px] text-white/30 hover:text-ronhub-light-blue flex items-center gap-1 font-bold uppercase tracking-widest transition-colors"
                                >
                                    Verify <ExternalLink size={10} />
                                </a>
                            </div>

                            {/* Card Glint Shimmer */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 rounded-2xl" />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="glass p-12 rounded-3xl border border-dashed border-white/10 text-center">
                    <p className="text-white/40 font-medium italic">You haven't purchased any tickets yet.</p>
                </div>
            )}
        </div>
    );
}
