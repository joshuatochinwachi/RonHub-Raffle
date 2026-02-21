import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { ShoppingCart, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

const USDC_ABI = [
    'function transfer(address to, uint256 amount) returns (bool)',
    'function balanceOf(address account) view returns (uint256)',
    'function decimals() view returns (uint8)'
];

export default function BuyTicketButton({ address, onPurchaseSuccess }) {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(''); // 'checking', 'awaiting', 'confirming', 'registering'
    const [error, setError] = useState(null);
    const [balance, setBalance] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [magneticPos, setMagneticPos] = useState({ x: 0, y: 0 });

    // Fetch balance when address changes
    useEffect(() => {
        if (address) {
            fetchBalance();
        } else {
            setBalance(null);
        }
    }, [address]);

    const fetchBalance = async () => {
        try {
            const provider = new ethers.BrowserProvider(window.ronin.provider);
            const usdc = new ethers.Contract(
                process.env.NEXT_PUBLIC_USDC_CONTRACT,
                USDC_ABI,
                provider
            );
            const rawBalance = await usdc.balanceOf(address);
            const formatted = ethers.formatUnits(rawBalance, 6);
            setBalance(formatted);
        } catch (err) {
            console.error("Balance fetch error:", err);
        }
    };

    const handleBuy = async () => {
        if (!address) return;

        setLoading(true);
        setError(null);

        try {
            setStatus('awaiting');
            const provider = new ethers.BrowserProvider(window.ronin.provider);
            const signer = await provider.getSigner();
            const usdc = new ethers.Contract(
                process.env.NEXT_PUBLIC_USDC_CONTRACT,
                USDC_ABI,
                signer
            );

            const ticketPrice = parseFloat(process.env.NEXT_PUBLIC_TICKET_PRICE || '2');
            const totalUSDCAmount = (ticketPrice * quantity).toString();
            const amount = ethers.parseUnits(totalUSDCAmount, 6);

            // Double check balance
            const currentBalance = await usdc.balanceOf(address);
            if (currentBalance < amount) {
                throw new Error(`Insufficient USDC balance. You need at least ${totalUSDCAmount} USDC.`);
            }

            // 1. Send Transfer
            const tx = await usdc.transfer(process.env.NEXT_PUBLIC_VAULT_WALLET, amount);

            setStatus('confirming');
            // 2. Wait for confirmation
            const receipt = await tx.wait(1);

            setStatus('registering');
            // 3. Register with backend
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/buy-ticket`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    buyerAddress: address,
                    txHash: receipt.hash,
                    quantity: quantity
                })
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Failed to register ticket');

            setStatus('success');
            onPurchaseSuccess?.(data.ticketNumbers?.[0]);
            fetchBalance(); // Update balance

            // Auto-clear success after 5s
            setTimeout(() => setStatus(''), 5000);

        } catch (err) {
            console.error("Purchase error:", err);
            setError(err.message || 'Transaction failed');
            setStatus('');
        } finally {
            setLoading(false);
        }
    };

    const handleMagneticMove = (e) => {
        const btn = e.currentTarget;
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        setMagneticPos({ x: x * 0.2, y: y * 0.2 });
    };

    const resetMagnetic = () => setMagneticPos({ x: 0, y: 0 });

    if (!address) {
        return (
            <div className="w-full text-center p-4 glass rounded-2xl border border-white/5">
                <p className="text-white/60 text-sm font-medium">Connect your Ronin Wallet to buy tickets</p>
            </div>
        );
    }

    const ticketPrice = parseFloat(process.env.NEXT_PUBLIC_TICKET_PRICE || '2');
    const totalCost = (ticketPrice * quantity).toFixed(2);
    const isLowBalance = balance !== null && parseFloat(balance) < (ticketPrice * quantity);


    return (
        <div className="w-full space-y-6">
            {/* Quantity Selector Section */}
            <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Quantity</span>
                </div>

                <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 flex items-center justify-between glass rounded-2xl p-2 border border-white/5">
                        <button
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            disabled={quantity <= 1 || loading}
                            className="w-12 h-12 rounded-xl flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 transition-all active:scale-90 disabled:opacity-20"
                        >
                            <span className="text-2xl font-black">−</span>
                        </button>

                        <div className="text-center">
                            <span className="text-3xl font-black text-white font-display leading-none">{quantity}</span>
                            <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest mt-1">Tickets</p>
                        </div>

                        <button
                            onClick={() => setQuantity(quantity + 1)}
                            disabled={loading}
                            className="w-12 h-12 rounded-xl flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 transition-all active:scale-90"
                        >
                            <span className="text-2xl font-black">+</span>
                        </button>
                    </div>

                    <div className="flex flex-col items-end pr-2">
                        <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-1">Total Cost</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-black text-white font-display">${totalCost}</span>
                            <span className="text-xs font-bold text-ronhub-light-blue">USDC</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Price Summary & Wallet Info */}
            <div className="flex justify-between items-center px-4">
                <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Your Balance</span>
                    <span className={`text-sm font-black ${isLowBalance ? 'text-red-400' : 'text-ronhub-light-blue'}`}>
                        {balance ? `${parseFloat(balance).toFixed(2)} USDC` : 'Loading...'}
                    </span>
                </div>
                {isLowBalance && (
                    <div className="flex items-center gap-1.5 text-red-500 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">
                        <AlertCircle size={12} />
                        <span className="text-[10px] font-bold uppercase tracking-tighter">Low Balance</span>
                    </div>
                )}
            </div>

            {/* Main Button */}
            <button
                onClick={handleBuy}
                onMouseMove={handleMagneticMove}
                onMouseLeave={resetMagnetic}
                disabled={loading || isLowBalance || status === 'success'}
                style={{ transform: `translate(${magneticPos.x}px, ${magneticPos.y}px)` }}
                className={`w-full relative overflow-hidden py-6 rounded-3xl font-black uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-4 transition-all duration-300 isolate group ${status === 'success'
                    ? 'bg-green-500/10 text-green-400 border border-green-500/20 shadow-[0_0_40px_rgba(34,197,94,0.1)]'
                    : 'bg-ronhub-blue hover:bg-ronhub-electric text-white shadow-[0_20px_40px_rgba(29,78,216,0.3)] hover:shadow-[0_25px_50px_rgba(59,130,246,0.5)] active:scale-[0.98] active:translate-y-1'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
                {/* Internal Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite] pointer-events-none" />

                {loading ? (
                    <>
                        <Loader2 className="animate-spin" size={20} />
                        <span className="font-display">
                            {status === 'awaiting' && 'Approve in Wallet'}
                            {status === 'confirming' && 'Confirming...'}
                            {status === 'registering' && 'Finalizing...'}
                        </span>
                    </>
                ) : status === 'success' ? (
                    <>
                        <CheckCircle2 size={20} className="animate-bounce" />
                        <span className="font-display">Tickets Secured</span>
                    </>
                ) : (
                    <>
                        <ShoppingCart size={20} className="group-hover:scale-125 group-hover:rotate-12 transition-all duration-300" />
                        <span className="font-display tracking-[0.1em]">Claim {quantity} Ticket{quantity > 1 ? 's' : ''}</span>
                    </>
                )}
            </button>

            {/* Error Message */}
            {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
                    <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={16} />
                    <p className="text-xs text-red-400 font-medium leading-relaxed">{error}</p>
                </div>
            )}

            {/* Status Legend */}
            {loading && (
                <p className="text-[10px] text-center text-white/40 font-bold uppercase tracking-widest animate-pulse">
                    Do not close this window until transaction is complete
                </p>
            )}
        </div>
    );
}
