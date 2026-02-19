/**
 * Ronin Blockchain Helpers for Frontend
 */

export const truncateAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const getExplorerUrl = (txHash, isTestnet = false) => {
    const baseUrl = isTestnet
        ? "https://saigon-testnet.roninchain.com/tx/"
        : "https://app.roninchain.com/tx/";
    return `${baseUrl}${txHash}`;
};

export const RONIN_CHAIN_ID_MAINNET = "0x7e4"; // 2020
export const RONIN_CHAIN_ID_TESTNET = "0x7e5"; // 2021
