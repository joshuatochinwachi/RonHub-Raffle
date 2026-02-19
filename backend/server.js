const express = require('express');
const cors = require('cors');
const { rateLimit } = require('express-rate-limit');
const crypto = require('crypto');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const { isValidAddress, isValidTxHash } = require('./utils/validation');
const { supabase } = require('./utils/supabase');
const { verifyRoninTransaction, generateUniqueTicketId } = require('./utils/ronin.js');

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Middleware ──────────────────────────────────────────────────────
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000'
}));
app.use(express.json());

// ─── Rate Limiting ───────────────────────────────────────────────────
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});

const drawLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 5, // Limit draw attempts to 5 per minute
    message: 'Draw attempts capped. Please wait.'
});

// ─── Helper: Auth Middleware ─────────────────────────────────────────
const authenticateAdmin = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || authHeader !== `Bearer ${process.env.ADMIN_SECRET_KEY}`) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
};

// ─── Endpoints ───────────────────────────────────────────────────────
app.get('/', (req, res) => {
    res.json({
        status: 'online',
        message: 'RonHub Raffle Backend is running',
        version: '1.0.0',
        endpoints: {
            public: [
                { path: '/api/raffle-info', method: 'GET', description: 'Fetch current raffle statistics and winner state' },
                { path: '/api/tickets', method: 'GET', description: 'List all tickets (optional: ?wallet=0x...)' },
                { path: '/api/buy-ticket', method: 'POST', description: 'Register a ticket after on-chain USDC transfer' }
            ],
            admin: [
                { path: '/api/draw-winner', method: 'POST', description: 'Securely draw the raffle winner (Requires Admin Secret Key)' }
            ]
        },
        documentation: 'https://github.com/joshuatochinwachi/RonHub-Raffle'
    });
});

/**
 * GET /api/raffle-info
 * Returns current raffle state
 */
app.get('/api/raffle-info', async (req, res) => {
    try {
        // Get total tickets sold
        const { count, error: countError } = await supabase
            .from('tickets')
            .select('*', { count: 'exact', head: true });

        if (countError) throw countError;

        // Get winner if exists
        const { data: raffleState, error: stateError } = await supabase
            .from('raffle_state')
            .select('*')
            .order('id', { ascending: false })
            .limit(1)
            .single();

        let winner = null;
        if (raffleState && raffleState.winner_address) {
            winner = {
                ticketNumber: raffleState.winner_ticket_id,
                wallet: raffleState.winner_address,
                txHash: raffleState.winner_tx_hash,
                drawnAt: raffleState.drawn_at
            };
        }

        const info = {
            prize: process.env.RAFFLE_PRIZE || "BGS 7.5 First Edition Charizard",
            priceDisplay: process.env.RAFFLE_VALUE_DISPLAY || "£19,299.00",
            ticketPrice: parseInt(process.env.TICKET_PRICE || 2),
            currency: "USDC",
            totalTickets: count || 0,
            maxTickets: parseInt(process.env.MAX_TICKETS || 10000),
            endDate: process.env.RAFFLE_END_DATE,
            isActive: new Date() < new Date(process.env.RAFFLE_END_DATE) && !winner,
            winner
        };

        res.json(info);
    } catch (error) {
        console.error('Raffle info error:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

/**
 * GET /api/tickets
 * Returns tickets, optionally filtered by wallet
 */
app.get('/api/tickets', async (req, res) => {
    const { wallet } = req.query;

    try {
        let query = supabase.from('tickets').select('*');
        if (wallet) {
            if (!isValidAddress(wallet)) {
                return res.status(400).json({ error: 'Invalid wallet address format' });
            }
            query = query.eq('buyer_address', wallet.toLowerCase());
        }

        const { data, error } = await query.order('created_at', { ascending: false });
        if (error) throw error;

        res.json({
            totalTickets: data.length,
            tickets: data.map(t => ({
                id: t.id,
                buyer_address: t.buyer_address,
                tx_hash: t.tx_hash,
                created_at: t.created_at
            }))
        });
    } catch (error) {
        console.error('Tickets fetch error:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

/**
 * POST /api/buy-ticket
 * Registers a ticket after verifying on-chain USDC transfer
 */
app.post('/api/buy-ticket', apiLimiter, async (req, res) => {
    const { buyerAddress, txHash } = req.body;

    // 1. Validate inputs
    if (!isValidAddress(buyerAddress) || !isValidTxHash(txHash)) {
        return res.status(400).json({ error: 'Invalid address or transaction hash format' });
    }

    try {
        // 2. Check if txHash already used
        const { data: existing } = await supabase
            .from('tickets')
            .select('tx_hash')
            .eq('tx_hash', txHash)
            .single();

        if (existing) {
            return res.status(409).json({ error: 'Transaction hash already used' });
        }

        // 3. Verify on-chain transaction
        await verifyRoninTransaction(
            txHash,
            process.env.VAULT_WALLET,
            process.env.USDC_CONTRACT
        );

        // 4. Generate unique ticket ID
        const ticketId = await generateUniqueTicketId(supabase, parseInt(process.env.MAX_TICKETS || 10000));

        // 5. Store in Supabase
        const { error: insertError } = await supabase
            .from('tickets')
            .insert({
                id: ticketId,
                buyer_address: buyerAddress.toLowerCase(),
                tx_hash: txHash
            });

        if (insertError) throw insertError;

        // 6. Get updated count
        const { count } = await supabase
            .from('tickets')
            .select('*', { count: 'exact', head: true });

        res.json({
            success: true,
            message: 'Ticket registered successfully!',
            ticketNumber: ticketId,
            totalTickets: count,
            txHash: txHash
        });

    } catch (error) {
        console.error('Buy ticket error:', error.message);
        const status = error.message.includes('not found') || error.message.includes('failed') || error.message.includes('not found in transaction') ? 400 : 500;
        res.status(status).json({ error: error.message });
    }
});

/**
 * POST /api/draw-winner
 * Randomly selects a winner from all sold tickets (Admin Only)
 */
app.post('/api/draw-winner', authenticateAdmin, drawLimiter, async (req, res) => {
    try {
        // 1. Check if raffle is over
        if (new Date() < new Date(process.env.RAFFLE_END_DATE)) {
            return res.status(400).json({ error: 'Raffle has not ended yet' });
        }

        // 2. Check if winner already drawn
        const { data: existingState } = await supabase
            .from('raffle_state')
            .select('*')
            .eq('is_complete', true)
            .single();

        if (existingState) {
            return res.status(400).json({ error: 'Winner has already been drawn' });
        }

        // 3. Fetch all tickets
        const { data: allTickets, error: fetchError } = await supabase
            .from('tickets')
            .select('*');

        if (fetchError) throw fetchError;
        if (!allTickets || allTickets.length === 0) {
            return res.status(400).json({ error: 'No tickets sold' });
        }

        // 4. Secure random draw
        const winnerIndex = crypto.randomInt(0, allTickets.length);
        const winningTicket = allTickets[winnerIndex];

        // 5. Save winner state
        const { error: stateError } = await supabase
            .from('raffle_state')
            .insert({
                winner_ticket_id: winningTicket.id,
                winner_address: winningTicket.buyer_address,
                winner_tx_hash: winningTicket.tx_hash,
                drawn_at: new Date().toISOString(),
                is_complete: true
            });

        if (stateError) throw stateError;

        res.json({
            success: true,
            winner: {
                ticketNumber: winningTicket.id,
                wallet: winningTicket.buyer_address,
                txHash: winningTicket.tx_hash,
                drawnAt: new Date().toISOString()
            },
            totalTickets: allTickets.length
        });

    } catch (error) {
        console.error('Draw winner error:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// ─── Start Server ────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`RonHub Raffle Backend running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
});
