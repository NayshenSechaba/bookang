import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import DashboardHeader from './DashboardHeader';
import QuickStats from './QuickStats';
import PortfolioSection from './PortfolioSection';
import ServicesManagement from './ServicesManagement';
import ProductsManagement from './ProductsManagement';
import FinanceOverview from './FinanceOverview';
import CalendarBooking from './CalendarBooking';
import { Service, Product, PortfolioImage, FinancialData } from '@/types/dashboard';

// Mock data for services
const mockServices: Service[] = [
  {
    id: 1,
    name: 'Haircut & Styling',
    description: 'Professional haircut and styling service',
    duration: 60,
    price: 75,
    category: 'haircut',
    isActive: true,
  },
  {
    id: 2,
    name: 'Color & Highlights',
    description: 'Custom hair color and highlights',
    duration: 120,
    price: 150,
    category: 'color',
    isActive: true,
  },
  {
    id: 3,
    name: 'Deep Conditioning Treatment',
    description: 'Intensive hair repair and hydration',
    duration: 45,
    price: 50,
    category: 'treatment',
    isActive: true,
  },
];

// Mock data for products
const mockProducts: Product[] = [
  {
    id: 1,
    name: 'Luxury Shampoo',
    description: 'Sulfate-free shampoo for all hair types',
    price: 25,
    stock: 50,
    category: 'shampoo',
    isActive: true,
  },
  {
    id: 2,
    name: 'Hydrating Conditioner',
    description: 'Intense hydration for dry and damaged hair',
    price: 25,
    stock: 50,
    category: 'conditioner',
    isActive: true,
  },
  {
    id: 3,
    name: 'Styling Gel',
    description: 'Strong hold gel for creating any style',
    price: 20,
    stock: 30,
    category: 'styling',
    isActive: true,
  },
];

// Mock data for portfolio images
const mockPortfolioImages: PortfolioImage[] = [
  {
    id: 1,
    url: '/api/placeholder/300/300',
    title: 'Elegant Bob Cut',
    description: 'A classic bob cut with a modern twist.',
    category: 'haircut',
    dateAdded: '2024-01-20',
  },
  {
    id: 2,
    url: '/api/placeholder/300/300',
    title: 'Vibrant Balayage',
    description: 'A stunning balayage with vibrant colors.',
    category: 'color',
    dateAdded: '2024-02-15',
  },
  {
    id: 3,
    url: '/api/placeholder/300/300',
    title: 'Updo for Special Occasions',
    description: 'An elegant updo perfect for weddings and parties.',
    category: 'styling',
    dateAdded: '2024-03-10',
  },
];

// Mock financial data
const mockFinancialData: FinancialData = {
  totalEarnings: 'R 54,750',
  monthlyCommission: 'R 4,500',
  pendingPayments: 'R 1,250',
  commissionRate: '10%',
  totalAppointments: 320,
  averageRating: 4.8,
};

const HairdresserDashboard = () => {
  const [activeTab, setActiveTab] = useState('calendar');
  const [services, setServices] = useState(mockServices);
  const [products, setProducts] = useState(mockProducts);
  const [portfolioImages, setPortfolioImages] = useState(mockPortfolioImages);

  // Handlers for Services
  const handleServiceAdd = (newService: Service) => {
    setServices([...services, { ...newService, id: Date.now() }]);
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

  // Handlers for Products
  const handleProductAdd = (newProduct: Product) => {
    setProducts([...products, { ...newProduct, id: Date.now() }]);
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

  // Handlers for Portfolio Images
  const handleImageUpload = (newImage: PortfolioImage) => {
    setPortfolioImages([...portfolioImages, { ...newImage, id: Date.now() }]);
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
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        <DashboardHeader 
          userName="Sarah Johnson"
          profilePicture="/api/placeholder/80/80"
          onUpdateProfilePicture={() => console.log('Update profile picture')}
        />

        {/* Quick Stats */}
        <QuickStats data={mockFinancialData} />

        {/* Main Content Tabs */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { key: 'calendar', label: 'Calendar', icon: '📅' },
                { key: 'portfolio', label: 'Portfolio', icon: '📸' },
                { key: 'services', label: 'Services', icon: '✂️' },
                { key: 'products', label: 'Products', icon: '🧴' },
                { key: 'finances', label: 'Finances', icon: '💰' }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm ${
                    activeTab === tab.key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'calendar' && <CalendarBooking />}
            {activeTab === 'portfolio' && (
              <PortfolioSection 
                images={portfolioImages}
                onImageUpload={handleImageUpload}
                onImageEdit={handleImageEdit}
                onImageDelete={handleImageDelete}
              />
            )}
            {activeTab === 'services' && (
              <ServicesManagement 
                services={services}
                onServiceAdd={handleServiceAdd}
                onServiceEdit={handleServiceEdit}
                onServiceDelete={handleServiceDelete}
                onServiceToggle={handleServiceToggle}
              />
            )}
            {activeTab === 'products' && (
              <ProductsManagement 
                products={products}
                onProductAdd={handleProductAdd}
                onProductEdit={handleProductEdit}
                onProductDelete={handleProductDelete}
                onProductToggle={handleProductToggle}
              />
            )}
            {activeTab === 'finances' && <FinanceOverview data={mockFinancialData} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HairdresserDashboard;
