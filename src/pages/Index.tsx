
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Star, Scissors, Calendar, Users, MapPin, TrendingUp, Phone, Mail, HelpCircle } from 'lucide-react';
import AuthModal from '@/components/AuthModal';
import CustomerDashboard from '@/components/CustomerDashboard';
import HairdresserDashboard from '@/components/HairdresserDashboard';
import ExplorePage from '@/components/ExplorePage';
import FAQSection from '@/components/FAQSection';
import ContactSection from '@/components/ContactSection';
import TrendsSection from '@/components/TrendsSection';

const Index = () => {
  // Authentication state management
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<'customer' | 'hairdresser' | null>(null);
  const [userName, setUserName] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [loginType, setLoginType] = useState<'customer' | 'hairdresser'>('customer');
  
  // Navigation state
  const [currentPage, setCurrentPage] = useState('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Handle successful authentication
  const handleAuthSuccess = (role: 'customer' | 'hairdresser', name: string) => {
    setIsAuthenticated(true);
    setUserRole(role);
    setUserName(name);
    setShowAuthModal(false);
    setCurrentPage('dashboard');
  };

  // Handle logout
  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
    setUserName('');
    setCurrentPage('home');
  };

  // Open authentication modal with specific mode
  const openAuthModal = (mode: 'login' | 'register', type?: 'customer' | 'hairdresser') => {
    setAuthMode(mode);
    if (type) setLoginType(type);
    setShowAuthModal(true);
  };

  // Navigation items for authenticated users
  const getNavItems = () => {
    const baseItems = [
      { id: 'home', label: 'Home', icon: Users },
      { id: 'explore', label: 'Explore', icon: MapPin },
      { id: 'trends', label: 'Latest Trends', icon: TrendingUp },
      { id: 'faq', label: 'FAQ', icon: HelpCircle },
      { id: 'contact', label: 'Contact', icon: Phone },
    ];

    if (isAuthenticated) {
      baseItems.splice(1, 0, { id: 'dashboard', label: 'Dashboard', icon: Calendar });
    }

    return baseItems;
  };

  // Render current page content
  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        if (!isAuthenticated) return renderHomePage();
        return userRole === 'customer' ? 
          <CustomerDashboard userName={userName} /> : 
          <HairdresserDashboard userName={userName} />;
      case 'explore':
        return <ExplorePage />;
      case 'trends':
        return <TrendsSection />;
      case 'faq':
        return <FAQSection />;
      case 'contact':
        return <ContactSection />;
      default:
        return renderHomePage();
    }
  };

  // Home page content
  const renderHomePage = () => (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-8">
            <Badge variant="secondary" className="mb-4 text-purple-700 bg-purple-100">
              <Scissors className="mr-2 h-4 w-4" />
              Professional Salon Services
            </Badge>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Welcome to <span className="text-purple-600">SalonConnect</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Connect with professional hairdressers, book appointments seamlessly, and discover the latest trends in hair styling. Your perfect salon experience awaits.
          </p>

          {/* Image Carousel */}
          <div className="mb-12 max-w-4xl mx-auto">
            <Carousel 
              className="w-full"
              opts={{
                align: "start",
                loop: true,
              }}
            >
              <CarouselContent className="-ml-2 md:-ml-4">
                <CarouselItem className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                  <div className="p-1">
                    <div className="relative overflow-hidden rounded-lg shadow-lg">
                      <img 
                        src="https://images.unsplash.com/photo-1562322140-8baeececf3df?w=400&h=300&fit=crop&crop=face"
                        alt="Happy customer getting hair styled"
                        className="w-full h-64 object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    </div>
                  </div>
                </CarouselItem>
                
                <CarouselItem className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                  <div className="p-1">
                    <div className="relative overflow-hidden rounded-lg shadow-lg">
                      <img 
                        src="https://images.unsplash.com/photo-1521590832167-7bcbfaa6381a?w=400&h=300&fit=crop&crop=face"
                        alt="Professional salon with beauty products"
                        className="w-full h-64 object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    </div>
                  </div>
                </CarouselItem>
                
                <CarouselItem className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                  <div className="p-1">
                    <div className="relative overflow-hidden rounded-lg shadow-lg">
                      <img 
                        src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=300&fit=crop&crop=face"
                        alt="Satisfied customer with beautiful hair"
                        className="w-full h-64 object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    </div>
                  </div>
                </CarouselItem>
                
                <CarouselItem className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                  <div className="p-1">
                    <div className="relative overflow-hidden rounded-lg shadow-lg">
                      <img 
                        src="https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=400&h=300&fit=crop&crop=face"
                        alt="Modern salon interior with products"
                        className="w-full h-64 object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    </div>
                  </div>
                </CarouselItem>
                
                <CarouselItem className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                  <div className="p-1">
                    <div className="relative overflow-hidden rounded-lg shadow-lg">
                      <img 
                        src="https://images.unsplash.com/photo-1619451334792-150bdae95dc3?w=400&h=300&fit=crop&crop=face"
                        alt="Happy client during hair treatment"
                        className="w-full h-64 object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    </div>
                  </div>
                </CarouselItem>
              </CarouselContent>
              <CarouselPrevious className="left-2" />
              <CarouselNext className="right-2" />
            </Carousel>
          </div>

          {/* Authentication Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button 
              size="lg" 
              className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white px-8 py-3"
              onClick={() => openAuthModal('login', 'customer')}
            >
              Login as Customer
            </Button>
            
            <Button 
              size="lg" 
              variant="outline" 
              className="w-full sm:w-auto border-purple-600 text-purple-600 hover:bg-purple-50 px-8 py-3"
              onClick={() => openAuthModal('login', 'hairdresser')}
            >
              Business Login
            </Button>
            
            <Button 
              size="lg" 
              variant="secondary" 
              className="w-full sm:w-auto bg-pink-100 text-pink-700 hover:bg-pink-200 px-8 py-3"
              onClick={() => openAuthModal('register')}
            >
              Register Now
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Choose SalonConnect?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center border-purple-100 hover:shadow-lg transition-shadow">
              <CardHeader>
                <Calendar className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <CardTitle className="text-purple-900">Easy Booking</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600">
                  Book appointments with your favorite hairdressers in just a few clicks. Simple, fast, and convenient.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center border-pink-100 hover:shadow-lg transition-shadow">
              <CardHeader>
                <Star className="h-12 w-12 text-pink-600 mx-auto mb-4" />
                <CardTitle className="text-pink-900">Quality Service</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600">
                  Connect with verified, professional hairdressers with excellent reviews and ratings.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center border-indigo-100 hover:shadow-lg transition-shadow">
              <CardHeader>
                <TrendingUp className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
                <CardTitle className="text-indigo-900">Latest Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600">
                  Stay updated with the latest hair trends and styles from top professionals in the industry.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Quick Access Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-purple-100 to-pink-100">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Quick Access</h2>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="h-20 flex-col gap-2 bg-white hover:bg-purple-50 border-purple-200"
              onClick={() => setCurrentPage('explore')}
            >
              <MapPin className="h-6 w-6 text-purple-600" />
              Explore Salons
            </Button>
            
            <Button
              variant="outline"
              className="h-20 flex-col gap-2 bg-white hover:bg-pink-50 border-pink-200"
              onClick={() => setCurrentPage('trends')}
            >
              <TrendingUp className="h-6 w-6 text-pink-600" />
              Latest Trends
            </Button>
            
            <Button
              variant="outline"
              className="h-20 flex-col gap-2 bg-white hover:bg-indigo-50 border-indigo-200"
              onClick={() => setCurrentPage('faq')}
            >
              <HelpCircle className="h-6 w-6 text-indigo-600" />
              FAQ
            </Button>
            
            <Button
              variant="outline"
              className="h-20 flex-col gap-2 bg-white hover:bg-green-50 border-green-200"
              onClick={() => setCurrentPage('contact')}
            >
              <Phone className="h-6 w-6 text-green-600" />
              Contact Us
            </Button>
          </div>
        </div>
      </section>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <Scissors className="h-8 w-8 text-purple-600" />
              <span className="text-2xl font-bold text-gray-900">SalonConnect</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              {getNavItems().map((item) => (
                <Button
                  key={item.id}
                  variant={currentPage === item.id ? "default" : "ghost"}
                  className={currentPage === item.id ? "bg-purple-600 text-white" : "text-gray-600 hover:text-purple-600"}
                  onClick={() => setCurrentPage(item.id)}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.label}
                </Button>
              ))}
              
              {isAuthenticated && (
                <div className="flex items-center space-x-3 pl-4 border-l">
                  <span className="text-sm text-gray-600">
                    Welcome, <span className="font-medium text-purple-600">{userName}</span>
                  </span>
                  <Button variant="outline" size="sm" onClick={handleLogout}>
                    Logout
                  </Button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <div className="space-y-1">
                <div className="w-5 h-0.5 bg-gray-600"></div>
                <div className="w-5 h-0.5 bg-gray-600"></div>
                <div className="w-5 h-0.5 bg-gray-600"></div>
              </div>
            </Button>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden py-4 border-t">
              <div className="flex flex-col space-y-2">
                {getNavItems().map((item) => (
                  <Button
                    key={item.id}
                    variant={currentPage === item.id ? "default" : "ghost"}
                    className={`justify-start ${currentPage === item.id ? "bg-purple-600 text-white" : "text-gray-600"}`}
                    onClick={() => {
                      setCurrentPage(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.label}
                  </Button>
                ))}
                
                {isAuthenticated && (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-gray-600 px-3 mb-2">
                      Welcome, <span className="font-medium text-purple-600">{userName}</span>
                    </p>
                    <Button variant="outline" size="sm" onClick={handleLogout} className="w-full">
                      Logout
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main>
        {renderCurrentPage()}
      </main>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode={authMode}
        loginType={loginType}
        onAuthSuccess={handleAuthSuccess}
        onSwitchMode={(newMode) => setAuthMode(newMode)}
      />

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Scissors className="h-6 w-6 text-purple-400" />
                <span className="text-xl font-bold">SalonConnect</span>
              </div>
              <p className="text-gray-400">
                Connecting customers with professional hairdressers for the perfect salon experience.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <div className="space-y-2">
                <p className="text-gray-400 hover:text-white cursor-pointer" onClick={() => setCurrentPage('explore')}>
                  Explore Salons
                </p>
                <p className="text-gray-400 hover:text-white cursor-pointer" onClick={() => setCurrentPage('trends')}>
                  Latest Trends
                </p>
                <p className="text-gray-400 hover:text-white cursor-pointer" onClick={() => openAuthModal('register')}>
                  Register
                </p>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <div className="space-y-2">
                <p className="text-gray-400 hover:text-white cursor-pointer" onClick={() => setCurrentPage('faq')}>
                  FAQ
                </p>
                <p className="text-gray-400 hover:text-white cursor-pointer" onClick={() => setCurrentPage('contact')}>
                  Contact Us
                </p>
                <p className="text-gray-400 hover:text-white cursor-pointer">Help Center</p>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Contact</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-gray-400">
                  <Mail className="h-4 w-4" />
                  <span>support@salonconnect.com</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-400">
                  <Phone className="h-4 w-4" />
                  <span>+1 (555) 123-4567</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 SalonConnect. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
