-- Create function to send booking inbox messages
CREATE OR REPLACE FUNCTION public.send_booking_inbox_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  customer_profile_id uuid;
  message_subject text;
  message_body text;
  message_type text;
  service_name text;
  booking_date text;
  booking_time text;
BEGIN
  -- Get the customer's profile_id (inbox_messages uses profile_id as user_id)
  customer_profile_id := NEW.customer_id;
  
  -- Format date and time
  booking_date := to_char(NEW.appointment_date, 'DD Mon YYYY');
  booking_time := to_char(NEW.appointment_time, 'HH24:MI');
  
  -- Get service name if available
  SELECT name INTO service_name FROM services WHERE id = NEW.service_id;
  IF service_name IS NULL THEN
    service_name := 'your service';
  END IF;

  -- Handle INSERT (new booking)
  IF TG_OP = 'INSERT' THEN
    message_type := 'booking_confirmation';
    message_subject := 'Booking Confirmed - ' || NEW.reference_number;
    message_body := 'Your booking for ' || service_name || ' on ' || booking_date || ' at ' || booking_time || ' has been confirmed. Reference: ' || NEW.reference_number || '. We look forward to seeing you!';
    
    INSERT INTO inbox_messages (user_id, message_type, subject, body)
    VALUES (customer_profile_id, message_type, message_subject, message_body);
    
    RETURN NEW;
  END IF;

  -- Handle UPDATE
  IF TG_OP = 'UPDATE' THEN
    -- Check if status changed to cancelled
    IF NEW.status = 'cancelled' AND (OLD.status IS NULL OR OLD.status != 'cancelled') THEN
      message_type := 'booking_cancellation';
      message_subject := 'Booking Cancelled - ' || NEW.reference_number;
      message_body := 'Your booking for ' || service_name || ' on ' || booking_date || ' at ' || booking_time || ' has been cancelled.';
      
      IF NEW.cancellation_reason IS NOT NULL AND NEW.cancellation_reason != '' THEN
        message_body := message_body || ' Reason: ' || NEW.cancellation_reason;
      END IF;
      
      INSERT INTO inbox_messages (user_id, message_type, subject, body)
      VALUES (customer_profile_id, message_type, message_subject, message_body);
      
    -- Check if booking was amended (date, time, or service changed)
    ELSIF (OLD.appointment_date != NEW.appointment_date 
           OR OLD.appointment_time != NEW.appointment_time 
           OR OLD.service_id IS DISTINCT FROM NEW.service_id) THEN
      message_type := 'booking_amendment';
      message_subject := 'Booking Updated - ' || NEW.reference_number;
      message_body := 'Your booking (Reference: ' || NEW.reference_number || ') has been updated. New appointment: ' || service_name || ' on ' || booking_date || ' at ' || booking_time || '.';
      
      INSERT INTO inbox_messages (user_id, message_type, subject, body)
      VALUES (customer_profile_id, message_type, message_subject, message_body);
    END IF;
    
    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger for new bookings
DROP TRIGGER IF EXISTS on_booking_created ON bookings;
CREATE TRIGGER on_booking_created
  AFTER INSERT ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION send_booking_inbox_message();

-- Create trigger for booking updates (cancellations and amendments)
DROP TRIGGER IF EXISTS on_booking_updated ON bookings;
CREATE TRIGGER on_booking_updated
  AFTER UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION send_booking_inbox_message();