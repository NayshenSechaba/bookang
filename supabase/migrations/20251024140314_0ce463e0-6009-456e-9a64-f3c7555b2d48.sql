-- Create blocked_times table for hairdressers to block calendar slots
CREATE TABLE public.blocked_times (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  hairdresser_id UUID NOT NULL REFERENCES public.hairdressers(id) ON DELETE CASCADE,
  blocked_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.blocked_times ENABLE ROW LEVEL SECURITY;

-- Hairdressers can view their own blocked times
CREATE POLICY "Hairdressers can view their blocked times"
ON public.blocked_times
FOR SELECT
USING (
  hairdresser_id IN (
    SELECT id FROM public.hairdressers
    WHERE profile_id IN (
      SELECT id FROM public.profiles
      WHERE user_id = auth.uid()
    )
  )
);

-- Hairdressers can insert their own blocked times
CREATE POLICY "Hairdressers can insert their blocked times"
ON public.blocked_times
FOR INSERT
WITH CHECK (
  hairdresser_id IN (
    SELECT id FROM public.hairdressers
    WHERE profile_id IN (
      SELECT id FROM public.profiles
      WHERE user_id = auth.uid()
    )
  )
);

-- Hairdressers can update their own blocked times
CREATE POLICY "Hairdressers can update their blocked times"
ON public.blocked_times
FOR UPDATE
USING (
  hairdresser_id IN (
    SELECT id FROM public.hairdressers
    WHERE profile_id IN (
      SELECT id FROM public.profiles
      WHERE user_id = auth.uid()
    )
  )
);

-- Hairdressers can delete their own blocked times
CREATE POLICY "Hairdressers can delete their blocked times"
ON public.blocked_times
FOR DELETE
USING (
  hairdresser_id IN (
    SELECT id FROM public.hairdressers
    WHERE profile_id IN (
      SELECT id FROM public.profiles
      WHERE user_id = auth.uid()
    )
  )
);

-- Customers can view blocked times (to prevent booking during blocked periods)
CREATE POLICY "Everyone can view blocked times for availability checking"
ON public.blocked_times
FOR SELECT
USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_blocked_times_updated_at
BEFORE UPDATE ON public.blocked_times
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better query performance
CREATE INDEX idx_blocked_times_hairdresser_date 
ON public.blocked_times(hairdresser_id, blocked_date);