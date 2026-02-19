import { useState, useEffect } from 'react';
import { truncateAddress } from '@/utils/ronin';
import { Wallet, LogOut, ChevronDown } from 'lucide-react';

export default function WalletButton({ onAddressChange }) {
    const [address, setAddress] = useState(null);
    const [isConnecting, setIsConnecting] = useState(false);

    useEffect(() => {
        // Check if Ronin Wallet is already connected
        checkConnection();

        // Listen for account changes
        if (window.ronin?.provider) {
            window.ronin.provider.on('accountsChanged', handleAccountsChanged);
            window.ronin.provider.on('chainChanged', (chainId) => {
                const targetChainId = `0x${parseInt(process.env.NEXT_PUBLIC_RONIN_CHAIN_ID || '2020').toString(16)}`;
                if (chainId !== targetChainId) {
                    switchNetwork();
                }
            });
        }

        return () => {
            if (window.ronin?.provider) {
                window.ronin.provider.removeListener('accountsChanged', handleAccountsChanged);
            }
        };
    }, []);

    const handleAccountsChanged = (accounts) => {
        if (accounts.length > 0) {
            setAddress(accounts[0]);
            onAddressChange?.(accounts[0]);
        } else {
            setAddress(null);
            onAddressChange?.(null);
        }
    };

    const checkConnection = async () => {
        if (window.ronin?.provider) {
            try {
                const accounts = await window.ronin.provider.request({ method: 'eth_accounts' });
                if (accounts.length > 0) {
                    setAddress(accounts[0]);
                    onAddressChange?.(accounts[0]);
                }
            } catch (err) {
                console.error("Check connection error:", err);
            }
        }
    };

    const connectWallet = async () => {
        if (!window.ronin) {
            window.open('https://wallet.roninchain.com/', '_blank');
            return;
        }

        setIsConnecting(true);
        try {
            const accounts = await window.ronin.provider.request({
                method: 'eth_requestAccounts'
            });
            handleAccountsChanged(accounts);

            // Verify network after connection
            const chainId = await window.ronin.provider.request({ method: 'eth_chainId' });
            const targetChainId = `0x${parseInt(process.env.NEXT_PUBLIC_RONIN_CHAIN_ID || '2020').toString(16)}`;
            if (chainId !== targetChainId) {
                await switchNetwork();
            }
        } catch (err) {
            console.error("Connection error:", err);
        } finally {
            setIsConnecting(false);
        }
    };

    const switchNetwork = async () => {
        const chainId = `0x${parseInt(process.env.NEXT_PUBLIC_RONIN_CHAIN_ID || '2020').toString(16)}`;
        try {
            await window.ronin.provider.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId }],
            });
        } catch (err) {
            console.error("Switch network error:", err);
        }
    };

    const disconnectWallet = () => {
        setAddress(null);
        onAddressChange?.(null);
        // Note: Ronin Wallet doesn't have a programmatic disconnect, we just clear local state
    };

    if (address) {
        return (
            <div className="relative group">
                <button className="glass px-6 py-2.5 rounded-full flex items-center gap-3 border border-ronhub-blue/30 hover:border-ronhub-blue transition-all duration-300">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="font-mono text-sm tracking-tight">{truncateAddress(address)}</span>
                    <ChevronDown size={16} className="text-ronhub-light-blue" />
                </button>

                {/* Dropdown */}
                <div className="absolute top-full right-0 mt-2 w-48 glass rounded-xl border border-white/10 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 z-50">
                    <button
                        onClick={disconnectWallet}
                        className="w-full px-4 py-3 flex items-center gap-3 text-red-400 hover:bg-white/5 transition-colors rounded-xl"
                    >
                        <LogOut size={16} />
                        <span className="text-sm font-medium">Disconnect</span>
                    </button>
                </div>
            </div>
        );
    }

    return (
        <button
            onClick={connectWallet}
            disabled={isConnecting}
            className={`relative overflow-hidden group px-8 py-3 rounded-full bg-ronhub-blue hover:bg-ronhub-electric text-white font-bold transition-all duration-300 shadow-[0_0_20px_rgba(29,78,216,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] flex items-center gap-2 ${isConnecting ? 'opacity-70' : ''}`}
        >
            <Wallet size={20} className="group-hover:rotate-12 transition-transform" />
            <span>{isConnecting ? 'Connecting...' : 'Connect Ronin Wallet'}</span>

            {/* Glint Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        </button>
    );
}
