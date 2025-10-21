import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Star, Scissors, Calendar, Users, MapPin, Phone, Mail, HelpCircle, UserCheck, Clock, CheckCircle, Store, LogOut } from 'lucide-react';
import AuthModal from '@/components/AuthModal';
import EnhancedRegistrationModal from '@/components/EnhancedRegistrationModal';
import CustomerDashboard from '@/components/CustomerDashboard';
import HairdresserDashboard from '@/components/HairdresserDashboard';
import EmployeeDashboard from '@/components/EmployeeDashboard';
import AppointmentsPage from '@/components/AppointmentsPage';
import ExplorePage from '@/components/ExplorePage';
import FAQSection from '@/components/FAQSection';
import ContactSection from '@/components/ContactSection';
import SMEOnboarding from '@/components/SMEOnboarding';
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from '@supabase/supabase-js';
import { sendTestSMS } from '@/utils/sendTestSMS';
import { TestEmailButton } from '@/components/TestEmailButton';

// Make sendTestSMS available globally for console testing
(window as any).sendTestSMS = sendTestSMS;


const Index = () => {
  // Supabase authentication state
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<'customer' | 'hairdresser' | 'employee' | null>(null);
  const [userName, setUserName] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [loginType, setLoginType] = useState<'customer' | 'hairdresser' | 'employee'>('customer');
  
  // Navigation state 
  const [currentPage, setCurrentPage] = useState('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showSMEOnboarding, setShowSMEOnboarding] = useState(false);

  // Set up Supabase auth listener
  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch user profile to get role and name
          setTimeout(async () => {
            try {
              const { data: profile } = await supabase
                .from('profiles')
                .select('full_name, role')
                .eq('user_id', session.user.id)
                .single();
              
              if (profile) {
                setUserRole(profile.role === 'salon_owner' ? 'employee' : profile.role);
                setUserName(profile.full_name || session.user.email?.split('@')[0] || 'User');
                setCurrentPage('dashboard');
              }
            } catch (error) {
              console.error('Error fetching profile:', error);
            }
          }, 0);
        } else {
          setUserRole(null);
          setUserName('');
          setCurrentPage('home');
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Fetch user profile
        supabase
          .from('profiles')
          .select('full_name, role')
          .eq('user_id', session.user.id)
          .single()
          .then(({ data: profile }) => {
            if (profile) {
              setUserRole(profile.role === 'salon_owner' ? 'employee' : profile.role);
              setUserName(profile.full_name || session.user.email?.split('@')[0] || 'User');
              setCurrentPage('dashboard');
            }
          });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Send test SMS on mount - run every time for testing
  useEffect(() => {
    const sendSMS = async () => {
      try {
        console.log('Attempting to send test SMS to Sechaba at 0712284870...');
        const result = await sendTestSMS('0712284870', 'Sechaba');
        console.log('Test SMS sent successfully!', result);
      } catch (error) {
        console.error('Failed to send test SMS:', error);
      }
    };
    
    // Send SMS - will run on every page load for testing
    sendSMS();
  }, []);

  // Handle successful authentication
  const handleAuthSuccess = (role: 'customer' | 'hairdresser' | 'employee', name: string) => {
    setUserRole(role);
    setUserName(name);
    setShowAuthModal(false);
    setShowRegistrationModal(false);
    setCurrentPage('dashboard');
  };

  // Handle logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setUserRole(null);
    setUserName('');
    setCurrentPage('home');
  };

  // Open authentication modal with specific mode
  const openAuthModal = (mode: 'login' | 'register', type?: 'customer' | 'hairdresser' | 'employee') => {
    if (mode === 'register') {
      setLoginType(type || 'customer');
      setShowRegistrationModal(true);
    } else {
      setAuthMode(mode);
      if (type) setLoginType(type);
      setShowAuthModal(true);
    }
  };

  // Navigation items for authenticated users
  const getNavItems = () => {
    const baseItems = [
      { id: 'home', label: 'Home', icon: Users },
      { id: 'explore', label: 'Explore', icon: MapPin },
      { id: 'faq', label: 'FAQ', icon: HelpCircle },
      { id: 'contact', label: 'Contact', icon: Phone },
    ];

    if (user) {
      baseItems.splice(1, 0, { id: 'dashboard', label: 'Dashboard', icon: Calendar });
      baseItems.splice(2, 0, { id: 'appointments', label: 'My Appointments', icon: Clock });
    }

    return baseItems;
  };


  // Handle SME onboarding
  const handleSMEOnboardingComplete = () => {
    setShowSMEOnboarding(false);
    setCurrentPage('dashboard');
  };

  // Render current page content
  const renderCurrentPage = () => {
    if (showSMEOnboarding) {
      return (
        <SMEOnboarding 
          onComplete={handleSMEOnboardingComplete}
          onBack={() => setShowSMEOnboarding(false)}
        />
      );
    }

    switch (currentPage) {
      case 'dashboard':
        if (!user) return renderHomePage();
        if (userRole === 'customer') return <CustomerDashboard userName={userName} onNavigate={setCurrentPage} />;
        if (userRole === 'hairdresser') return <HairdresserDashboard userName={userName} />;
        if (userRole === 'employee') return <EmployeeDashboard userName={userName} />;
        return renderHomePage();
      case 'appointments':
        return <AppointmentsPage userName={userName} />;
      case 'explore':
        return <ExplorePage />;
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
            Welcome to <span className="text-purple-600">Bookang</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Connect with professional service providers, book appointments seamlessly, and discover quality services in your area. Your perfect booking experience awaits.
          </p>

          {/* Authentication Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button 
              size="lg" 
              className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white px-8 py-3"
              onClick={() => openAuthModal('login', 'customer')}
            >
              Book Services
            </Button>
            
            <Button 
              size="lg" 
              variant="outline" 
              className="w-full sm:w-auto border-purple-600 text-purple-600 hover:bg-purple-50 px-8 py-3"
              onClick={() => setShowSMEOnboarding(true)}
            >
              <Store className="mr-2 h-4 w-4" />
              List Your Business
            </Button>
            
            <Button 
              size="lg" 
              variant="outline" 
              className="w-full sm:w-auto border-gray-600 text-gray-700 hover:bg-gray-50 px-8 py-3"
              onClick={() => openAuthModal('login')}
            >
              Login
            </Button>
            
            <Button 
              size="lg" 
              variant="outline" 
              className="w-full sm:w-auto border-green-600 text-green-700 hover:bg-green-50 px-8 py-3"
              onClick={() => openAuthModal('login', 'hairdresser')}
            >
              <Store className="mr-2 h-4 w-4" />
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
            
            <TestEmailButton />
          </div>
        </div>
      </section>

      {/* Features Section with CTA Buttons */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Choose Bookang?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center border-purple-100 hover:shadow-lg transition-shadow cursor-pointer" 
                  onClick={() => user ? setCurrentPage('dashboard') : openAuthModal('login', 'customer')}>
              <CardHeader>
                <Calendar className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <CardTitle className="text-purple-900">Easy Book</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 mb-4">
                  Book appointments with your favorite hairdressers in just a few clicks. Simple, fast, and convenient.
                </CardDescription>
                <Button 
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (user) {
                      setCurrentPage('dashboard');
                      localStorage.setItem('salonconnect_current_page', 'dashboard');
                    } else {
                      openAuthModal('login', 'customer');
                    }
                  }}
                >
                  Start Booking
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center border-pink-100 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => {
                    setCurrentPage('explore');
                    localStorage.setItem('salonconnect_current_page', 'explore');
                  }}>
              <CardHeader>
                <Star className="h-12 w-12 text-pink-600 mx-auto mb-4" />
                <CardTitle className="text-pink-900">Quality Services</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 mb-4">
                  Connect with verified, professional hairdressers with excellent reviews and ratings.
                </CardDescription>
                <Button 
                  variant="outline"
                  className="w-full border-pink-600 text-pink-600 hover:bg-pink-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentPage('explore');
                    localStorage.setItem('salonconnect_current_page', 'explore');
                  }}
                >
                  Browse Services
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center border-green-100 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => openAuthModal('register', 'hairdresser')}>
              <CardHeader>
                <Store className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <CardTitle className="text-green-900">List Your Business</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 mb-4">
                  Join our platform as a professional hairdresser and grow your business.
                </CardDescription>
                <Button 
                  variant="outline"
                  className="w-full border-green-600 text-green-600 hover:bg-green-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    openAuthModal('register', 'hairdresser');
                  }}
                >
                  Join as Business
                </Button>
              </CardContent>
            </Card>

          </div>
        </div>
      </section>

      {/* Quick Access Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-purple-100 to-pink-100">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Quick Access</h2>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
              <span className="text-2xl font-bold text-gray-900">Bookang</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              {getNavItems().map((item) => (
                 <Button
                   key={item.id}
                   variant={currentPage === item.id ? "default" : "ghost"}
                   className={currentPage === item.id ? "bg-purple-600 text-white" : "text-gray-600 hover:text-purple-600"}
                   onClick={() => {
                     setCurrentPage(item.id);
                     localStorage.setItem('salonconnect_current_page', item.id);
                   }}
                 >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.label}
                </Button>
              ))}
              
              {!user && (
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-gray-600 text-gray-700 hover:bg-gray-50"
                  onClick={() => openAuthModal('login')}
                >
                  Login
                </Button>
              )}
              
              {user && (
                <div className="flex items-center space-x-3 pl-4 border-l">
                  <span className="text-sm text-gray-600">
                    Welcome, <span className="font-medium text-purple-600">{userName}</span>
                  </span>
                  <Button variant="outline" size="sm" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
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
                       localStorage.setItem('salonconnect_current_page', item.id);
                       setIsMobileMenuOpen(false);
                     }}
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.label}
                  </Button>
                ))}
                
                {!user && (
                  <div className="pt-4 border-t">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="w-full border-gray-600 text-gray-700 hover:bg-gray-50"
                      onClick={() => {
                        openAuthModal('login');
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      Login
                    </Button>
                  </div>
                )}
                
                {user && (
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

      {/* Authentication Modals */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode={authMode}
        loginType={loginType}
        onAuthSuccess={handleAuthSuccess}
        onSwitchMode={(newMode) => {
          if (newMode === 'register') {
            setShowAuthModal(false);
            setShowRegistrationModal(true);
          } else {
            setAuthMode(newMode);
          }
        }}
      />

      <EnhancedRegistrationModal
        isOpen={showRegistrationModal}
        onClose={() => setShowRegistrationModal(false)}
        onAuthSuccess={handleAuthSuccess}
        onSwitchToLogin={() => {
          setShowRegistrationModal(false);
          setAuthMode('login');
          setShowAuthModal(true);
        }}
        defaultRole={loginType}
      />

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Scissors className="h-6 w-6 text-purple-400" />
                <span className="text-xl font-bold">Bookang</span>
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
                  <span>support@bookang.com</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-400">
                  <Phone className="h-4 w-4" />
                  <span>+1 (555) 123-4567</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center">
            <p className="text-gray-400 mb-4 sm:mb-0">&copy; 2024 Bookang. All rights reserved.</p>
            
            {/* Employee Login Button */}
            <Button
              variant="outline"
              size="sm"
              className="border-orange-500 text-orange-400 hover:bg-orange-500 hover:text-white"
              onClick={() => openAuthModal('login', 'employee')}
            >
              <UserCheck className="mr-2 h-4 w-4" />
              Employee Login
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
