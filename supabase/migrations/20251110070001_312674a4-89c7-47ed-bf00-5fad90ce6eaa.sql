-- Insert sample hairdresser records for existing profiles
INSERT INTO hairdressers (profile_id, bio, specializations, experience_years, hourly_rate, salon_id, is_available)
VALUES
  ('0a6a65ab-779a-401d-8df6-57d49435bf00', 'Specialist in natural hair care and protective styling. Over 8 years experience in braids, locs, and twists.', ARRAY['Braids', 'Natural Hair', 'Protective Styles', 'Locs'], 8, 350, '13ff40f1-dc5d-4e4b-a168-7185391fd424', true),
  ('62159895-d794-4107-b9a5-62d84d2b187c', 'Expert colorist and stylist with a passion for creative transformations. Specializing in balayage and ombre techniques.', ARRAY['Hair Coloring', 'Balayage', 'Ombre', 'Styling'], 6, 400, '13ff40f1-dc5d-4e4b-a168-7185391fd424', true)
ON CONFLICT DO NOTHING;

-- Get the hairdresser IDs for inserting services
DO $$
DECLARE
  hairdresser_portia_id uuid;
  hairdresser_sechaba_id uuid;
BEGIN
  -- Get hairdresser IDs
  SELECT id INTO hairdresser_portia_id FROM hairdressers WHERE profile_id = '0a6a65ab-779a-401d-8df6-57d49435bf00';
  SELECT id INTO hairdresser_sechaba_id FROM hairdressers WHERE profile_id = '62159895-d794-4107-b9a5-62d84d2b187c';

  -- Insert services for Portia (Natural Hair Specialist)
  IF hairdresser_portia_id IS NOT NULL THEN
    INSERT INTO services (hairdresser_id, name, description, price, duration_minutes, is_active)
    VALUES
      (hairdresser_portia_id, 'Box Braids', 'Classic box braids with synthetic or natural hair', 800, 240, true),
      (hairdresser_portia_id, 'Cornrows', 'Traditional cornrow styling in various patterns', 450, 120, true),
      (hairdresser_portia_id, 'Senegalese Twists', 'Elegant rope twists that last for weeks', 750, 180, true),
      (hairdresser_portia_id, 'Locs Maintenance', 'Retwist and maintenance for existing locs', 350, 90, true),
      (hairdresser_portia_id, 'Natural Hair Treatment', 'Deep conditioning and treatment for natural hair', 280, 60, true),
      (hairdresser_portia_id, 'Wash and Style', 'Natural hair wash, detangle, and styling', 320, 75, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- Insert services for Sechaba (Color & Style Expert)
  IF hairdresser_sechaba_id IS NOT NULL THEN
    INSERT INTO services (hairdresser_id, name, description, price, duration_minutes, is_active)
    VALUES
      (hairdresser_sechaba_id, 'Balayage', 'Hand-painted highlights for a natural look', 950, 180, true),
      (hairdresser_sechaba_id, 'Full Color', 'Complete hair color transformation', 820, 150, true),
      (hairdresser_sechaba_id, 'Ombre', 'Gradient color from dark to light', 880, 170, true),
      (hairdresser_sechaba_id, 'Root Touch Up', 'Cover regrowth and refresh your color', 420, 60, true),
      (hairdresser_sechaba_id, 'Cut & Style', 'Professional haircut with blow dry and style', 380, 60, true),
      (hairdresser_sechaba_id, 'Keratin Treatment', 'Smoothing treatment for frizz-free hair', 1200, 210, true),
      (hairdresser_sechaba_id, 'Updo Styling', 'Elegant updo for special occasions', 550, 90, true)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;