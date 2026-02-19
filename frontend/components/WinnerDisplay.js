import { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, ExternalLink } from 'lucide-react';
import { truncateAddress, getExplorerUrl } from '@/utils/ronin';

export default function WinnerDisplay({ winner, isTestnet }) {
    useEffect(() => {
        if (winner) {
            // Fire confetti on first reveal
            const duration = 5 * 1000;
            const animationEnd = Date.now() + duration;
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

            const randomInRange = (min, max) => Math.random() * (max - min) + min;

            const interval = setInterval(() => {
                const timeLeft = animationEnd - Date.now();

                if (timeLeft <= 0) {
                    return clearInterval(interval);
                }

                const particleCount = 50 * (timeLeft / duration);
                confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
                confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
            }, 250);

            return () => clearInterval(interval);
        }
    }, [winner]);

    if (!winner) return null;

    return (
        <div className="w-full max-w-md glass p-8 rounded-3xl border-2 border-yellow-500/50 shadow-[0_0_50px_rgba(234,179,8,0.2)] text-center animate-bounce-slow">
            <div className="w-16 h-16 bg-yellow-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg rotate-3">
                <Trophy size={32} className="text-ronhub-dark" />
            </div>

            <h3 className="text-yellow-500 text-xs font-black uppercase tracking-[0.3em] mb-2">We Have a Winner!</h3>
            <h2 className="text-4xl font-black text-white mb-6 uppercase tracking-tighter">
                Ticket <span className="text-yellow-500 text-5xl">#{winner.ticketNumber}</span>
            </h2>

            <div className="space-y-4">
                <div className="glass px-4 py-3 rounded-xl border border-white/10">
                    <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-1">Winning Wallet</p>
                    <p className="text-sm font-mono font-bold text-white tracking-tight">{winner.wallet}</p>
                </div>

                <a
                    href={getExplorerUrl(winner.txHash, isTestnet)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-ronhub-light-blue hover:text-white transition-colors"
                >
                    Verify Selection <ExternalLink size={14} />
                </a>
            </div>

            <style jsx>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 4s ease-in-out infinite;
        }
      `}</style>
        </div>
    );
}
