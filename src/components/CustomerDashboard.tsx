
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
import { supabase } from "@/integrations/supabase/client";

interface CustomerDashboardProps {
  userName: string;
  onNavigate?: (page: string) => void;
}

const CustomerDashboard = ({ userName, onNavigate }: CustomerDashboardProps) => {
  // Profile state
  const [profilePicture, setProfilePicture] = useState('https://images.unsplash.com/photo-1649972904349-6e44c42644a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80');
  const [coverImage, setCoverImage] = useState('https://images.unsplash.com/photo-1518005020951-eccb494ad742?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80');
  const [showProfileUpload, setShowProfileUpload] = useState(false);
  const [showCoverUpload, setShowCoverUpload] = useState(false);
  const [username, setUsername] = useState('');
  
  // Currency formatting for South African Rands
  const formatCurrency = (amount: number) => {
    return `R${amount.toFixed(2)}`;
  };

  // Fetch username from database
  useEffect(() => {
    const fetchUsername = async () => {
      try {
        const { data: user } = await supabase.auth.getUser();
        if (user.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('username')
            .eq('user_id', user.user.id)
            .single();
          
          if (profile?.username) {
            setUsername(profile.username);
          }
        }
      } catch (error) {
        console.error('Failed to fetch username:', error);
      }
    };

    fetchUsername();
  }, []);

  // Name formatting function
  const formatName = (name: string) => {
    if (!name) return '';
    
    // Split by space and filter out empty strings
    const parts = name.trim().split(/\s+/).filter(part => part.length > 0);
    
    // Capitalize first letter of each part and make rest lowercase
    const formattedParts = parts.map(part => 
      part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
    );
    
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
    notes: ''
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
  }>({ show: false, type: 'info', title: '', message: '' });

  // Mock data for appointments and hairdressers
  const upcomingAppointments = [
    {
      id: 1,
      service: 'Haircut & Styling',
      hairdresser: 'Sarah Johnson',
      date: '2024-07-15',
      time: '2:00 PM',
      status: 'Confirmed',
      salon: 'Glamour Studio',
      cost: formatCurrency(75)
    },
    {
      id: 2,
      service: 'Hair Color & Highlights',
      hairdresser: 'Maria Garcia',
      date: '2024-07-20',
      time: '10:00 AM',
      status: 'Pending',
      salon: 'Elite Hair Lounge',
      cost: formatCurrency(150)
    }
  ];

  const pastAppointments = [
    {
      id: 3,
      service: 'Haircut',
      hairdresser: 'Emma Wilson',
      date: '2024-06-28',
      time: '3:30 PM',
      status: 'Completed',
      salon: 'Trendy Cuts',
      cost: formatCurrency(60),
      hasReview: false
    },
    {
      id: 4,
      service: 'Hair Treatment',
      hairdresser: 'Lisa Chen',
      date: '2024-06-15',
      time: '1:00 PM',
      status: 'Completed',
      salon: 'Luxury Hair Spa',
      cost: formatCurrency(120),
      hasReview: true,
      rating: 5
    }
  ];

  // Customer profile data including ratings from hairdressers
  const customerProfile = {
    overallRating: 4.6,
    totalRatings: 15,
    ratingBreakdown: {
      5: 8,
      4: 5,
      3: 2,
      2: 0,
      1: 0
    },
    recentFeedback: [
      {
        id: 1,
        hairdresser: 'Sarah Johnson',
        salon: 'Glamour Studio',
        rating: 5,
        comment: 'Always punctual and professional. Great communication about styling preferences.',
        date: '2024-01-15'
      },
      {
        id: 2,
        hairdresser: 'Maria Garcia',
        salon: 'Elite Hair Lounge',
        rating: 4,
        comment: 'Pleasant customer, follows instructions well. Easy to work with.',
        date: '2024-01-10'
      },
      {
        id: 3,
        hairdresser: 'Emma Wilson',
        salon: 'Trendy Cuts',
        rating: 5,
        comment: 'Excellent client! Very clear about what she wants and appreciates the work.',
        date: '2024-01-05'
      }
    ],
    badges: ['Punctual', 'Professional', 'Easy Going', 'Good Tipper']
  };

  const favoriteHairdresser = {
    name: 'Sarah Johnson',
    salon: 'Glamour Studio',
    rating: 4.9,
    specialties: ['Cutting', 'Styling', 'Color'],
    totalAppointments: 8
  };

  const availableServices = [
    // Hair Services
    'Haircut',
    'Hair Styling',
    'Hair Color',
    'Highlights',
    'Hair Treatment',
    'Blowout',
    'Perm',
    'Hair Extensions',
    'Keratin Treatment',
    'Hair Wash & Blow Dry',
    
    // Spa & Wellness Services
    'Swedish Massage',
    'Deep Tissue Massage',
    'Hot Stone Massage',
    'Aromatherapy Massage',
    'Couples Massage',
    'Reflexology',
    'Body Scrub',
    'Body Wrap',
    'Facial Treatment',
    'Anti-Aging Facial',
    'Hydrating Facial',
    'Acne Treatment Facial',
    
    // Nail Services
    'Classic Manicure',
    'Gel Manicure',
    'French Manicure',
    'Nail Art Design',
    'Classic Pedicure',
    'Spa Pedicure',
    'Gel Pedicure',
    'Nail Extensions',
    'Nail Repair',
    
    // Beauty & Grooming Services
    'Eyebrow Threading',
    'Eyebrow Tinting',
    'Eyelash Extensions',
    'Eyelash Tinting',
    'Waxing - Full Leg',
    'Waxing - Half Leg',
    'Waxing - Bikini',
    'Waxing - Brazilian',
    'Waxing - Underarm',
    'Waxing - Facial',
    'Makeup Application',
    'Bridal Makeup',
    'Special Event Makeup',
    
    // Men's Grooming
    'Men\'s Haircut',
    'Beard Trim',
    'Mustache Trim',
    'Hot Towel Shave',
    'Beard Styling',
    'Men\'s Facial',
    'Scalp Treatment'
  ];

  const availableHairdressers = [
    { id: 1, name: 'Sarah Johnson', salon: 'Glamour Studio', rating: 4.9 },
    { id: 2, name: 'Maria Garcia', salon: 'Elite Hair Lounge', rating: 4.8 },
    { id: 3, name: 'Emma Wilson', salon: 'Trendy Cuts', rating: 4.7 },
    { id: 4, name: 'Lisa Chen', salon: 'Luxury Hair Spa', rating: 4.9 },
    { id: 5, name: 'Anna Rodriguez', salon: 'Style Central', rating: 4.6 }
  ];

  // Show custom alert
  const showAlert = (type: 'success' | 'error' | 'info', title: string, message: string) => {
    setAlertInfo({ show: true, type, title, message });
  };

  // Handle booking form submission
  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!bookingData.service || !bookingData.hairdresser || !bookingData.date || !bookingData.time) {
      showAlert('error', 'Incomplete Information', 'Please fill in all required fields to book your appointment.');
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
    
    // Create pending booking for payment
    const selectedHairdresser = availableHairdressers.find(h => h.name === bookingData.hairdresser);
    const serviceCost = bookingData.service === 'Hair Color' ? 150 : 
                       bookingData.service === 'Hair Treatment' ? 120 : 75;
    
    setPendingBooking({
      service: bookingData.service,
      stylist: bookingData.hairdresser,
      date: bookingData.date,
      time: bookingData.time,
      cost: serviceCost,
      salon: selectedHairdresser?.salon || 'Beauty Salon',
      notes: bookingData.notes
    });
    
    setShowBookingModal(false);
    setShowPaymentModal(true);
  };

  // Handle payment completion
  const handlePaymentComplete = async (paymentData: any) => {
    showAlert('success', 'Booking Confirmed!', 
      `Your appointment for ${pendingBooking.service} with ${pendingBooking.stylist} has been booked for ${pendingBooking.date} at ${pendingBooking.time}. Payment of R${paymentData.amount.toFixed(2)} processed successfully.`
    );
    
    // Save booking to Supabase database
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        throw new Error('User not authenticated');
      }

      // Get customer profile ID
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.user.id)
        .single();

      if (!profile) {
        throw new Error('Customer profile not found');
      }

      // Find hairdresser by name (for demo purposes, we'll use a mock lookup)
      // In a real app, you'd have hairdresser IDs from the booking form
      const { data: hairdresser } = await supabase
        .from('hairdressers')
        .select('id')
        .limit(1)
        .single();

      // Find service by name (for demo purposes, we'll use a mock lookup)
      // In a real app, you'd have service IDs from the booking form
      const { data: service } = await supabase
        .from('services')
        .select('id, duration_minutes')
        .limit(1)
        .single();

      // Insert booking into database
      const { error: bookingError } = await supabase
        .from('bookings')
        .insert({
          customer_id: profile.id,
          hairdresser_id: hairdresser?.id || null,
          service_id: service?.id || null,
          appointment_date: pendingBooking.date,
          appointment_time: pendingBooking.time,
          duration_minutes: service?.duration_minutes || 60,
          total_price: pendingBooking.cost,
          status: 'pending',
          special_requests: pendingBooking.notes || null
        });

      if (bookingError) {
        throw bookingError;
      }

      console.log('Booking saved to Supabase successfully');
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
          'Content-Type': 'application/json',
        },
        mode: 'no-cors',
        body: JSON.stringify(webhookData),
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
          'Content-Type': 'application/json',
        },
        mode: 'no-cors',
        body: JSON.stringify(notificationData),
      });
    } catch (error) {
      console.error('Failed to send notification to Zapier webhook:', error);
      // Don't show error to user as booking is still successful
    }
    
    setBookingData({ service: '', hairdresser: '', date: '', time: '', notes: '' });
    setPendingBooking(null);
    
    // Show additional success message with View Appointments option
    setTimeout(() => {
      showAlert('info', 'Appointment Created!', 
        'Your appointment has been added to your schedule. You can view and manage all your appointments in the "My Appointments" section.'
      );
    }, 3000);
  };

  // Handle review submission
  const handleReviewSubmission = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (reviewData.rating === 0) {
      showAlert('error', 'Rating Required', 'Please provide a rating for your appointment.');
      return;
    }
    
    showAlert('success', 'Review Submitted!', 
      'Thank you for your feedback! Your review helps other customers and supports our hairdressers.'
    );
    
    setShowReviewModal(false);
    setReviewData({ rating: 0, comment: '' });
    setSelectedAppointment(null);
  };

  // Open review modal for specific appointment
  const openReviewModal = (appointment: any) => {
    setSelectedAppointment(appointment);
    setShowReviewModal(true);
  };

  // Render star rating component
  const StarRating = ({ rating, onRatingChange, readonly = false }: { 
    rating: number; 
    onRatingChange?: (rating: number) => void; 
    readonly?: boolean;
  }) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 cursor-pointer transition-colors ${
              star <= rating 
                ? 'text-yellow-400 fill-yellow-400' 
                : 'text-gray-300'
            }`}
            onClick={() => !readonly && onRatingChange && onRatingChange(star)}
          />
        ))}
      </div>
    );
  };

  // Handle image uploads
  const handleImageUpload = (type: 'profile' | 'cover') => (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      if (type === 'profile') {
        setProfilePicture(imageUrl);
        setShowProfileUpload(false);
      } else {
        setCoverImage(imageUrl);
        setShowCoverUpload(false);
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

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Profile Header with Cover Image */}
        <div className="mb-8">
          <div className="relative mb-24 h-48 w-full rounded-lg overflow-hidden">
            <img 
              src={coverImage}
              alt="Cover"
              className="w-full h-full object-cover cursor-pointer"
              onClick={() => setShowCoverUpload(true)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            
            {/* Cover Image Upload Button */}
            <button
              onClick={() => setShowCoverUpload(true)}
              className="absolute top-4 right-4 bg-white/20 backdrop-blur text-white p-2 rounded-full shadow-lg hover:bg-white/30 transition-colors"
            >
              <Camera className="h-4 w-4" />
            </button>
            
            {/* Profile Picture Overlay */}
            <div className="absolute top-0 left-4">
              <div className="relative">
                <img 
                  src={profilePicture}
                  alt="Profile"
                  className="w-48 h-48 rounded-full object-cover border-4 border-white shadow-lg cursor-pointer hover-scale transition-all duration-300"
                  onClick={() => setShowProfileUpload(true)}
                />
                <button
                  onClick={() => setShowProfileUpload(true)}
                  className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
                >
                  <Camera className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
          
          {/* Welcome Header */}
          <div className="ml-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {username || 'User'}
            </h1>
            <p className="text-gray-600">
              Manage your appointments and discover new styling opportunities.
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
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

          <Card className="bg-gradient-to-r from-pink-500 to-pink-600 text-white">
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

          <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100">Your Rating</p>
                  <p className="text-2xl font-bold">{customerProfile.overallRating}</p>
                </div>
                <Star className="h-8 w-8 text-yellow-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">Wallet Balance</p>
                  <p className="text-2xl font-bold">R250</p>
                </div>
                <Wallet className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-indigo-100">Favorite Rating</p>
                  <p className="text-2xl font-bold">{favoriteHairdresser.rating}</p>
                </div>
                <Heart className="h-8 w-8 text-indigo-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100">Total Visits</p>
                  <p className="text-2xl font-bold">{favoriteHairdresser.totalAppointments}</p>
                </div>
                <User className="h-8 w-8 text-emerald-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
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
                      <Button 
                        onClick={() => setShowBookingModal(true)}
                        className="bg-purple-600 hover:bg-purple-700 flex-1"
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        Book New Appointment
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => {
                          if (onNavigate) {
                            onNavigate('appointments');
                            localStorage.setItem('salonconnect_current_page', 'appointments');
                          }
                        }}
                      >
                        <Clock className="mr-2 h-4 w-4" />
                        View All Appointments
                      </Button>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="wallet" className="mt-6">
                    <ClientWallet userName={userName} />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Appointments Tabs */}
            <Card>
              <CardHeader>
                <CardTitle>Your Appointments</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="upcoming" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                    <TabsTrigger value="past">Past</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="upcoming" className="space-y-4 mt-6">
                    {upcomingAppointments.map((appointment) => (
                      <div key={appointment.id} className="border rounded-lg p-4 bg-white">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-semibold text-lg">{appointment.service}</h3>
                            <p className="text-gray-600">with {appointment.hairdresser}</p>
                          </div>
                          <Badge 
                            variant={appointment.status === 'Confirmed' ? 'default' : 'secondary'}
                            className={appointment.status === 'Confirmed' ? 'bg-green-100 text-green-800' : ''}
                          >
                            {appointment.status}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Calendar className="mr-2 h-4 w-4" />
                            {appointment.date}
                          </div>
                          <div className="flex items-center">
                            <Clock className="mr-2 h-4 w-4" />
                            {appointment.time}
                          </div>
                          <div className="flex items-center">
                            <MapPin className="mr-2 h-4 w-4" />
                            {appointment.salon}
                          </div>
                          <div className="flex items-center">
                            <span className="font-medium text-purple-600">R{parseFloat(appointment.cost.replace(/[^\d.-]/g, '')).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </TabsContent>
                  
                  <TabsContent value="past" className="space-y-4 mt-6">
                    {pastAppointments.map((appointment) => (
                      <div key={appointment.id} className="border rounded-lg p-4 bg-white">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-semibold text-lg">{appointment.service}</h3>
                            <p className="text-gray-600">with {appointment.hairdresser}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            {appointment.hasReview && (
                              <div className="flex items-center">
                                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 mr-1" />
                                <span className="text-sm">{appointment.rating}</span>
                              </div>
                            )}
                            <Badge variant="outline" className="bg-gray-50">
                              {appointment.status}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center">
                            <Calendar className="mr-2 h-4 w-4" />
                            {appointment.date}
                          </div>
                          <div className="flex items-center">
                            <Clock className="mr-2 h-4 w-4" />
                            {appointment.time}
                          </div>
                          <div className="flex items-center">
                            <MapPin className="mr-2 h-4 w-4" />
                            {appointment.salon}
                          </div>
                          <div className="flex items-center">
                            <span className="font-medium text-purple-600">{appointment.cost}</span>
                          </div>
                        </div>
                        
                        {!appointment.hasReview && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => openReviewModal(appointment)}
                            className="border-purple-200 text-purple-600 hover:bg-purple-50"
                          >
                            <Star className="mr-2 h-4 w-4" />
                            Leave Review
                          </Button>
                        )}
                      </div>
                    ))}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Favorite Hairdresser */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Heart className="mr-2 h-5 w-5 text-pink-500" />
                  Favorite Hairdresser
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-lg">{favoriteHairdresser.name}</h3>
                  <p className="text-gray-600 mb-2">{favoriteHairdresser.salon}</p>
                  
                  <div className="flex items-center justify-center mb-3">
                    <StarRating rating={Math.floor(favoriteHairdresser.rating)} readonly />
                    <span className="ml-2 text-sm text-gray-600">{favoriteHairdresser.rating}</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 justify-center mb-4">
                    {favoriteHairdresser.specialties.map((specialty) => (
                      <Badge key={specialty} variant="secondary" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4">
                    {favoriteHairdresser.totalAppointments} appointments completed
                  </p>
                  
                  <Button 
                    size="sm" 
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    onClick={() => {
                      setBookingData(prev => ({ 
                        ...prev, 
                        hairdresser: favoriteHairdresser.name 
                      }));
                      setShowBookingModal(true);
                    }}
                  >
                    Book with {favoriteHairdresser.name.split(' ')[0]}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Customer Rating Profile */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="mr-2 h-5 w-5 text-yellow-500" />
                  Your Rating Profile
                </CardTitle>
                <CardDescription>
                  How hairdressers rate you as a client
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Overall Rating */}
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-600 mb-1">
                      {customerProfile.overallRating}
                    </div>
                    <div className="flex items-center justify-center mb-2">
                      <StarRating rating={Math.round(customerProfile.overallRating)} readonly />
                    </div>
                    <p className="text-sm text-gray-600">
                      Based on {customerProfile.totalRatings} reviews
                    </p>
                  </div>

                  {/* Rating Breakdown */}
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Rating Breakdown</h4>
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <div key={rating} className="flex items-center text-xs">
                        <span className="w-6">{rating}</span>
                        <Star className="h-3 w-3 text-yellow-400 mr-2" />
                        <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-yellow-400 h-2 rounded-full" 
                            style={{ 
                              width: `${(customerProfile.ratingBreakdown[rating as keyof typeof customerProfile.ratingBreakdown] / customerProfile.totalRatings) * 100}%` 
                            }}
                          />
                        </div>
                        <span className="w-6 text-right">
                          {customerProfile.ratingBreakdown[rating as keyof typeof customerProfile.ratingBreakdown]}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Customer Badges */}
                  <div>
                    <h4 className="font-medium text-sm mb-2">Your Badges</h4>
                    <div className="flex flex-wrap gap-1">
                      {customerProfile.badges.map((badge) => (
                        <Badge key={badge} variant="secondary" className="text-xs bg-green-100 text-green-800">
                          {badge}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Recent Feedback */}
                  <div>
                    <h4 className="font-medium text-sm mb-2">Recent Feedback</h4>
                    <div className="space-y-3 max-h-48 overflow-y-auto">
                      {customerProfile.recentFeedback.map((feedback) => (
                        <div key={feedback.id} className="bg-gray-50 rounded-lg p-3 text-xs">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium">{feedback.hairdresser}</span>
                            <div className="flex items-center">
                              <StarRating rating={feedback.rating} readonly />
                            </div>
                          </div>
                          <p className="text-gray-600 mb-1">{feedback.salon}</p>
                          <p className="text-gray-700 italic">"{feedback.comment}"</p>
                          <p className="text-gray-500 mt-1 text-right">{feedback.date}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

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
              <Select 
                value={bookingData.service} 
                onValueChange={(value) => setBookingData(prev => ({ ...prev, service: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a service" />
                </SelectTrigger>
                <SelectContent>
                  {availableServices.map((service) => (
                    <SelectItem key={service} value={service}>
                      {service}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="hairdresser">Hairdresser</Label>
              <Select 
                value={bookingData.hairdresser} 
                onValueChange={(value) => setBookingData(prev => ({ ...prev, hairdresser: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a hairdresser" />
                </SelectTrigger>
                <SelectContent>
                  {availableHairdressers.map((hairdresser) => (
                    <SelectItem key={hairdresser.id} value={hairdresser.name}>
                      <div className="flex items-center justify-between w-full">
                        <span>{hairdresser.name}</span>
                        <div className="flex items-center ml-2">
                          <Star className="h-3 w-3 text-yellow-400 fill-yellow-400 mr-1" />
                          <span className="text-xs">{hairdresser.rating}</span>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={bookingData.date}
                  onChange={(e) => setBookingData(prev => ({ ...prev, date: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              
              <div>
                <Label htmlFor="time">Time</Label>
                <Select 
                  value={bookingData.time} 
                  onValueChange={(value) => setBookingData(prev => ({ ...prev, time: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    {['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'].map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="notes">Special Requests (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Any special requests or notes for your hairdresser..."
                value={bookingData.notes}
                onChange={(e) => setBookingData(prev => ({ ...prev, notes: e.target.value }))}
                className="resize-none"
                rows={3}
              />
            </div>
            
            <div className="flex gap-4 pt-4">
              <Button type="submit" className="flex-1 bg-purple-600 hover:bg-purple-700">
                Book Appointment
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowBookingModal(false)}
                className="flex-1"
              >
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
                <StarRating 
                  rating={reviewData.rating} 
                  onRatingChange={(rating) => setReviewData(prev => ({ ...prev, rating }))} 
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="comment">Your Review (Optional)</Label>
              <Textarea
                id="comment"
                placeholder="Share your experience, what you liked, and any suggestions..."
                value={reviewData.comment}
                onChange={(e) => setReviewData(prev => ({ ...prev, comment: e.target.value }))}
                className="resize-none"
                rows={4}
              />
            </div>
            
            <div className="flex gap-4 pt-4">
              <Button type="submit" className="flex-1 bg-purple-600 hover:bg-purple-700">
                Submit Review
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowReviewModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Profile Picture Upload Modal */}
      {showProfileUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Update Profile Picture</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Upload Image File</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload('profile')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="text-center text-sm text-gray-500">or</div>
              
              <form onSubmit={handleImageUrlSubmit('profile')}>
                <label className="block text-sm font-medium mb-2">Image URL</label>
                <input
                  type="url"
                  name="imageUrl"
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                />
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowProfileUpload(false)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    <Upload className="mr-2 h-4 w-4 inline" />
                    Update
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Cover Image Upload Modal */}
      {showCoverUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Update Cover Image</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Upload Image File</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload('cover')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="text-center text-sm text-gray-500">or</div>
              
              <form onSubmit={handleImageUrlSubmit('cover')}>
                <label className="block text-sm font-medium mb-2">Image URL</label>
                <input
                  type="url"
                  name="imageUrl"
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                />
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowCoverUpload(false)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    <Upload className="mr-2 h-4 w-4 inline" />
                    Update
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Payment Processing Modal */}
      {pendingBooking && (
        <PaymentProcessing
          appointmentDetails={pendingBooking}
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          onPaymentComplete={handlePaymentComplete}
        />
      )}

      {/* Booking Confirmation */}
      {showConfirmation && pendingBooking && (
        <BookingConfirmation
          bookingDetails={pendingBooking}
          onGoHome={() => {
            setShowConfirmation(false);
            setPendingBooking(null);
          }}
          onViewBookings={() => {
            setShowConfirmation(false);
            setPendingBooking(null);
            onNavigate?.('appointments');
          }}
        />
      )}

      {/* Custom Alert */}
      <CustomAlert
        isOpen={alertInfo.show}
        onClose={() => setAlertInfo(prev => ({ ...prev, show: false }))}
        type={alertInfo.type}
        title={alertInfo.title}
        message={alertInfo.message}
      />
    </div>
  );
};

export default CustomerDashboard;
