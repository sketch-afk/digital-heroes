-- Enable RLS for charities
ALTER TABLE charities ENABLE ROW LEVEL SECURITY;

-- Charities are viewable by everyone
CREATE POLICY "Charities are viewable by everyone" ON charities FOR SELECT USING (true);

-- Enable RLS for other tables if needed, but for now we just need charities for signup
-- Enable RLS for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles are viewable by the user who owns them
CREATE POLICY "Profiles are viewable by user" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Profiles can be updated by user" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Subscriptions are viewable by the user
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Subscriptions are viewable by user" ON subscriptions FOR SELECT USING (auth.uid() = user_id);

-- Scores are viewable and manageable by the user
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Scores are viewable by user" ON scores FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Scores can be inserted by user" ON scores FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Scores can be updated by user" ON scores FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Scores can be deleted by user" ON scores FOR DELETE USING (auth.uid() = user_id);

-- Charity Events are viewable by everyone
ALTER TABLE charity_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Events are viewable by everyone" ON charity_events FOR SELECT USING (true);
