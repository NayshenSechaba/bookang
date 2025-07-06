
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Users, Package, Scissors, DollarSign, Settings, Camera } from 'lucide-react';
import DashboardHeader from './DashboardHeader';
import QuickStats from './QuickStats';
import PortfolioSection from './PortfolioSection';
import ServicesManagement from './ServicesManagement';
import ProductsManagement from './ProductsManagement';
import FinanceOverview from './FinanceOverview';
import CalendarBooking from './CalendarBooking';
import { FinancialData, Service, Product, PortfolioImage } from '@/types/dashboard';

interface HairdresserDashboardProps {
  userName: string;
}

const HairdresserDashboard = ({ userName }: HairdresserDashboardProps) => {
  // All state variables and handlers
  const [profilePicture, setProfilePicture] = useState('/placeholder.svg');

  // Mock data - Fixed types to match interfaces
  const financialData: FinancialData = {
    totalEarnings: 'R12,450',
    monthlyCommission: 'R2,890',
    pendingPayments: 'R320',
    commissionRate: '15%',
    totalAppointments: 28, // This is now a number as expected
    averageRating: 4.8 // This is now a number as expected
  };

  const [services, setServices] = useState<Service[]>([
    { 
      id: 1, 
      name: 'Haircut & Style', 
      description: 'Professional haircut with styling',
      price: 85, 
      duration: 60, 
      category: 'haircut',
      isActive: true 
    },
    { 
      id: 2, 
      name: 'Hair Coloring', 
      description: 'Full hair coloring service',
      price: 150, 
      duration: 120, 
      category: 'color',
      isActive: true 
    },
    { 
      id: 3, 
      name: 'Hair Treatment', 
      description: 'Deep conditioning treatment',
      price: 95, 
      duration: 45, 
      category: 'treatment',
      isActive: false 
    },
  ]);

  const [products, setProducts] = useState<Product[]>([
    { 
      id: 1, 
      name: 'Premium Shampoo', 
      description: 'High-quality moisturizing shampoo',
      price: 25, 
      stock: 15, 
      category: 'shampoo',
      isActive: true 
    },
    { 
      id: 2, 
      name: 'Hair Styling Gel', 
      description: 'Strong hold styling gel',
      price: 18, 
      stock: 8, 
      category: 'styling',
      isActive: true 
    },
    { 
      id: 3, 
      name: 'Hair Mask Treatment', 
      description: 'Intensive repair mask',
      price: 35, 
      stock: 0, 
      category: 'treatment',
      isActive: false 
    },
  ]);

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

  const handleUpdateProfilePicture = () => {
    console.log('Update profile picture');
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        <DashboardHeader
          userName={userName}
          profilePicture={profilePicture}
          onUpdateProfilePicture={handleUpdateProfilePicture}
        />

        <QuickStats data={financialData} />

        <Tabs defaultValue="calendar" className="space-y-8">
          <TabsList className="grid w-full grid-cols-5 lg:w-fit">
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Calendar</span>
            </TabsTrigger>
            <TabsTrigger value="portfolio" className="flex items-center gap-2">
              <Camera className="h-4 w-4" />
              <span className="hidden sm:inline">Portfolio</span>
            </TabsTrigger>
            <TabsTrigger value="services" className="flex items-center gap-2">
              <Scissors className="h-4 w-4" />
              <span className="hidden sm:inline">Services</span>
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">Products</span>
            </TabsTrigger>
            <TabsTrigger value="finance" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              <span className="hidden sm:inline">Finance</span>
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
            <FinanceOverview data={financialData} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default HairdresserDashboard;
