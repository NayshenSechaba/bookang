import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Users, Package, Scissors, Settings, Camera, CreditCard } from 'lucide-react';
import DashboardHeader from './DashboardHeader';
import QuickStats from './QuickStats';
import PortfolioSection from './PortfolioSection';
import ServicesManagement from './ServicesManagement';
import ProductsManagement from './ProductsManagement';
import FinanceOverview from './FinanceOverview';
import CalendarBooking from './CalendarBooking';
import { FinancialData, Service, Product, PortfolioImage, Appointment, Customer } from '@/types/dashboard';
import AppointmentManagement from './AppointmentManagement';
import CustomerManagement from './CustomerManagement';
import StylistEarnings from './StylistEarnings';
import OnboardingTour from './OnboardingTour';
import { supabase } from '@/integrations/supabase/client';

interface HairdresserDashboardProps {
  userName: string;
}

const HairdresserDashboard = ({ userName: initialUserName }: HairdresserDashboardProps) => {
  // All state variables and handlers
  const [profilePicture, setProfilePicture] = useState('/placeholder.svg');
  const [userName, setUserName] = useState(initialUserName);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [paystackStatus, setPaystackStatus] = useState<string>('Not Started');

  // Check if user needs onboarding tour and fetch services/products
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const { data: user } = await supabase.auth.getUser();
        if (user.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('id, onboarding_completed, paystack_status')
            .eq('user_id', user.user.id)
            .single();
          
          if (profile && !profile.onboarding_completed) {
            setShowOnboarding(true);
          }

          // Set paystack status
          if (profile?.paystack_status) {
            setPaystackStatus(profile.paystack_status);
          }

          // Fetch services from database
          if (profile) {
            const { data: hairdresser } = await supabase
              .from('hairdressers')
              .select('id')
              .eq('profile_id', profile.id)
              .maybeSingle();

            if (hairdresser) {
              const { data: servicesData } = await supabase
                .from('services')
                .select('*')
                .eq('hairdresser_id', hairdresser.id);

              if (servicesData) {
                const mappedServices: Service[] = servicesData.map((s: any) => ({
                  id: parseInt(s.id),
                  name: s.name,
                  description: s.description || '',
                  price: parseFloat(s.price),
                  duration: s.duration_minutes,
                  category: 'haircut' as const,
                  isActive: s.is_active,
                  cancellationFee: 0,
                  cancellationPolicy: ''
                }));
                setServices(mappedServices);
              }
            }
          }
        }
      } catch (error) {
        console.error('Failed to check onboarding status:', error);
      }
    };

    checkOnboardingStatus();
  }, []);

  // Mock data - Fixed types to match interfaces
  const financialData: FinancialData = {
    totalEarnings: 'R12,450',
    monthlyCommission: 'R2,890',
    pendingPayments: 'R320',
    commissionRate: '15%',
    totalAppointments: 28, // This is now a number as expected
    averageRating: 4.8 // This is now a number as expected
  };

  // Mock booking data for financial details
  const mockBookings: Appointment[] = [
    {
      id: 1,
      customerName: 'Sarah Johnson',
      service: 'Haircut & Style',
      date: '2024-01-15',
      time: '10:00 AM',
      status: 'completed',
      cost: 'R85',
      commission: 'R12.75'
    },
    {
      id: 2,
      customerName: 'Emily Davis',
      service: 'Hair Coloring',
      date: '2024-01-14',
      time: '2:00 PM',
      status: 'completed',
      cost: 'R150',
      commission: 'R22.50'
    },
    {
      id: 3,
      customerName: 'Jessica Wilson',
      service: 'Hair Treatment',
      date: '2024-01-12',
      time: '11:30 AM',
      status: 'completed',
      cost: 'R95',
      commission: 'R14.25'
    },
    {
      id: 4,
      customerName: 'Amanda Brown',
      service: 'Haircut & Style',
      date: '2024-01-10',
      time: '3:30 PM',
      status: 'completed',
      cost: 'R85',
      commission: 'R12.75'
    },
    {
      id: 5,
      customerName: 'Lisa Martinez',
      service: 'Hair Coloring',
      date: '2024-01-08',
      time: '1:00 PM',
      status: 'pending',
      cost: 'R150',
      commission: 'R22.50'
    }
  ];

  const [services, setServices] = useState<Service[]>([]);

  const [products, setProducts] = useState<Product[]>([]);

  const [portfolioImages, setPortfolioImages] = useState<PortfolioImage[]>([
    { 
      id: 1, 
      url: '/placeholder.svg', 
      title: 'Modern Bob Cut',
      description: 'Modern bob cut with layers', 
      category: 'haircut',
      dateAdded: '2024-01-15'
    },
    { 
      id: 2, 
      url: '/placeholder.svg', 
      title: 'Balayage Highlights',
      description: 'Beautiful balayage highlights', 
      category: 'color',
      dateAdded: '2024-01-12'
    },
    { 
      id: 3, 
      url: '/placeholder.svg', 
      title: 'Wedding Updo',
      description: 'Elegant wedding updo styling', 
      category: 'styling',
      dateAdded: '2024-01-10'
    },
  ]);

  // Mock customer data
  const [customers, setCustomers] = useState<Customer[]>([
    {
      id: 1,
      name: 'Sarah Johnson',
      email: 'sarah.j@email.com',
      phone: '+27 82 123 4567',
      totalVisits: 12,
      noShowCount: 0,
      rating: 4.8,
      notes: 'Always on time, professional, easy to work with',
      flagged: false,
      lastVisit: '2024-01-15'
    },
    {
      id: 2,
      name: 'Emily Davis',
      email: 'emily.d@email.com',
      phone: '+27 83 234 5678',
      totalVisits: 8,
      noShowCount: 1,
      rating: 4.2,
      notes: 'Prefers natural looks, good communication',
      flagged: false,
      lastVisit: '2024-01-14'
    },
    {
      id: 3,
      name: 'Jessica Wilson',
      email: 'jessica.w@email.com',
      phone: '+27 84 345 6789',
      totalVisits: 15,
      noShowCount: 3,
      rating: 2.5,
      notes: 'Often late, difficult to please, payment issues',
      flagged: true,
      lastVisit: '2024-01-12'
    },
    {
      id: 4,
      name: 'Amanda Brown',
      email: 'amanda.b@email.com',
      phone: '+27 85 456 7890',
      totalVisits: 20,
      noShowCount: 0,
      rating: 5.0,
      notes: 'VIP customer, very loyal, tips well',
      flagged: false,
      lastVisit: '2024-01-10'
    }
  ]);

  // Enhanced appointment data with new fields
  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: 1,
      customerName: 'Sarah Johnson',
      service: 'Haircut & Style',
      date: '2024-01-20',
      time: '10:00 AM',
      status: 'confirmed',
      cost: 'R85',
      commission: 'R12.75',
      noShowCount: 0
    },
    {
      id: 2,
      customerName: 'Emily Davis',
      service: 'Hair Coloring',
      date: '2024-01-22',
      time: '2:00 PM',
      status: 'pending',
      cost: 'R150',
      commission: 'R22.50',
      noShowCount: 1
    },
    {
      id: 3,
      customerName: 'Jessica Wilson',
      service: 'Hair Treatment',
      date: '2024-01-18',
      time: '11:30 AM',
      status: 'no-show',
      cost: 'R95',
      commission: 'R14.25',
      noShowCount: 3,
      cancellationFeeCharged: 50
    }
  ]);

  const handleUpdateProfilePicture = () => {
    console.log('Update profile picture');
  };

  const handleUserNameChange = (newName: string) => {
    setUserName(newName);
    console.log('User name updated to:', newName);
  };

  const handleServiceAdd = (newService: Service) => {
    setServices([...services, newService]);
  };

  const handleServiceEdit = (updatedService: Service) => {
    setServices(services.map(service => 
      service.id === updatedService.id ? updatedService : service
    ));
  };

  const handleServiceDelete = (id: number) => {
    setServices(services.filter(service => service.id !== id));
  };

  const handleServiceToggle = (id: number) => {
    setServices(services.map(service => 
      service.id === id ? { ...service, isActive: !service.isActive } : service
    ));
  };

  const handleProductAdd = (newProduct: Product) => {
    setProducts([...products, newProduct]);
  };

  const handleProductEdit = (updatedProduct: Product) => {
    setProducts(products.map(product => 
      product.id === updatedProduct.id ? updatedProduct : product
    ));
  };

  const handleProductDelete = (id: number) => {
    setProducts(products.filter(product => product.id !== id));
  };

  const handleProductToggle = (id: number) => {
    setProducts(products.map(product => 
      product.id === id ? { ...product, isActive: !product.isActive } : product
    ));
  };

  const handleImageUpload = (newImage: PortfolioImage) => {
    setPortfolioImages([...portfolioImages, newImage]);
  };

  const handleImageEdit = (updatedImage: PortfolioImage) => {
    setPortfolioImages(portfolioImages.map(image => 
      image.id === updatedImage.id ? updatedImage : image
    ));
  };

  const handleImageDelete = (id: number) => {
    setPortfolioImages(portfolioImages.filter(image => image.id !== id));
  };

  const handleUpdateAppointment = (updatedAppointment: Appointment) => {
    setAppointments(appointments.map(appointment => 
      appointment.id === updatedAppointment.id ? updatedAppointment : appointment
    ));
  };

  const handleUpdateCustomer = (updatedCustomer: Customer) => {
    setCustomers(customers.map(customer => 
      customer.id === updatedCustomer.id ? updatedCustomer : customer
    ));
  };

  const getPaymentStatusConfig = () => {
    switch (paystackStatus) {
      case 'Completed':
        return { text: 'Payment Status: Active', color: 'bg-green-500' };
      case 'Pending':
        return { text: 'Payment Status: Pending Setup', color: 'bg-orange-500' };
      default:
        return { text: 'Payment Status: Inactive', color: 'bg-red-500' };
    }
  };

  const statusConfig = getPaymentStatusConfig();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        <DashboardHeader
          userName={userName}
          profilePicture={profilePicture}
          onUpdateProfilePicture={handleUpdateProfilePicture}
          onUserNameChange={handleUserNameChange}
        />

        {/* Payment Status Display */}
        <div className="mb-6 flex items-center justify-between">
          <Badge className={`${statusConfig.color} text-white px-4 py-2 text-sm`}>
            {statusConfig.text}
          </Badge>
          {paystackStatus !== 'Completed' && (
            <a href="/business-profile#payment-setup" className="flex items-center gap-2 text-primary hover:underline">
              <CreditCard className="h-5 w-5" />
              <span>Setup Payment</span>
            </a>
          )}
        </div>

        <QuickStats data={financialData} />

        <Tabs defaultValue="calendar" className="space-y-8">
          <TabsList className="grid w-full grid-cols-8 lg:w-fit">
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Calendar</span>
            </TabsTrigger>
            <TabsTrigger value="portfolio" className="flex items-center gap-2" data-tour="portfolio">
              <Camera className="h-4 w-4" />
              <span className="hidden sm:inline">Portfolio</span>
            </TabsTrigger>
            <TabsTrigger value="services" className="flex items-center gap-2" data-tour="services">
              <Scissors className="h-4 w-4" />
              <span className="hidden sm:inline">Services</span>
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">Products</span>
            </TabsTrigger>
            <TabsTrigger value="finance" className="flex items-center gap-2">
              <span className="hidden sm:inline">Finance</span>
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center gap-2">
              <span className="hidden sm:inline">Performance</span>
            </TabsTrigger>
            <TabsTrigger value="appointments" className="flex items-center gap-2" data-tour="bookings">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Bookings</span>
            </TabsTrigger>
            <TabsTrigger value="customers" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Customers</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calendar">
            <CalendarBooking />
          </TabsContent>

          <TabsContent value="portfolio">
            <PortfolioSection
              images={portfolioImages}
              onImageUpload={handleImageUpload}
              onImageEdit={handleImageEdit}
              onImageDelete={handleImageDelete}
            />
          </TabsContent>

          <TabsContent value="services">
            <ServicesManagement
              services={services}
              onServiceAdd={handleServiceAdd}
              onServiceEdit={handleServiceEdit}
              onServiceDelete={handleServiceDelete}
              onServiceToggle={handleServiceToggle}
            />
          </TabsContent>

          <TabsContent value="products">
            <ProductsManagement
              products={products}
              onProductAdd={handleProductAdd}
              onProductEdit={handleProductEdit}
              onProductDelete={handleProductDelete}
              onProductToggle={handleProductToggle}
            />
          </TabsContent>

          <TabsContent value="finance">
            <FinanceOverview data={financialData} bookings={mockBookings} />
          </TabsContent>

          <TabsContent value="performance">
            <StylistEarnings stylistName={userName} />
          </TabsContent>

          <TabsContent value="appointments">
            <AppointmentManagement
              appointments={appointments}
              onUpdateAppointment={handleUpdateAppointment}
            />
          </TabsContent>

          <TabsContent value="customers">
            <CustomerManagement
              customers={customers}
              onUpdateCustomer={handleUpdateCustomer}
            />
          </TabsContent>
        </Tabs>

        {/* Onboarding Tour */}
        <OnboardingTour
          isVisible={showOnboarding}
          onComplete={() => setShowOnboarding(false)}
          onSkip={() => setShowOnboarding(false)}
        />
      </div>
    </div>
  );
};

export default HairdresserDashboard;
