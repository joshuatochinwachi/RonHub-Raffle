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

            const amount = ethers.parseUnits(process.env.NEXT_PUBLIC_TICKET_PRICE || '2', 6);

            // Double check balance
            const currentBalance = await usdc.balanceOf(address);
            if (currentBalance < amount) {
                throw new Error(`Insufficient USDC balance. You need at least ${process.env.NEXT_PUBLIC_TICKET_PRICE || '2'} USDC.`);
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
                    txHash: receipt.hash
                })
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Failed to register ticket');

            setStatus('success');
            onPurchaseSuccess?.(data.ticketNumber);
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

    if (!address) {
        return (
            <div className="w-full text-center p-4 glass rounded-2xl border border-white/5">
                <p className="text-white/60 text-sm font-medium">Connect your Ronin Wallet to buy tickets</p>
            </div>
        );
    }

    const ticketPrice = parseFloat(process.env.NEXT_PUBLIC_TICKET_PRICE || '2');
    const isLowBalance = balance !== null && parseFloat(balance) < ticketPrice;

    return (
        <div className="w-full space-y-4">
            {/* Wallet Summary */}
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
                disabled={loading || isLowBalance || status === 'success'}
                className={`w-full relative overflow-hidden py-4 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all duration-300 ${status === 'success'
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'bg-ronhub-blue hover:bg-ronhub-electric text-white shadow-[0_10px_30px_rgba(29,78,216,0.3)] hover:-translate-y-1'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
                {loading ? (
                    <>
                        <Loader2 className="animate-spin" size={20} />
                        <span>
                            {status === 'awaiting' && 'Approve in Wallet...'}
                            {status === 'confirming' && 'Confirming On-Chain...'}
                            {status === 'registering' && 'Registering Ticket...'}
                        </span>
                    </>
                ) : status === 'success' ? (
                    <>
                        <CheckCircle2 size={20} />
                        <span>Success! Ticket Purchased</span>
                    </>
                ) : (
                    <>
                        <ShoppingCart size={20} />
                        <span>Buy Ticket — ${process.env.NEXT_PUBLIC_TICKET_PRICE || '2'} USDC</span>
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
