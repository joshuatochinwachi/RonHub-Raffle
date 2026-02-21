const { ethers } = require('ethers');
const path = require('path');
require('dotenv').config();

/**
 * Verifies a completed USDC transfer on Ronin
 * @param {string} txHash - The transaction hash to verify
 * @param {string} vaultAddress - The recipient address (Vault)
 * @param {string} usdcContract - The USDC contract address
 * @param {number} quantity - Number of tickets being purchased
 * @returns {Promise<boolean>}
 */
async function verifyRoninTransaction(txHash, vaultAddress, usdcContract, quantity = 1) {
    const provider = new ethers.JsonRpcProvider(process.env.RONIN_RPC_URL);

    try {
        const receipt = await provider.getTransactionReceipt(txHash);

        if (!receipt) throw new Error('Transaction not found');
        if (receipt.status !== 1) throw new Error('Transaction failed');

        // Parse Transfer event from logs
        const transferIface = new ethers.Interface([
            'event Transfer(address indexed from, address indexed to, uint256 value)'
        ]);

        let transferFound = false;
        for (const log of receipt.logs) {
            if (log.address.toLowerCase() !== usdcContract.toLowerCase()) continue;

            try {
                const parsed = transferIface.parseLog(log);
                const to = parsed.args.to.toLowerCase();
                const value = parsed.args.value;

                // Calculate expected amount based on TICKET_PRICE * quantity (assuming 6 decimals for USDC)
                const ticketPrice = parseInt(process.env.TICKET_PRICE || 2);
                const expectedAmount = BigInt(ticketPrice) * BigInt(quantity) * BigInt(10 ** 6);

                if (to === vaultAddress.toLowerCase() && value === expectedAmount) {
                    transferFound = true;
                    break;
                }
            } catch (e) {
                continue;
            }
        }

        if (!transferFound) throw new Error(`Valid ${parseInt(process.env.TICKET_PRICE || 2) * quantity} USDC transfer not found in transaction`);
        return true;
    } catch (error) {
        console.error('Ronin verification error:', error.message);
        throw error;
    }
}

/**
 * Generates a unique ticket ID with collision retry logic
 * @param {object} supabase - Initialized Supabase client
 * @param {number} maxTickets - Max tickets allowed
 * @returns {Promise<number>}
 */
async function generateUniqueTicketId(supabase, maxTickets = 10000) {
    let attempts = 0;
    while (attempts < 50) {
        const id = Math.floor(Math.random() * maxTickets) + 1;

        // Check if ID exists in Supabase
        const { data, error } = await supabase
            .from('tickets')
            .select('id')
            .eq('id', id)
            .single();

        if (error && error.code === 'PGRST116') {
            // PGRST116 is "JSON object requested, but no rows returned" - ID is available
            return id;
        }

        attempts++;
    }
    throw new Error('Could not generate unique ticket ID after 50 attempts');
}

module.exports = {
    verifyRoninTransaction,
    generateUniqueTicketId
};
