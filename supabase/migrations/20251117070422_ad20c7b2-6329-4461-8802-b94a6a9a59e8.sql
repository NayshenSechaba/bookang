-- Create notification types enum
CREATE TYPE public.notification_type AS ENUM (
  'booking_confirmation',
  'cancellation_alert',
  'review_request',
  'new_review',
  'booking_modification',
  'system_alert'
);

-- Create message templates table
CREATE TABLE public.message_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name TEXT NOT NULL UNIQUE,
  notification_type public.notification_type NOT NULL,
  subject TEXT NOT NULL,
  body_template TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_type TEXT NOT NULL CHECK (user_type IN ('SME', 'Customer', 'Employee')),
  recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  notification_type public.notification_type NOT NULL,
  subject TEXT NOT NULL,
  message_body TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  booking_reference TEXT,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL
);

-- Create inbox table
CREATE TABLE public.inbox_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message_type TEXT NOT NULL CHECK (message_type IN ('Internal', 'System')),
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  is_archived BOOLEAN DEFAULT FALSE,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inbox_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for message_templates
CREATE POLICY "Everyone can view message templates"
  ON public.message_templates
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Super users can manage templates"
  ON public.message_templates
  FOR ALL
  TO authenticated
  USING (has_employee_role(auth.uid(), 'super_user'::employee_role));

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications"
  ON public.notifications
  FOR SELECT
  TO authenticated
  USING (recipient_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can update their own notifications"
  ON public.notifications
  FOR UPDATE
  TO authenticated
  USING (recipient_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  ))
  WITH CHECK (recipient_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Employees can create notifications"
  ON public.notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (
    has_employee_role(auth.uid(), 'employee'::employee_role) OR 
    has_employee_role(auth.uid(), 'super_user'::employee_role)
  );

-- RLS Policies for inbox_messages
CREATE POLICY "Users can view their own inbox messages"
  ON public.inbox_messages
  FOR SELECT
  TO authenticated
  USING (user_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can manage their own inbox messages"
  ON public.inbox_messages
  FOR ALL
  TO authenticated
  USING (user_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  ));

-- Create indexes for performance
CREATE INDEX idx_notifications_recipient_id ON public.notifications(recipient_id);
CREATE INDEX idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX idx_inbox_messages_user_id ON public.inbox_messages(user_id);
CREATE INDEX idx_inbox_messages_is_read ON public.inbox_messages(is_read);

-- Insert default message templates
INSERT INTO public.message_templates (template_name, notification_type, subject, body_template) VALUES
  ('booking_confirmation', 'booking_confirmation', 'Booking Confirmed - {booking_reference}', 
   'Your booking has been confirmed.\n\nBooking Reference: {booking_reference}\nDate: {appointment_date}\nTime: {appointment_time}\nService: {service_name}\n\nWe look forward to serving you!\n\nData processed in compliance with the South African POPIA Act.'),
  
  ('cancellation_alert', 'cancellation_alert', 'Booking Cancelled - {booking_reference}',
   'Your booking has been cancelled.\n\nBooking Reference: {booking_reference}\nOriginal Date: {appointment_date}\nOriginal Time: {appointment_time}\n\nIf you did not request this cancellation, please contact us immediately.\n\nData processed in compliance with the South African POPIA Act.'),
  
  ('review_request', 'review_request', 'How was your experience?',
   'Thank you for choosing our service!\n\nWe would love to hear about your experience. Your feedback helps us improve and helps other customers make informed decisions.\n\nYour review will be displayed publicly on our profile.\n\nThis is optional - you can choose whether or not to leave a review.\n\nData processed in compliance with the South African POPIA Act.'),
  
  ('new_review', 'new_review', 'New Review Received',
   'You have received a new review from {customer_name}.\n\nRating: {rating}/5\nComment: {comment}\n\nYou can view and respond to this review in your dashboard.\n\nData processed in compliance with the South African POPIA Act.'),
  
  ('booking_modification', 'booking_modification', 'Booking Modified - {booking_reference}',
   'Your booking has been modified.\n\nBooking Reference: {booking_reference}\nNew Date: {appointment_date}\nNew Time: {appointment_time}\n\nPlease contact us if you have any questions.\n\nData processed in compliance with the South African POPIA Act.');

-- Create trigger for updating timestamps
CREATE TRIGGER update_message_templates_updated_at
  BEFORE UPDATE ON public.message_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_inbox_messages_updated_at
  BEFORE UPDATE ON public.inbox_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();