-- Create user roles enum
CREATE TYPE public.user_role AS ENUM ('customer', 'hairdresser', 'salon_owner');

-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  role user_role NOT NULL DEFAULT 'customer',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create salons table for salon businesses
CREATE TABLE public.salons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  description TEXT,
  avatar_url TEXT,
  business_hours JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create hairdressers table
CREATE TABLE public.hairdressers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  salon_id UUID REFERENCES public.salons(id) ON DELETE SET NULL,
  specializations TEXT[],
  bio TEXT,
  experience_years INTEGER,
  hourly_rate DECIMAL(10,2),
  portfolio_images TEXT[],
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create services table
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hairdresser_id UUID REFERENCES public.hairdressers(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create bookings table with unique reference
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_number TEXT UNIQUE NOT NULL DEFAULT 'BK' || UPPER(SUBSTRING(gen_random_uuid()::TEXT, 1, 8)),
  customer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  hairdresser_id UUID REFERENCES public.hairdressers(id) ON DELETE CASCADE NOT NULL,
  service_id UUID REFERENCES public.services(id) ON DELETE CASCADE NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  duration_minutes INTEGER NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'no_show')),
  special_requests TEXT,
  cancellation_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create invoices table
CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL,
  invoice_number TEXT UNIQUE NOT NULL DEFAULT 'INV' || UPPER(SUBSTRING(gen_random_uuid()::TEXT, 1, 8)),
  amount DECIMAL(10,2) NOT NULL,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
  due_date DATE,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create notification preferences table
CREATE TABLE public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  email_confirmations BOOLEAN DEFAULT true,
  sms_confirmations BOOLEAN DEFAULT false,
  email_reminders BOOLEAN DEFAULT true,
  sms_reminders BOOLEAN DEFAULT false,
  reminder_hours INTEGER DEFAULT 24 CHECK (reminder_hours IN (12, 24, 48)),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hairdressers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for salons
CREATE POLICY "Salon owners can manage their salons" ON public.salons
  FOR ALL USING (owner_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Everyone can view salons" ON public.salons
  FOR SELECT USING (true);

-- RLS Policies for hairdressers
CREATE POLICY "Hairdressers can manage their own data" ON public.hairdressers
  FOR ALL USING (profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Everyone can view hairdressers" ON public.hairdressers
  FOR SELECT USING (true);

-- RLS Policies for services
CREATE POLICY "Hairdressers can manage their services" ON public.services
  FOR ALL USING (hairdresser_id IN (SELECT id FROM public.hairdressers WHERE profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())));

CREATE POLICY "Everyone can view services" ON public.services
  FOR SELECT USING (is_active = true);

-- RLS Policies for bookings
CREATE POLICY "Users can view their own bookings" ON public.bookings
  FOR SELECT USING (
    customer_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()) OR
    hairdresser_id IN (SELECT id FROM public.hairdressers WHERE profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()))
  );

CREATE POLICY "Customers can create bookings" ON public.bookings
  FOR INSERT WITH CHECK (customer_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Hairdressers can update their bookings" ON public.bookings
  FOR UPDATE USING (hairdresser_id IN (SELECT id FROM public.hairdressers WHERE profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())));

-- RLS Policies for invoices
CREATE POLICY "Related parties can view invoices" ON public.invoices
  FOR SELECT USING (
    booking_id IN (
      SELECT id FROM public.bookings WHERE 
      customer_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()) OR
      hairdresser_id IN (SELECT id FROM public.hairdressers WHERE profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()))
    )
  );

-- RLS Policies for notification preferences
CREATE POLICY "Users can manage their notification preferences" ON public.notification_preferences
  FOR ALL USING (profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'customer'::user_role)
  );
  
  -- Create default notification preferences
  INSERT INTO public.notification_preferences (profile_id)
  VALUES ((SELECT id FROM public.profiles WHERE user_id = NEW.id));
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add update triggers for tables with updated_at columns
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_salons_updated_at
  BEFORE UPDATE ON public.salons
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_hairdressers_updated_at
  BEFORE UPDATE ON public.hairdressers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();