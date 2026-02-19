-- ─── Tickets table ──────────────────────────────────────────────────
CREATE TABLE tickets (
  id            INTEGER PRIMARY KEY,         -- Ticket ID (1-10,000)
  buyer_address TEXT NOT NULL,               -- Ronin address (0x...)
  tx_hash       TEXT NOT NULL UNIQUE,        -- Tx hash (prevents duplicates)
  created_at    TIMESTAMPTZ DEFAULT NOW()    -- Auto timestamp
);

-- ─── Row Level Security ──────────────────────────────────────────────
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

-- Anyone can read tickets (public transparency)
CREATE POLICY "Public Read Access" ON tickets FOR SELECT USING (true);

-- Only service role (backend) can insert
CREATE POLICY "Service Insert Only" ON tickets FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- ─── Index for fast wallet queries ───────────────────────────────────
CREATE INDEX idx_tickets_buyer ON tickets(buyer_address);

-- ─── Raffle state table (stores winner after draw) ───────────────────
CREATE TABLE raffle_state (
  id               SERIAL PRIMARY KEY,
  winner_ticket_id INTEGER,
  winner_address   TEXT,
  winner_tx_hash   TEXT,
  drawn_at         TIMESTAMPTZ,
  is_complete      BOOLEAN DEFAULT FALSE
);

ALTER TABLE raffle_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read State" ON raffle_state FOR SELECT USING (true);
