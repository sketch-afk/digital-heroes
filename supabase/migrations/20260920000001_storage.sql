-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('winner-proofs', 'winner-proofs', false) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('charity-media', 'charity-media', true) ON CONFLICT (id) DO NOTHING;

-- RLS for winner-proofs
-- Subscribers can INSERT their own proofs
CREATE POLICY "Users can upload their own proofs" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
    bucket_id = 'winner-proofs' AND 
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Subscribers can READ their own proofs
CREATE POLICY "Users can view their own proofs" ON storage.objects
FOR SELECT TO authenticated
USING (
    bucket_id = 'winner-proofs' AND 
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Admin can read all proofs (Bypass RLS via Service Role is used in API, but keeping an admin policy is good)
CREATE POLICY "Admins can view all proofs" ON storage.objects
FOR SELECT TO authenticated
USING (
    bucket_id = 'winner-proofs' AND 
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- RLS for charity-media (Public reads, Admin writes)
CREATE POLICY "Public can view charity media" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'charity-media');

CREATE POLICY "Admins can upload charity media" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
    bucket_id = 'charity-media' AND 
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
