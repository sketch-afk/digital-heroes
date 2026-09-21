-- Seed Charities
INSERT INTO charities (id, name, slug, description, is_featured, is_active) VALUES
('11111111-1111-1111-1111-111111111111', 'Golf Foundation', 'golf-foundation', 'Supporting young golfers and promoting the sport.', true, true),
('22222222-2222-2222-2222-222222222222', 'Wildlife Trust', 'wildlife-trust', 'Protecting native wildlife and restoring natural habitats.', true, true),
('33333333-3333-3333-3333-333333333333', 'Cancer Research UK', 'cancer-research-uk', 'Funding vital research into the prevention and treatment of cancer.', false, true)
ON CONFLICT (id) DO NOTHING;
