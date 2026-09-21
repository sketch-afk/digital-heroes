-- Create custom enums
CREATE TYPE user_role AS ENUM ('subscriber', 'admin');
CREATE TYPE subscription_plan AS ENUM ('monthly', 'yearly');
CREATE TYPE subscription_status AS ENUM ('active', 'past_due', 'cancelled', 'lapsed', 'inactive');
CREATE TYPE draw_mode AS ENUM ('random', 'algorithmic');
CREATE TYPE draw_status AS ENUM ('draft', 'simulated', 'published');
CREATE TYPE winner_verification_status AS ENUM ('pending_proof', 'submitted', 'approved', 'rejected');
CREATE TYPE payment_status AS ENUM ('pending', 'paid');
CREATE TYPE donation_status AS ENUM ('pending', 'succeeded', 'failed');

-- Profiles
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'subscriber',
    charity_id UUID, -- FK to charities added later
    charity_percent INTEGER NOT NULL DEFAULT 10 CHECK (charity_percent >= 10 AND charity_percent <= 100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Charities
CREATE TABLE charities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    image_urls TEXT[],
    is_featured BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add charity FK to profiles
ALTER TABLE profiles ADD CONSTRAINT fk_profiles_charity FOREIGN KEY (charity_id) REFERENCES charities(id);

-- Subscriptions
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    plan subscription_plan,
    status subscription_status NOT NULL DEFAULT 'inactive',
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN NOT NULL DEFAULT false,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Payments
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    stripe_invoice_id TEXT UNIQUE NOT NULL,
    gross_amount INTEGER NOT NULL,
    currency TEXT NOT NULL DEFAULT 'INR',
    prize_pool_amount INTEGER NOT NULL,
    charity_amount INTEGER NOT NULL,
    charity_percent_applied INTEGER NOT NULL,
    platform_amount INTEGER NOT NULL,
    paid_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Prize Pool Ledger
CREATE TABLE prize_pool_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
    draw_month DATE NOT NULL,
    amount INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Scores
CREATE TABLE scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    score_date DATE NOT NULL,
    stableford_score SMALLINT NOT NULL CHECK (stableford_score >= 1 AND stableford_score <= 45),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, score_date)
);

-- Charity Events
CREATE TABLE charity_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    charity_id UUID NOT NULL REFERENCES charities(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    event_date DATE NOT NULL,
    location TEXT,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Charity Contributions
CREATE TABLE charity_contributions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    charity_id UUID NOT NULL REFERENCES charities(id) ON DELETE CASCADE,
    payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    percent INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Donations (Independent)
CREATE TABLE donations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    charity_id UUID NOT NULL REFERENCES charities(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    stripe_payment_intent_id TEXT UNIQUE,
    status donation_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Draws
CREATE TABLE draws (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    draw_month DATE NOT NULL UNIQUE,
    mode draw_mode NOT NULL,
    status draw_status NOT NULL DEFAULT 'draft',
    winning_numbers SMALLINT[5],
    active_subscriber_count INTEGER NOT NULL DEFAULT 0,
    pool_total INTEGER NOT NULL DEFAULT 0,
    jackpot_carried_in INTEGER NOT NULL DEFAULT 0,
    published_at TIMESTAMPTZ,
    published_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    config JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Draw Tiers
CREATE TABLE draw_tiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    draw_id UUID NOT NULL REFERENCES draws(id) ON DELETE CASCADE,
    match_type SMALLINT NOT NULL CHECK (match_type IN (3, 4, 5)),
    share_pct INTEGER NOT NULL,
    tier_pool INTEGER NOT NULL DEFAULT 0,
    rollover_in INTEGER NOT NULL DEFAULT 0,
    winners_count INTEGER NOT NULL DEFAULT 0,
    per_winner_amount INTEGER NOT NULL DEFAULT 0,
    rolled_over_out INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Draw Entries
CREATE TABLE draw_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    draw_id UUID NOT NULL REFERENCES draws(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    scores_snapshot SMALLINT[] NOT NULL,
    matched_count SMALLINT NOT NULL DEFAULT 0,
    tier SMALLINT,
    UNIQUE (draw_id, user_id)
);

-- Draw Simulations
CREATE TABLE draw_simulations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    draw_id UUID NOT NULL REFERENCES draws(id) ON DELETE CASCADE,
    mode draw_mode NOT NULL,
    numbers SMALLINT[] NOT NULL,
    result JSONB NOT NULL,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Winners
CREATE TABLE winners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    draw_id UUID NOT NULL REFERENCES draws(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    draw_entry_id UUID NOT NULL REFERENCES draw_entries(id) ON DELETE CASCADE,
    match_type SMALLINT NOT NULL,
    prize_amount INTEGER NOT NULL,
    verification_status winner_verification_status NOT NULL DEFAULT 'pending_proof',
    proof_path TEXT,
    admin_notes TEXT,
    reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    payment_status payment_status NOT NULL DEFAULT 'pending',
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Platform Settings
CREATE TABLE platform_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL
);

-- Audit Log
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    diff JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert default platform settings
INSERT INTO platform_settings (key, value) VALUES
('prize_pool_pct', '50'::jsonb),
('min_charity_percent', '10'::jsonb),
('tier_shares', '{"5": 40, "4": 35, "3": 25}'::jsonb),
('number_range', '{"min": 1, "max": 45}'::jsonb);

-- Function: is_admin
CREATE OR REPLACE FUNCTION is_admin() RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role FROM profiles WHERE id = auth.uid();
  RETURN user_role = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: require_active_subscriber
CREATE OR REPLACE FUNCTION is_active_subscriber() RETURNS BOOLEAN AS $$
DECLARE
  sub_status TEXT;
BEGIN
  SELECT status INTO sub_status FROM subscriptions WHERE user_id = auth.uid();
  RETURN sub_status = 'active';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: add_score (keeps only latest 5)
CREATE OR REPLACE FUNCTION add_score(p_user_id UUID, p_score_date DATE, p_score SMALLINT) RETURNS VOID AS $$
BEGIN
    -- Insert the new score (will fail if duplicate date due to UNIQUE constraint)
    INSERT INTO scores (user_id, score_date, stableford_score)
    VALUES (p_user_id, p_score_date, p_score);

    -- Delete anything that is NOT within the latest 5 by score_date
    DELETE FROM scores
    WHERE id IN (
        SELECT id FROM scores
        WHERE user_id = p_user_id
        ORDER BY score_date DESC
        OFFSET 5
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
