import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, Star, Heart, User, Scissors, MapPin, Phone, Camera, Upload, Wallet } from 'lucide-react';
import CustomAlert from '@/components/CustomAlert';
import PaymentProcessing from './PaymentProcessing';
import ClientWallet from './ClientWallet';
import BookingConfirmation from './BookingConfirmation';
import { NotificationCenter } from './NotificationCenter';
import { InboxView } from './InboxView';
import { supabase } from "@/integrations/supabase/client";
interface CustomerDashboardProps {
  userName: string;
  onNavigate?: (page: string) => void;
}
const CustomerDashboard = ({
  userName,
  onNavigate
}: CustomerDashboardProps) => {
  // Profile state
  const [profilePicture, setProfilePicture] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [showProfileUpload, setShowProfileUpload] = useState(false);
  const [showCoverUpload, setShowCoverUpload] = useState(false);
  const [username, setUsername] = useState('');

  // Currency formatting for South African Rands
  const formatCurrency = (amount: number) => {
    return `R${amount.toFixed(2)}`;
  };

  // Fetch user profile data from database
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const {
          data: user
        } = await supabase.auth.getUser();
        if (user.user) {
          const {
            data: profile
          } = await supabase.from('profiles').select('username, avatar_url, banner_url, phone').eq('user_id', user.user.id).single();
          if (profile) {
            setUsername(profile.username || '');
            if (profile.avatar_url) {
              setProfilePicture(profile.avatar_url);
            }
            if (profile.banner_url) {
              setCoverImage(profile.banner_url);
            }
            // Pre-populate phone number from profile
            if (profile.phone) {
              setBookingData(prev => ({
                ...prev,
                phone: profile.phone
              }));
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
      }
    };
    fetchUserProfile();
  }, []);

  // Name formatting function
  const formatName = (name: string) => {
    if (!name) return '';

    // Split by space and filter out empty strings
    const parts = name.trim().split(/\s+/).filter(part => part.length > 0);

    // Capitalize first letter of each part and make rest lowercase
    const formattedParts = parts.map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase());

    // Join with spaces
    return formattedParts.join(' ');
  };
  // State management for booking flow
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [pendingBooking, setPendingBooking] = useState<any>(null);

  // Booking form state
  const [bookingData, setBookingData] = useState({
    service: '',
    hairdresser: '',
    date: '',
    time: '',
    notes: '',
    phone: ''
  });

  // Review form state
  const [reviewData, setReviewData] = useState({
    rating: 0,
    comment: ''
  });

  // Alert state
  const [alertInfo, setAlertInfo] = useState<{
    show: boolean;
    type: 'success' | 'error' | 'info';
    title: string;
    message: string;
  }>({
    show: false,
    type: 'info',
    title: '',
    message: ''
  });

  // Active tab state for appointments
  const [activeAppointmentsTab, setActiveAppointmentsTab] = useState('upcoming');

  // Test reminder state
  const [sendingReminder, setSendingReminder] = useState(false);
  const [showProvidersModal, setShowProvidersModal] = useState(false);

  // Real data from database
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);
  const [pastAppointments, setPastAppointments] = useState<any[]>([]);
  const [availableServices, setAvailableServices] = useState<any[]>([]);
  const [availableHairdressers, setAvailableHairdressers] = useState<any[]>([]);
  const [salons, setSalons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [blockedTimes, setBlockedTimes] = useState<any[]>([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>(['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM']);

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Geolocation disabled - users will filter by suburb/township instead

  // Fetch real data from database
  useEffect(() => {
    const fetchData = async () => {
      try {
        const {
          data: {
            user
          }
        } = await supabase.auth.getUser();
        if (!user) return;

        // Get current user's profile
        const {
          data: profile
        } = await supabase.from('profiles').select('id').eq('user_id', user.id).single();
        if (!profile) return;

        // Fetch appointments
        const today = new Date().toISOString().split('T')[0];
        const {
          data: upcomingData
        } = await supabase.from('bookings').select(`
            *,
            services(name),
            hairdressers(
              id,
              profiles(full_name)
            ),
            salons!bookings_saloon_foreign(name, address)
          `).eq('customer_id', profile.id).gte('appointment_date', today).order('appointment_date', {
          ascending: true
        });
        const {
          data: pastData
        } = await supabase.from('bookings').select(`
            *,
            services(name),
            hairdressers(
              id,
              profiles(full_name)
            ),
            salons!bookings_saloon_foreign(name, address)
          `).eq('customer_id', profile.id).lt('appointment_date', today).order('appointment_date', {
          ascending: false
        }).limit(10);

        // Fetch salons first
        const {
          data: salonsData
        } = await supabase.from('salons').select('*');

        // Fetch services with hairdresser and salon information
        const {
          data: servicesData
        } = await supabase.from('services').select(`
            *,
            hairdressers!services_hairdresser_id_fkey(
              id,
              profiles(full_name),
              salons!hairdressers_salon_id_fkey(
                name,
                address,
                latitude,
                longitude
              )
            )
          `).eq('is_active', true);

        // Fetch hairdressers with their profiles and salons
        const {
          data: hairdressersData
        } = await supabase.from('hairdressers').select(`
            *,
            profiles(full_name),
            salons!hairdressers_salon_id_fkey(
              name,
              address,
              latitude,
              longitude
            )
          `).eq('is_available', true);

        // Sort by distance if user location is available
        let sortedHairdressers = hairdressersData || [];
        let sortedServices = servicesData || [];
        if (userLocation && hairdressersData) {
          sortedHairdressers = [...hairdressersData].map(h => {
            const salon = h.salons as any;
            return {
              ...h,
              distance: salon?.latitude && salon?.longitude ? calculateDistance(userLocation.lat, userLocation.lng, salon.latitude, salon.longitude) : Infinity
            };
          }).sort((a, b) => a.distance - b.distance);
        }
        if (userLocation && servicesData) {
          sortedServices = [...servicesData].map(s => {
            const salon = (s.hairdressers as any)?.salons;
            return {
              ...s,
              distance: salon?.latitude && salon?.longitude ? calculateDistance(userLocation.lat, userLocation.lng, salon.latitude, salon.longitude) : Infinity
            };
          }).sort((a, b) => a.distance - b.distance);
        }
        setUpcomingAppointments(upcomingData || []);
        setPastAppointments(pastData || []);
        setAvailableServices(sortedServices);
        setAvailableHairdressers(sortedHairdressers);
        setSalons(salonsData || []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Show custom alert
  const showAlert = (type: 'success' | 'error' | 'info', title: string, message: string) => {
    setAlertInfo({
      show: true,
      type,
      title,
      message
    });
  };

  // Convert time from 12-hour to 24-hour format
  const convertTo24Hour = (time: string): string => {
    const [hourMin, period] = time.split(' ');
    let [hour, min] = hourMin.split(':');
    let hourNum = parseInt(hour);
    if (period === 'PM' && hourNum !== 12) {
      hourNum += 12;
    } else if (period === 'AM' && hourNum === 12) {
      hourNum = 0;
    }
    return `${hourNum.toString().padStart(2, '0')}:${min}:00`;
  };

  // Fetch blocked times when hairdresser and date are selected
  useEffect(() => {
    const fetchBlockedTimes = async () => {
      if (!bookingData.hairdresser || !bookingData.date) {
        setAvailableTimeSlots(['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM']);
        return;
      }
      try {
        // Find hairdresser ID
        const selectedHairdresser = availableHairdressers.find(h => (h.profiles?.full_name || 'Provider') === bookingData.hairdresser);
        if (!selectedHairdresser) {
          setAvailableTimeSlots(['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM']);
          return;
        }

        // Fetch blocked times for this hairdresser and date
        const {
          data,
          error
        } = await supabase.from('blocked_times').select('*').eq('hairdresser_id', selectedHairdresser.id).eq('blocked_date', bookingData.date);
        if (error) {
          console.error('Error fetching blocked times:', error);
          setBlockedTimes([]);
          setAvailableTimeSlots(['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM']);
          return;
        }
        setBlockedTimes(data || []);

        // Filter available time slots
        const allSlots = ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'];
        const filteredSlots = allSlots.filter(slot => {
          const slotTime = convertTo24Hour(slot);
          const isBlocked = (data || []).some(blocked => {
            return slotTime >= blocked.start_time && slotTime < blocked.end_time;
          });
          return !isBlocked;
        });
        setAvailableTimeSlots(filteredSlots);

        // Clear selected time if it's no longer available
        if (bookingData.time && !filteredSlots.includes(bookingData.time)) {
          setBookingData(prev => ({
            ...prev,
            time: ''
          }));
        }
      } catch (error) {
        console.error('Error fetching blocked times:', error);
        setBlockedTimes([]);
        setAvailableTimeSlots(['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM']);
      }
    };
    fetchBlockedTimes();
  }, [bookingData.hairdresser, bookingData.date, availableHairdressers]);

  // Handle booking form submission
  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingData.service || !bookingData.hairdresser || !bookingData.date || !bookingData.time) {
      showAlert('error', 'Incomplete Information', 'Please fill in all required fields to book your appointment.');
      return;
    }

    // Validate phone number
    if (!bookingData.phone || bookingData.phone.trim() === '') {
      showAlert('error', 'Phone Required', 'Phone number is required for SMS booking confirmation.');
      return;
    }

    // Validate date is not in the past
    const selectedDate = new Date(bookingData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      showAlert('error', 'Invalid Date', 'Please select a future date for your appointment.');
      return;
    }

    // Check if the selected time is blocked
    const selectedTime = convertTo24Hour(bookingData.time);
    const isBlocked = blockedTimes.some(blocked => {
      return blocked.blocked_date === bookingData.date && selectedTime >= blocked.start_time && selectedTime < blocked.end_time;
    });
    if (isBlocked) {
      showAlert('error', 'Time Unavailable', 'This time slot is not available. Please select a different time.');
      return;
    }

    // Create pending booking for payment
    const selectedHairdresser = availableHairdressers.find(h => h.name === bookingData.hairdresser);
    const serviceCost = bookingData.service === 'Hair Color' ? 150 : bookingData.service === 'Hair Treatment' ? 120 : 75;
    setPendingBooking({
      service: bookingData.service,
      stylist: bookingData.hairdresser,
      date: bookingData.date,
      time: bookingData.time,
      cost: serviceCost,
      salon: selectedHairdresser?.salon || 'Beauty Salon',
      notes: bookingData.notes,
      phone: bookingData.phone
    });
    setShowBookingModal(false);
    setShowPaymentModal(true);
  };

  // Handle payment completion
  const handlePaymentComplete = async (paymentData: any) => {
    showAlert('success', 'Booking Confirmed!', `Your appointment for ${pendingBooking.service} with ${pendingBooking.stylist} has been booked for ${pendingBooking.date} at ${pendingBooking.time}. Payment of R${paymentData.amount.toFixed(2)} processed successfully.`);

    // Save booking to Supabase database
    try {
      const {
        data: user
      } = await supabase.auth.getUser();
      if (!user.user) {
        throw new Error('User not authenticated');
      }

      // Get customer profile ID
      const {
        data: profile
      } = await supabase.from('profiles').select('id, phone').eq('user_id', user.user.id).single();
      if (!profile) {
        throw new Error('Customer profile not found');
      }

      // Update profile with phone if not already set
      if (pendingBooking.phone && (!profile.phone || profile.phone.trim() === '')) {
        await supabase.from('profiles').update({
          phone: pendingBooking.phone
        }).eq('user_id', user.user.id);
      }

      // Find hairdresser by name (for demo purposes, we'll use a mock lookup)
      // In a real app, you'd have hairdresser IDs from the booking form
      const {
        data: hairdresser
      } = await supabase.from('hairdressers').select('id').limit(1).single();

      // Find service by name (for demo purposes, we'll use a mock lookup)
      // In a real app, you'd have service IDs from the booking form
      const {
        data: service
      } = await supabase.from('services').select('id, duration_minutes').limit(1).single();

      // Insert booking into database
      const {
        data: newBooking,
        error: bookingError
      } = await supabase.from('bookings').insert({
        customer_id: profile.id,
        hairdresser_id: hairdresser?.id || null,
        service_id: service?.id || null,
        appointment_date: pendingBooking.date,
        appointment_time: pendingBooking.time,
        duration_minutes: service?.duration_minutes || 60,
        total_price: pendingBooking.cost,
        status: 'pending',
        special_requests: pendingBooking.notes || null,
        customer_phone: pendingBooking.phone || null
      }).select().single();
      if (bookingError) {
        throw bookingError;
      }
      console.log('Booking saved to Supabase successfully');

      // Send booking confirmation SMS
      if (newBooking) {
        try {
          const {
            error: smsError
          } = await supabase.functions.invoke('send-booking-confirmation', {
            body: {
              booking_id: newBooking.id
            }
          });
          if (smsError) {
            console.error('Failed to send confirmation SMS:', smsError);
          } else {
            console.log('Confirmation SMS sent successfully');
          }
        } catch (smsError) {
          console.error('Error sending confirmation SMS:', smsError);
        }
      }
    } catch (error) {
      console.error('Failed to save booking to Supabase:', error);
      // Don't show error to user as booking is still successful
    }

    // Send booking data to webhook
    try {
      const webhookData = {
        booking_id: `BK_${Date.now()}`,
        timestamp: new Date().toISOString(),
        customer_name: userName,
        service: pendingBooking.service,
        stylist: pendingBooking.stylist,
        appointment_date: pendingBooking.date,
        appointment_time: pendingBooking.time,
        cost: pendingBooking.cost,
        salon: pendingBooking.salon,
        notes: pendingBooking.notes,
        payment_details: {
          payment_id: paymentData.id,
          method: paymentData.method,
          amount: paymentData.amount,
          currency: paymentData.currency,
          status: paymentData.status,
          transaction_fee: paymentData.transactionFee,
          net_amount: paymentData.netAmount
        },
        booking_source: 'website'
      };
      await fetch('https://n8n.srv962284.hstgr.cloud/webhook-test/3f69f86e-0768-4251-b329-31961067d2bb', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        mode: 'no-cors',
        body: JSON.stringify(webhookData)
      });
    } catch (error) {
      console.error('Failed to send booking data to n8n webhook:', error);
      // Don't show error to user as booking is still successful
    }

    // Send notification to Zapier webhook
    try {
      const notificationData = {
        booking_id: `BK_${Date.now()}`,
        timestamp: new Date().toISOString(),
        customer_name: userName,
        service: pendingBooking.service,
        stylist: pendingBooking.stylist,
        appointment_date: pendingBooking.date,
        appointment_time: pendingBooking.time,
        cost: pendingBooking.cost,
        salon: pendingBooking.salon,
        status: 'pending',
        notification_type: 'new_booking'
      };
      await fetch('https://hooks.zapier.com/hooks/catch/23327911/uhiph2z/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        mode: 'no-cors',
        body: JSON.stringify(notificationData)
      });
    } catch (error) {
      console.error('Failed to send notification to Zapier webhook:', error);
      // Don't show error to user as booking is still successful
    }
    setBookingData({
      service: '',
      hairdresser: '',
      date: '',
      time: '',
      notes: '',
      phone: ''
    });
    setPendingBooking(null);

    // Show additional success message with View Appointments option
    setTimeout(() => {
      showAlert('info', 'Appointment Created!', 'Your appointment has been added to your schedule. You can view and manage all your appointments in the "My Appointments" section.');
    }, 3000);
  };

  // Test appointment reminder function
  const handleTestReminder = async () => {
    try {
      setSendingReminder(true);
      showAlert('info', 'Sending Test Reminder', 'Testing the appointment reminder SMS...');
      const {
        data,
        error
      } = await supabase.functions.invoke('send-appointment-reminders', {
        body: {}
      });
      if (error) throw error;
      console.log('Reminder test result:', data);
      if (data.success) {
        const processedCount = data.results?.length || 0;
        const successCount = data.results?.filter((r: any) => r.success).length || 0;
        showAlert('success', 'Test Complete!', `Processed ${processedCount} reminder(s). Successfully sent ${successCount} SMS message(s). Check your phone!`);
      } else {
        showAlert('error', 'Test Failed', data.message || 'Failed to send test reminder');
      }
    } catch (error) {
      console.error('Error testing reminder:', error);
      showAlert('error', 'Error', 'Failed to test appointment reminder. Check console for details.');
    } finally {
      setSendingReminder(false);
    }
  };

  // Handle review submission
  const handleReviewSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (reviewData.rating === 0) {
      showAlert('error', 'Rating Required', 'Please provide a rating for your appointment.');
      return;
    }
    if (!selectedAppointment) {
      showAlert('error', 'Error', 'No appointment selected');
      return;
    }
    try {
      const {
        data: user
      } = await supabase.auth.getUser();
      if (!user.user) {
        throw new Error('User not authenticated');
      }

      // Get customer profile
      const {
        data: profile
      } = await supabase.from('profiles').select('id').eq('user_id', user.user.id).single();
      if (!profile) {
        throw new Error('Customer profile not found');
      }

      // Validate comment length
      if (reviewData.comment && reviewData.comment.length > 1000) {
        showAlert('error', 'Review Too Long', 'Please keep your review under 1000 characters.');
        return;
      }

      // Check if review already exists
      const {
        data: existingReview
      } = await supabase.from('reviews').select('id').eq('booking_id', selectedAppointment.id).maybeSingle();
      if (existingReview) {
        showAlert('error', 'Already Reviewed', "You've already reviewed this appointment.");
        return;
      }

      // Insert review
      const {
        error
      } = await supabase.from('reviews').insert({
        booking_id: selectedAppointment.id,
        customer_id: profile.id,
        hairdresser_id: selectedAppointment.hairdresser_id,
        rating: reviewData.rating,
        comment: reviewData.comment.trim() || null
      });
      if (error) throw error;
      showAlert('success', 'Review Submitted!', 'Thank you for your feedback! Your review helps other customers and supports businesses.');
      setShowReviewModal(false);
      setReviewData({
        rating: 0,
        comment: ''
      });
      setSelectedAppointment(null);
    } catch (error: any) {
      console.error('Error submitting review:', error);
      showAlert('error', 'Error', 'Failed to submit review. Please try again.');
    }
  };

  // Open review modal for specific appointment
  const openReviewModal = (appointment: any) => {
    setSelectedAppointment(appointment);
    setShowReviewModal(true);
  };

  // Render star rating component
  const StarRating = ({
    rating,
    onRatingChange,
    readonly = false
  }: {
    rating: number;
    onRatingChange?: (rating: number) => void;
    readonly?: boolean;
  }) => {
    return <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map(star => <Star key={star} className={`h-5 w-5 cursor-pointer transition-colors ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} onClick={() => !readonly && onRatingChange && onRatingChange(star)} />)}
      </div>;
  };

  // Handle image uploads
  const handleImageUpload = (type: 'profile' | 'cover') => async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          console.error('Please select an image file.');
          return;
        }

        // Get current user
        const {
          data: {
            user
          }
        } = await supabase.auth.getUser();
        if (!user) {
          throw new Error("User not authenticated");
        }

        // Upload to Supabase Storage
        const fileExt = file.name.split('.').pop();
        const fileName = `${type}-${user.id}-${Date.now()}.${fileExt}`;
        const {
          data: uploadData,
          error: uploadError
        } = await supabase.storage.from('profile-avatars').upload(fileName, file, {
          upsert: true
        });
        if (uploadError) throw uploadError;

        // Get public URL
        const {
          data: {
            publicUrl
          }
        } = supabase.storage.from('profile-avatars').getPublicUrl(fileName);

        // Update profile in database
        const updateField = type === 'profile' ? 'avatar_url' : 'banner_url';
        const {
          error: updateError
        } = await supabase.from('profiles').update({
          [updateField]: publicUrl
        }).eq('user_id', user.id);
        if (updateError) throw updateError;

        // Update local state
        if (type === 'profile') {
          setProfilePicture(publicUrl);
          setShowProfileUpload(false);
        } else {
          setCoverImage(publicUrl);
          setShowCoverUpload(false);
        }
      } catch (error) {
        console.error(`Error uploading ${type} image:`, error);
      }
    }
  };
  const handleImageUrlSubmit = (type: 'profile' | 'cover') => (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const imageUrl = formData.get('imageUrl') as string;
    if (imageUrl.trim()) {
      if (type === 'profile') {
        setProfilePicture(imageUrl.trim());
        setShowProfileUpload(false);
      } else {
        setCoverImage(imageUrl.trim());
        setShowCoverUpload(false);
      }
    }
  };
  return <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Profile Header with Cover Image */}
        <div className="mb-8">
          <div className="relative mb-24 h-48 w-full rounded-lg overflow-hidden">
            <img src={coverImage} alt="Cover" className="w-full h-full object-cover cursor-pointer" onClick={() => setShowCoverUpload(true)} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            
            {/* Cover Image Upload Button */}
            <button onClick={() => setShowCoverUpload(true)} className="absolute top-4 right-4 bg-white/20 backdrop-blur text-white p-2 rounded-full shadow-lg hover:bg-white/30 transition-colors">
              <Camera className="h-4 w-4" />
            </button>
            
            {/* Profile Picture Overlay */}
            <div className="absolute top-0 left-4">
              <div className="relative">
                
                <button onClick={() => setShowProfileUpload(true)} className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors">
                  <Camera className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
          
          {/* Welcome Header */}
          <div className="ml-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {username || formatName(userName)}
            </h1>
            <p className="text-gray-600">Manage your appointments </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white cursor-pointer hover:from-purple-600 hover:to-purple-700 transition-all" onClick={() => {
          document.getElementById('appointments-section')?.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100">Upcoming</p>
                  <p className="text-2xl font-bold">{upcomingAppointments.length}</p>
                </div>
                <Calendar className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-pink-500 to-pink-600 text-white cursor-pointer hover:from-pink-600 hover:to-pink-700 transition-all" onClick={() => {
          setActiveAppointmentsTab('past');
          setTimeout(() => {
            document.getElementById('appointments-section')?.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            });
          }, 50);
        }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-pink-100">Completed</p>
                  <p className="text-2xl font-bold">{pastAppointments.length}</p>
                </div>
                <Scissors className="h-8 w-8 text-pink-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white cursor-pointer hover:from-yellow-600 hover:to-yellow-700 transition-all" onClick={() => {
          document.getElementById('appointments-section')?.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100">Total Bookings</p>
                  <p className="text-2xl font-bold">{upcomingAppointments.length + pastAppointments.length}</p>
                </div>
                
              </div>
            </CardContent>
          </Card>

          

          

          <Card className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white cursor-pointer hover:from-emerald-600 hover:to-emerald-700 transition-all" onClick={() => setShowProvidersModal(true)}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100">Service Providers</p>
                  <p className="text-2xl font-bold">{availableHairdressers.length}</p>
                </div>
                
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Inbox Section */}
            <InboxView />
            
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Book appointments and manage your wallet
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="booking" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="booking">Book Appointment</TabsTrigger>
                    <TabsTrigger value="wallet">Wallet & Payments</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="booking" className="mt-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Button onClick={() => setShowBookingModal(true)} className="flex-1 bg-[#030389]">
                        <Calendar className="mr-2 h-4 w-4" />
                        Book New Appointment
                      </Button>
                      <Button variant="outline" className="flex-1" onClick={() => {
                      if (onNavigate) {
                        onNavigate('appointments');
                        localStorage.setItem('salonconnect_current_page', 'appointments');
                      }
                    }}>
                        <Clock className="mr-2 h-4 w-4" />
                        View All Appointments
                      </Button>
                    </div>
                    
                    {/* Test Reminder Button */}
                    
                  </TabsContent>
                  
                  <TabsContent value="wallet" className="mt-6">
                    <ClientWallet userName={userName} />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Appointments Tabs */}
            <Card id="appointments-section">
              <CardHeader>
                <CardTitle>Your Appointments</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={activeAppointmentsTab} onValueChange={setActiveAppointmentsTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                    <TabsTrigger value="past">Past</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="upcoming" className="space-y-4 mt-6">
                    {loading ? <div className="text-center py-8 text-gray-500">Loading appointments...</div> : upcomingAppointments.length === 0 ? <div className="text-center py-8 text-gray-500">No upcoming appointments</div> : upcomingAppointments.map(appointment => <div key={appointment.id} className="border rounded-lg p-4 bg-white">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="font-semibold text-lg">
                                {appointment.services?.name || 'Service'}
                              </h3>
                              <p className="text-gray-600">
                                with {appointment.hairdressers?.profiles?.full_name || 'Service Provider'}
                              </p>
                            </div>
                            <Badge variant={appointment.status === 'confirmed' ? 'default' : 'secondary'} className={appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' : ''}>
                              {appointment.status}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                            <div className="flex items-center">
                              <Calendar className="mr-2 h-4 w-4" />
                              {appointment.appointment_date}
                            </div>
                            <div className="flex items-center">
                              <Clock className="mr-2 h-4 w-4" />
                              {appointment.appointment_time}
                            </div>
                            <div className="flex items-center">
                              <MapPin className="mr-2 h-4 w-4" />
                              {appointment.salons?.name || 'Salon'}
                            </div>
                            <div className="flex items-center">
                              <span className="font-medium text-purple-600">{formatCurrency(Number(appointment.total_price))}</span>
                            </div>
                          </div>
                        </div>)}
                  </TabsContent>
                  
                  <TabsContent value="past" className="space-y-4 mt-6">
                    {loading ? <div className="text-center py-8 text-gray-500">Loading appointments...</div> : pastAppointments.length === 0 ? <div className="text-center py-8 text-gray-500">No past appointments</div> : pastAppointments.map(appointment => <div key={appointment.id} className="border rounded-lg p-4 bg-white">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="font-semibold text-lg">
                                {appointment.services?.name || 'Service'}
                              </h3>
                              <p className="text-gray-600">
                                with {appointment.hairdressers?.profiles?.full_name || 'Service Provider'}
                              </p>
                            </div>
                            <Badge variant="outline" className="bg-gray-50">
                              {appointment.status}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                            <div className="flex items-center">
                              <Calendar className="mr-2 h-4 w-4" />
                              {appointment.appointment_date}
                            </div>
                            <div className="flex items-center">
                              <Clock className="mr-2 h-4 w-4" />
                              {appointment.appointment_time}
                            </div>
                            <div className="flex items-center">
                              <MapPin className="mr-2 h-4 w-4" />
                              {appointment.salons?.name || 'Salon'}
                            </div>
                            <div className="flex items-center">
                              <span className="font-medium text-purple-600">{formatCurrency(Number(appointment.total_price))}</span>
                            </div>
                          </div>
                          
                          <Button size="sm" variant="outline" onClick={() => openReviewModal(appointment)} className="border-purple-200 text-purple-600 hover:bg-purple-50" disabled={appointment.status !== 'completed'}>
                            <Star className="mr-2 h-4 w-4" />
                            Leave Review
                          </Button>
                        </div>)}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Favorite Service Provider - Only show if have bookings */}
            {pastAppointments.length > 0 && <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Heart className="mr-2 h-5 w-5 text-pink-500" />
                    Recent Service Provider
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <User className="h-8 w-8 text-purple-600" />
                    </div>
                    <h3 className="font-semibold text-lg">
                      {pastAppointments[0]?.hairdressers?.profiles?.full_name || 'Service Provider'}
                    </h3>
                    <p className="text-gray-600 mb-2">
                      {pastAppointments[0]?.salons?.name || 'Salon'}
                    </p>
                    
                    <p className="text-sm text-gray-600 mb-4">
                      {pastAppointments.length} appointment{pastAppointments.length !== 1 ? 's' : ''} completed
                    </p>
                    
                    <Button size="sm" className="w-full bg-purple-600 hover:bg-purple-700" onClick={() => setShowBookingModal(true)}>
                      Book New Appointment
                    </Button>
                  </div>
                </CardContent>
              </Card>}

            {/* Show empty state if no bookings */}
            {pastAppointments.length === 0 && upcomingAppointments.length === 0 && <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="mr-2 h-5 w-5 text-purple-500" />
                    Get Started
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Scissors className="h-8 w-8 text-purple-600" />
                  </div>
                  <p className="text-gray-600 mb-4">
                    You haven't made any bookings yet
                  </p>
                  <Button className="w-full bg-purple-600 hover:bg-purple-700" onClick={() => setShowBookingModal(true)}>
                    Book Your First Appointment
                  </Button>
                </CardContent>
              </Card>}

            {/* Quick Tips */}
            <Card>
              <CardHeader>
                <CardTitle>Tips for Your Next Visit</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p>Book in advance for popular time slots</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p>Bring reference photos for new styles</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p>Arrive 10 minutes early for consultations</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p>Leave reviews to help other customers</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Booking Modal - Mobile Responsive with Scrolling */}
      <Dialog open={showBookingModal} onOpenChange={setShowBookingModal}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Book New Appointment</DialogTitle>
            <DialogDescription>
              Select your preferred service, hairdresser, and time slot
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleBooking} className="space-y-4 max-h-[60vh] overflow-y-auto px-1">
            <div>
              <Label htmlFor="service">Service</Label>
              <Select value={bookingData.service} onValueChange={value => setBookingData(prev => ({
              ...prev,
              service: value
            }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a service" />
                </SelectTrigger>
                <SelectContent>
                  {availableServices.length === 0 ? <SelectItem value="no-services" disabled>No services available</SelectItem> : availableServices.map(service => <SelectItem key={service.id} value={service.name}>
                        <div className="flex items-center justify-between w-full">
                          <span>{service.name} - {formatCurrency(Number(service.price))} ({service.duration_minutes} min)</span>
                          {service.distance && service.distance !== Infinity && <span className="text-xs text-muted-foreground ml-2">
                              {service.distance.toFixed(1)} km away
                            </span>}
                        </div>
                      </SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="hairdresser">Service Provider</Label>
              <Select value={bookingData.hairdresser} onValueChange={value => setBookingData(prev => ({
              ...prev,
              hairdresser: value
            }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a service provider" />
                </SelectTrigger>
                <SelectContent>
                  {availableHairdressers.length === 0 ? <SelectItem value="no-hairdressers" disabled>No service providers available</SelectItem> : availableHairdressers.map(hairdresser => <SelectItem key={hairdresser.id} value={hairdresser.profiles?.full_name || 'Provider'}>
                        <div className="flex items-center justify-between w-full">
                          <div className="flex flex-col">
                            <span>{hairdresser.profiles?.full_name || 'Provider'}</span>
                            <span className="text-xs text-muted-foreground">
                              {hairdresser.salons?.name || 'Salon'}
                            </span>
                          </div>
                          {hairdresser.distance && hairdresser.distance !== Infinity && <span className="text-xs text-muted-foreground ml-2">
                              {hairdresser.distance.toFixed(1)} km
                            </span>}
                        </div>
                      </SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">Date</Label>
                <Input id="date" type="date" value={bookingData.date} onChange={e => setBookingData(prev => ({
                ...prev,
                date: e.target.value
              }))} min={new Date().toISOString().split('T')[0]} />
              </div>
              
              <div>
                <Label htmlFor="time">Time</Label>
                <Select value={bookingData.time} onValueChange={value => setBookingData(prev => ({
                ...prev,
                time: value
              }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTimeSlots.length === 0 ? <SelectItem value="no-times" disabled>No times available</SelectItem> : availableTimeSlots.map(time => <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="notes">Special Requests (Optional)</Label>
              <Textarea id="notes" placeholder="Any special requests or notes for your hairdresser..." value={bookingData.notes} onChange={e => setBookingData(prev => ({
              ...prev,
              notes: e.target.value
            }))} className="resize-none" rows={3} />
            </div>
            
            <div>
              <Label htmlFor="phone">Phone Number (for SMS confirmation) *</Label>
              <Input id="phone" type="tel" placeholder="+27 or 0XX XXX XXXX" value={bookingData.phone} onChange={e => setBookingData(prev => ({
              ...prev,
              phone: e.target.value
            }))} required />
              <p className="text-xs text-muted-foreground mt-1">
                Required for booking confirmation SMS
              </p>
            </div>
            
            <div className="flex gap-4 pt-4">
              <Button type="submit" className="flex-1 bg-purple-600 hover:bg-purple-700">
                Book Appointment
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowBookingModal(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Review Modal */}
      <Dialog open={showReviewModal} onOpenChange={setShowReviewModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Leave a Review</DialogTitle>
            <DialogDescription>
              Share your experience with {selectedAppointment?.hairdresser}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleReviewSubmission} className="space-y-4">
            <div>
              <Label>Rating</Label>
              <div className="mt-2">
                <StarRating rating={reviewData.rating} onRatingChange={rating => setReviewData(prev => ({
                ...prev,
                rating
              }))} />
              </div>
            </div>
            
            <div>
              <Label htmlFor="comment">Your Review (Optional)</Label>
              <Textarea id="comment" placeholder="Share your experience, what you liked, and any suggestions..." value={reviewData.comment} onChange={e => setReviewData(prev => ({
              ...prev,
              comment: e.target.value
            }))} className="resize-none" rows={4} maxLength={1000} />
              <p className="text-xs text-muted-foreground text-right mt-1">
                {reviewData.comment.length}/1000 characters
              </p>
            </div>
            
            <div className="flex gap-4 pt-4">
              <Button type="submit" className="flex-1 bg-purple-600 hover:bg-purple-700">
                Submit Review
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowReviewModal(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Profile Picture Upload Modal */}
      {showProfileUpload && <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Update Profile Picture</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Upload Image File</label>
                <input type="file" accept="image/*" onChange={handleImageUpload('profile')} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              
              <div className="text-center text-sm text-gray-500">or</div>
              
              <form onSubmit={handleImageUrlSubmit('profile')}>
                <label className="block text-sm font-medium mb-2">Image URL</label>
                <input type="url" name="imageUrl" placeholder="https://example.com/image.jpg" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4" />
                <div className="flex justify-end space-x-2">
                  <button type="button" onClick={() => setShowProfileUpload(false)} className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50">
                    Cancel
                  </button>
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    <Upload className="mr-2 h-4 w-4 inline" />
                    Update
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>}

      {/* Cover Image Upload Modal */}
      {showCoverUpload && <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Update Cover Image</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Upload Image File</label>
                <input type="file" accept="image/*" onChange={handleImageUpload('cover')} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              
              <div className="text-center text-sm text-gray-500">or</div>
              
              <form onSubmit={handleImageUrlSubmit('cover')}>
                <label className="block text-sm font-medium mb-2">Image URL</label>
                <input type="url" name="imageUrl" placeholder="https://example.com/image.jpg" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4" />
                <div className="flex justify-end space-x-2">
                  <button type="button" onClick={() => setShowCoverUpload(false)} className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50">
                    Cancel
                  </button>
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    <Upload className="mr-2 h-4 w-4 inline" />
                    Update
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>}

      {/* Payment Processing Modal */}
      {pendingBooking && <PaymentProcessing appointmentDetails={pendingBooking} isOpen={showPaymentModal} onClose={() => setShowPaymentModal(false)} onPaymentComplete={handlePaymentComplete} />}

      {/* Booking Confirmation */}
      {showConfirmation && pendingBooking && <BookingConfirmation bookingDetails={pendingBooking} onGoHome={() => {
      setShowConfirmation(false);
      setPendingBooking(null);
    }} onViewBookings={() => {
      setShowConfirmation(false);
      setPendingBooking(null);
      onNavigate?.('appointments');
    }} />}

      {/* Service Providers Modal */}
      <Dialog open={showProvidersModal} onOpenChange={setShowProvidersModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Your Service Providers</DialogTitle>
            <DialogDescription>
              Service providers you've booked with previously
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            {pastAppointments.length === 0 ? <div className="text-center py-8 text-gray-500">
                <User className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <p>No service providers yet</p>
                <p className="text-sm mt-2">Book your first appointment to get started</p>
              </div> : Array.from(new Map(pastAppointments.filter(apt => apt.hairdressers?.profiles?.full_name).map(apt => [apt.hairdresser_id, {
            id: apt.hairdresser_id,
            name: apt.hairdressers?.profiles?.full_name,
            salon: apt.salons?.name,
            bookings: pastAppointments.filter(a => a.hairdresser_id === apt.hairdresser_id).length
          }])).values()).map(provider => <div key={provider.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-emerald-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{provider.name}</h3>
                        <p className="text-sm text-gray-600">{provider.salon || 'Salon'}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {provider.bookings} appointment{provider.bookings !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" className="border-emerald-200 text-emerald-600 hover:bg-emerald-50" onClick={() => {
                setShowProvidersModal(false);
                setShowBookingModal(true);
              }}>
                      Book Again
                    </Button>
                  </div>
                </div>)}
          </div>
        </DialogContent>
      </Dialog>

      {/* Custom Alert */}
      <CustomAlert isOpen={alertInfo.show} onClose={() => setAlertInfo(prev => ({
      ...prev,
      show: false
    }))} type={alertInfo.type} title={alertInfo.title} message={alertInfo.message} />
    </div>;
};
export default CustomerDashboard;