-- Create a demo salon for testing
DO $$
DECLARE
  v_profile_id uuid;
  v_salon_id uuid;
  v_hairdresser_id uuid;
BEGIN
  -- Get current user's profile (or create a demo one if needed)
  SELECT id INTO v_profile_id FROM profiles WHERE email = 'sechabamagatikele@gmail.com' LIMIT 1;
  
  -- Create a demo salon
  INSERT INTO salons (
    name, 
    description, 
    address, 
    phone, 
    email,
    owner_id,
    latitude,
    longitude,
    location
  ) VALUES (
    'Glamour Studio',
    'Professional hair salon offering cuts, coloring, and styling services',
    '123 Main Street, Johannesburg, 2000',
    '+27 11 123 4567',
    'info@glamourstudio.co.za',
    v_profile_id,
    -26.2041,
    28.0473,
    'Johannesburg CBD'
  ) RETURNING id INTO v_salon_id;

  -- Create a demo hairdresser profile
  INSERT INTO hairdressers (
    profile_id,
    salon_id,
    bio,
    specializations,
    experience_years,
    hourly_rate,
    is_available
  ) VALUES (
    v_profile_id,
    v_salon_id,
    'Professional hairstylist with over 10 years of experience specializing in modern cuts and color treatments',
    ARRAY['Haircuts', 'Hair Coloring', 'Styling', 'Treatments'],
    10,
    250.00,
    true
  ) RETURNING id INTO v_hairdresser_id;

  -- Create demo services
  INSERT INTO services (hairdresser_id, name, description, duration_minutes, price, is_active) VALUES
    (v_hairdresser_id, 'Haircut & Blow Dry', 'Professional haircut with styling and blow dry', 60, 250.00, true),
    (v_hairdresser_id, 'Hair Coloring - Full', 'Complete hair coloring service with premium products', 180, 850.00, true),
    (v_hairdresser_id, 'Highlights', 'Partial or full highlights to brighten your look', 120, 650.00, true),
    (v_hairdresser_id, 'Deep Conditioning Treatment', 'Intensive hair treatment for damaged hair', 45, 300.00, true),
    (v_hairdresser_id, 'Bridal Styling', 'Complete bridal hair styling package', 90, 500.00, true),
    (v_hairdresser_id, 'Keratin Treatment', 'Smoothing keratin treatment for frizz-free hair', 150, 1200.00, true);

  RAISE NOTICE 'Demo data created successfully: Salon ID %, Hairdresser ID %', v_salon_id, v_hairdresser_id;
END $$;