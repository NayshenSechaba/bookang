import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Star, Calendar, Users, MapPin, Phone, Mail, HelpCircle, UserCheck, Clock, CheckCircle, Store, LogOut, Bell, User as UserIcon, Settings, ChevronDown } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import AuthModal from '@/components/AuthModal';
import EnhancedRegistrationModal from '@/components/EnhancedRegistrationModal';
import CustomerDashboard from '@/components/CustomerDashboard';
import HairdresserDashboard from '@/components/HairdresserDashboard';
import EmployeeDashboard from '@/components/EmployeeDashboard';
import AppointmentsPage from '@/components/AppointmentsPage';
import ExplorePage from '@/components/ExplorePage';
import FAQSection from '@/components/FAQSection';
import SMEOnboarding from '@/components/SMEOnboarding';
import ProfileCompletionModal from '@/components/ProfileCompletionModal';
import AccountSettings from '@/components/AccountSettings';
import BusinessProfile from '@/pages/BusinessProfile';
import { InboxView } from '@/components/InboxView';
import { NotificationCenter } from '@/components/NotificationCenter';
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from '@supabase/supabase-js';
import { sendTestSMS } from '@/utils/sendTestSMS';
import bookangLogo from '@/assets/bookang-logo.png';
import heroSalon from '@/assets/hero-salon-1.jpg';
import heroBarbershop from '@/assets/hero-barbershop.jpg';
import heroSpa from '@/assets/hero-spa.jpg';
import heroNails from '@/assets/hero-nails.jpg';

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
  const [businessProfileId, setBusinessProfileId] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showSMEOnboarding, setShowSMEOnboarding] = useState(false);
  const [showProfileCompletionModal, setShowProfileCompletionModal] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(true);
  const [mobileAccountOpen, setMobileAccountOpen] = useState(false);
  
  // Swipe gesture state
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSwipeActive, setIsSwipeActive] = useState(false);
  
  // Pull-to-refresh state
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Hero slideshow state
  const [currentSlide, setCurrentSlide] = useState(0);
  const heroImages = [heroSalon, heroBarbershop, heroSpa, heroNails];

  // Hero slideshow auto-rotate
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [heroImages.length]);

  // Set up Supabase auth listener
  useEffect(() => {
    // Set up auth state listener
    const {
      data: {
        subscription
      }
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        // Fetch user profile to get role and name
        setTimeout(async () => {
          try {
            const {
              data: profile
            } = await supabase.from('profiles').select('full_name, role').eq('user_id', session.user.id).single();
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
    });

    // Check for existing session
    supabase.auth.getSession().then(({
      data: {
        session
      }
    }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        // Fetch user profile
        supabase.from('profiles').select('full_name, role, business_name, business_description, contact_number, phone, address, email, payment_verified').eq('user_id', session.user.id).single().then(({
          data: profile
        }) => {
          if (profile) {
            setUserRole(profile.role === 'salon_owner' ? 'employee' : profile.role);
            setUserName(profile.full_name || session.user.email?.split('@')[0] || 'User');
            setCurrentPage('dashboard');

            // Check if profile is incomplete for business users
            if (profile.role === 'hairdresser' || profile.role === 'salon_owner') {
              const isProfileIncomplete = !profile.business_name || !profile.business_description || !profile.contact_number && !profile.phone || !profile.address || !profile.email || !profile.payment_verified;
              if (isProfileIncomplete) {
                setShowProfileCompletionModal(true);
              }
            }
          }
        });
      }
    });
    return () => subscription.unsubscribe();
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

  // Swipe gesture handlers
  const minSwipeDistance = 100;

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    setIsSwipeActive(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSwipeActive) return;
    setTouchEnd(e.targetTouches[0].clientX);
    
    if (touchStart !== null) {
      const currentTouch = e.targetTouches[0].clientX;
      const distance = currentTouch - touchStart;
      
      // Only allow swipe from left edge to open (when closed)
      if (!isMobileMenuOpen && touchStart < 50 && distance > 0) {
        setSwipeOffset(Math.min(distance, 300));
      }
      // Allow swipe right to close (when open)
      else if (isMobileMenuOpen && distance > 0) {
        setSwipeOffset(distance);
      }
    }
  };

  const handleTouchEnd = () => {
    if (!isSwipeActive || touchStart === null || touchEnd === null) {
      setIsSwipeActive(false);
      setSwipeOffset(0);
      return;
    }

    const distance = touchEnd - touchStart;
    const isLeftSwipe = distance < -minSwipeDistance;
    const isRightSwipe = distance > minSwipeDistance;

    // Swipe right from left edge to open menu
    if (!isMobileMenuOpen && isRightSwipe && touchStart < 50) {
      setIsMobileMenuOpen(true);
    }
    // Swipe right to close menu
    else if (isMobileMenuOpen && isRightSwipe) {
      setIsMobileMenuOpen(false);
    }

    setSwipeOffset(0);
    setIsSwipeActive(false);
    setTouchStart(null);
    setTouchEnd(null);
  };

  // Pull-to-refresh handlers
  const handlePullStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    const target = e.target as HTMLElement;
    const mainElement = target.closest('main');
    
    if (mainElement && mainElement.scrollTop === 0) {
      setTouchStart(touch.clientY);
      setIsPulling(true);
    }
  };

  const handlePullMove = (e: React.TouchEvent) => {
    if (!isPulling || touchStart === null || isRefreshing) return;
    
    const touch = e.touches[0];
    const distance = touch.clientY - touchStart;
    
    if (distance > 0) {
      setPullDistance(Math.min(distance, 150));
    }
  };

  const handlePullEnd = async () => {
    if (!isPulling) return;
    
    const threshold = 80;
    if (pullDistance > threshold && !isRefreshing) {
      setIsRefreshing(true);
      
      // Trigger data refresh by updating the key
      setRefreshKey(prev => prev + 1);
      
      // Simulate refresh delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsRefreshing(false);
    }
    
    setPullDistance(0);
    setIsPulling(false);
    setTouchStart(null);
  };

  // Navigation items for authenticated users
  const getNavItems = () => {
    const baseItems = [{
      id: 'home',
      label: 'Home',
      icon: Users
    }, {
      id: 'explore',
      label: 'Explore',
      icon: MapPin
    }, {
      id: 'settings',
      label: 'Account settings',
      icon: Settings
    }];
    if (user) {
      baseItems.splice(1, 0, {
        id: 'dashboard',
        label: 'Dashboard',
        icon: Calendar
      });
      baseItems.splice(2, 0, {
        id: 'appointments',
        label: 'My Appointments',
        icon: Clock
      });
      baseItems.splice(3, 0, {
        id: 'inbox',
        label: 'Inbox',
        icon: Mail
      });
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
      return <SMEOnboarding onComplete={handleSMEOnboardingComplete} onBack={() => setShowSMEOnboarding(false)} />;
    }
    switch (currentPage) {
      case 'dashboard':
        if (!user) return renderHomePage();
        if (userRole === 'customer') return <CustomerDashboard userName={userName} onNavigate={setCurrentPage} />;
        if (userRole === 'hairdresser') return <HairdresserDashboard userName={userName} />;
        if (userRole === 'employee') return <EmployeeDashboard userName={userName} />;
        return renderHomePage();
      case 'settings':
      case 'account-settings':
        return user ? <AccountSettings userName={userName} /> : renderHomePage();
      case 'appointments':
        return <AppointmentsPage userName={userName} />;
      case 'inbox':
        return user ? <InboxView /> : renderHomePage();
      case 'explore':
        return <ExplorePage />;
      case 'business-profile':
        return businessProfileId ? <BusinessProfile /> : renderHomePage();
      case 'faq':
        return <FAQSection />;
      default:
        return renderHomePage();
    }
  };

  // Home page content
  const renderHomePage = () => <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-25 to-white">
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden min-h-[600px] flex items-center">
        {/* Background Slideshow */}
        <div className="absolute inset-0 z-0">
          {heroImages.map((image, index) => (
            <div
              key={index}
              className="absolute inset-0 transition-opacity duration-1000"
              style={{
                opacity: currentSlide === index ? 1 : 0,
                backgroundImage: `url(${image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
          ))}
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-black/50" />
        </div>

        {/* Content */}
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <div className="mb-8">
            
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight drop-shadow-lg">
            Booked in Seconds. Managed with Ease.
          </h1>
          
          <p className="text-xl text-white mb-8 max-w-3xl mx-auto drop-shadow-md">The all-in-one client management and booking platform.</p>

          {/* Authentication Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button size="lg" className="w-full sm:w-auto bg-white hover:bg-gray-100 text-blue-600 px-8 py-3 shadow-lg font-semibold" onClick={() => openAuthModal('login', 'customer')}>
              Book Services
            </Button>
            
            <Button size="lg" variant="outline" className="w-full sm:w-auto bg-white/90 hover:bg-white border-white text-blue-600 hover:text-blue-700 px-8 py-3 shadow-lg font-semibold" onClick={() => setShowSMEOnboarding(true)}>
              <Store className="mr-2 h-4 w-4" />
              List Your Business
            </Button>
            
            <Button size="lg" variant="outline" className="w-full sm:w-auto bg-white/90 hover:bg-white border-white text-blue-600 hover:text-blue-700 px-8 py-3 shadow-lg font-semibold" onClick={() => openAuthModal('login')}>
              Login
            </Button>
            
            <Button size="lg" variant="outline" className="w-full sm:w-auto bg-white/90 hover:bg-white border-white text-blue-600 hover:text-blue-700 px-8 py-3 shadow-lg font-semibold" onClick={() => openAuthModal('login', 'hairdresser')}>
              <Store className="mr-2 h-4 w-4" />
              Service Provider Login
            </Button>
            
            
          </div>
          
          {/* Slideshow indicators */}
          <div className="flex justify-center gap-2">
            {heroImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  currentSlide === index 
                    ? 'bg-white w-8' 
                    : 'bg-white/50 hover:bg-white/75'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Features Section with CTA Buttons */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center border-blue-100 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => user ? setCurrentPage('dashboard') : openAuthModal('login', 'customer')}>
              <CardHeader>
                <Calendar className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle className="text-blue-900">24/7 Online Booking</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 mb-4">
                  Secure 24/7 online booking, allowing clients to schedule any service from legal consultations to coaching sessions.
                </CardDescription>
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" onClick={e => {
                e.stopPropagation();
                if (user) {
                  setCurrentPage('dashboard');
                  localStorage.setItem('salonconnect_current_page', 'dashboard');
                } else {
                  openAuthModal('login', 'customer');
                }
              }}>
                  Start Booking
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center border-blue-100 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => {
            setCurrentPage('explore');
            localStorage.setItem('salonconnect_current_page', 'explore');
          }}>
              <CardHeader>
                <Star className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle className="text-blue-900">Quality Services</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 mb-4">
                  Connect with verified, professional service providers with excellent reviews and ratings.
                </CardDescription>
                <Button variant="outline" className="w-full border-blue-600 text-blue-600 hover:bg-blue-50" onClick={e => {
                e.stopPropagation();
                setCurrentPage('explore');
                localStorage.setItem('salonconnect_current_page', 'explore');
              }}>
                  Browse Services
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center border-blue-100 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => openAuthModal('register', 'hairdresser')}>
              <CardHeader>
                <Store className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle className="text-blue-900">List Your Business</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 mb-4">
                  Join our platform as a service provider and grow your business with online bookings.
                </CardDescription>
                <Button variant="outline" className="w-full border-blue-600 text-blue-600 hover:bg-blue-50" onClick={e => {
                e.stopPropagation();
                openAuthModal('register', 'hairdresser');
              }}>
                  Join as Business
                </Button>
              </CardContent>
            </Card>

          </div>
        </div>
      </section>

      {/* Quick Access Section */}
      <section className="py-16 px-4 bg-neutral-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Quick Access</h2>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex-col gap-2 bg-white hover:bg-blue-50 border-blue-200" onClick={() => setCurrentPage('explore')}>
              <MapPin className="h-6 w-6 text-blue-600" />
              Explore Service Providers
            </Button>
            
            
            <Button variant="outline" className="h-20 flex-col gap-2 bg-white hover:bg-blue-50 border-blue-200" onClick={() => setCurrentPage('settings')}>
              <Settings className="h-6 w-6 text-blue-600" />
              Account settings
            </Button>
            
            <Button variant="outline" className="h-20 flex-col gap-2 bg-white hover:bg-blue-50 border-blue-200" onClick={handleLogout}>
              <LogOut className="h-6 w-6 text-blue-600" />
              Logout
            </Button>
            
            
          </div>
        </div>
      </section>
    </div>;
  return <div 
    className="min-h-screen bg-background"
    onTouchStart={handleTouchStart}
    onTouchMove={handleTouchMove}
    onTouchEnd={handleTouchEnd}
  >
      {/* Application Name */}
      <div className="bg-primary text-primary-foreground text-center py-5 font-semibold text-3xl">Bookang</div>
      
      {/* Navigation Header */}
      <nav className="bg-primary shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <img src={bookangLogo} alt="Bookang - Your smart booking platform" className="h-20" />
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              {getNavItems().map(item => {
                if (item.id === 'settings' && user) {
                  return (
                    <DropdownMenu key={item.id}>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="text-primary-foreground hover:bg-primary/10">
                          <item.icon className="mr-2 h-4 w-4 text-primary-foreground" />
                          {item.label}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => {
                          setCurrentPage('settings');
                          localStorage.setItem('salonconnect_current_page', 'settings');
                        }}>
                          <Settings className="mr-2 h-4 w-4" />
                          Account Settings
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleLogout} className="text-blue-600">
                          <LogOut className="mr-2 h-4 w-4" />
                          Logout
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  );
                }
                return (
                  <Button key={item.id} variant="ghost" className="text-primary-foreground hover:bg-primary/10" onClick={() => {
                    setCurrentPage(item.id);
                    localStorage.setItem('salonconnect_current_page', item.id);
                  }}>
                    <item.icon className="mr-2 h-4 w-4 text-primary-foreground" />
                    {item.label}
                  </Button>
                );
              })}
              
              {user && <NotificationCenter onNavigateToInbox={() => setCurrentPage('inbox')} />}
              
              {!user && <Button variant="outline" size="sm" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary" onClick={() => openAuthModal('login')}>
                  Login
                </Button>}
            </div>

            {/* Mobile Menu Button */}
            <Button variant="ghost" size="sm" className="md:hidden text-primary-foreground hover:bg-primary/90" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              <div className="space-y-1">
                <div className="w-5 h-0.5 bg-primary-foreground"></div>
                <div className="w-5 h-0.5 bg-primary-foreground"></div>
                <div className="w-5 h-0.5 bg-primary-foreground"></div>
              </div>
            </Button>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <>
              {/* Backdrop */}
              <div 
                className="fixed inset-0 bg-black/50 z-40 md:hidden animate-fade-in"
                onClick={() => setIsMobileMenuOpen(false)}
                style={{
                  opacity: isSwipeActive ? Math.max(0, 1 - swipeOffset / 300) : 1
                }}
              />
              
              {/* Mobile Menu */}
              <div 
                className="fixed top-0 left-0 bottom-0 w-[300px] bg-primary border-r border-primary-foreground/20 z-50 md:hidden overflow-y-auto"
                style={{
                  transform: isSwipeActive 
                    ? `translateX(${Math.min(swipeOffset, 0)}px)` 
                    : 'translateX(0)',
                  transition: isSwipeActive ? 'none' : 'transform 0.3s ease-out'
                }}
              >
                <div className="py-4 px-2">
                  <div className="flex flex-col space-y-2">
                    {/* Main Navigation Group */}
                    <Collapsible open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
                      <CollapsibleTrigger asChild>
                        <Button 
                          variant="ghost" 
                          className="w-full justify-between text-primary-foreground hover:bg-primary/80"
                        >
                          <span className="font-semibold">Navigation</span>
                          <ChevronDown className={`h-4 w-4 transition-transform ${mobileNavOpen ? 'rotate-180' : ''}`} />
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="space-y-1 pt-2">
                        {getNavItems()
                          .filter(item => item.id !== 'settings')
                          .map(item => (
                            <Button 
                              key={item.id} 
                              variant={currentPage === item.id ? "secondary" : "ghost"}
                              className={`w-full justify-start ${
                                currentPage === item.id 
                                  ? "bg-accent text-accent-foreground" 
                                  : "text-primary-foreground hover:bg-primary/80"
                              }`}
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
                      </CollapsibleContent>
                    </Collapsible>

                    {/* Account Section for logged-in users */}
                    {user && (
                      <Collapsible open={mobileAccountOpen} onOpenChange={setMobileAccountOpen} className="border-t border-primary-foreground/20 pt-2">
                        <CollapsibleTrigger asChild>
                          <Button 
                            variant="ghost" 
                            className="w-full justify-between text-primary-foreground hover:bg-primary/80"
                          >
                            <div className="flex items-center">
                              <UserIcon className="mr-2 h-4 w-4" />
                              <span className="font-semibold">Account</span>
                            </div>
                            <ChevronDown className={`h-4 w-4 transition-transform ${mobileAccountOpen ? 'rotate-180' : ''}`} />
                          </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="space-y-1 pt-2">
                          <div className="px-3 py-2 text-sm text-primary-foreground/80">
                            Welcome, <span className="font-medium text-accent">{userName}</span>
                          </div>
                          <Button 
                            variant={currentPage === 'settings' ? "secondary" : "ghost"}
                            className={`w-full justify-start ${
                              currentPage === 'settings'
                                ? "bg-accent text-accent-foreground"
                                : "text-primary-foreground hover:bg-primary/80"
                            }`}
                            onClick={() => {
                              setCurrentPage('settings');
                              localStorage.setItem('salonconnect_current_page', 'settings');
                              setIsMobileMenuOpen(false);
                            }}
                          >
                            <Settings className="mr-2 h-4 w-4" />
                            Account Settings
                          </Button>
                          <div className="flex items-center justify-end px-3 py-2">
                            <NotificationCenter onNavigateToInbox={() => {
                              setCurrentPage('inbox');
                              setIsMobileMenuOpen(false);
                            }} />
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={handleLogout} 
                            className="w-full border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
                          >
                            <LogOut className="mr-2 h-4 w-4" />
                            Logout
                          </Button>
                        </CollapsibleContent>
                      </Collapsible>
                    )}

                    {/* Login button for non-authenticated users */}
                    {!user && (
                      <div className="pt-2 border-t border-primary-foreground/20">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary" 
                          onClick={() => {
                            openAuthModal('login');
                            setIsMobileMenuOpen(false);
                          }}
                        >
                          Login
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
          
          {/* Swipe indicator - shows when menu is closed on mobile */}
          {!isMobileMenuOpen && (
            <div className="fixed left-0 top-1/2 -translate-y-1/2 w-1 h-16 bg-primary/50 rounded-r-full md:hidden z-30 animate-pulse" />
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main 
        className="relative overflow-y-auto"
        onTouchStart={handlePullStart}
        onTouchMove={handlePullMove}
        onTouchEnd={handlePullEnd}
      >
        {/* Pull-to-refresh indicator */}
        {(isPulling || isRefreshing) && (
          <div 
            className="fixed top-16 left-0 right-0 z-40 flex justify-center items-center transition-all duration-300"
            style={{
              transform: `translateY(${isPulling ? pullDistance : isRefreshing ? 60 : 0}px)`,
              opacity: isPulling ? Math.min(pullDistance / 80, 1) : isRefreshing ? 1 : 0
            }}
          >
            <div className="bg-primary text-primary-foreground rounded-full p-3 shadow-lg">
              {isRefreshing ? (
                <div className="animate-spin h-6 w-6 border-2 border-primary-foreground border-t-transparent rounded-full" />
              ) : (
                <div 
                  className="h-6 w-6 flex items-center justify-center"
                  style={{
                    transform: `rotate(${pullDistance * 2}deg)`
                  }}
                >
                  ↻
                </div>
              )}
            </div>
          </div>
        )}
        
        <div key={refreshKey}>
          {renderCurrentPage()}
        </div>
      </main>

      {/* Authentication Modals */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} mode={authMode} loginType={loginType} onAuthSuccess={handleAuthSuccess} onSwitchMode={newMode => {
      if (newMode === 'register') {
        setShowAuthModal(false);
        setShowRegistrationModal(true);
      } else {
        setAuthMode(newMode);
      }
    }} />

      <EnhancedRegistrationModal isOpen={showRegistrationModal} onClose={() => setShowRegistrationModal(false)} onAuthSuccess={handleAuthSuccess} onSwitchToLogin={() => {
      setShowRegistrationModal(false);
      setAuthMode('login');
      setShowAuthModal(true);
    }} defaultRole={loginType} />

      <ProfileCompletionModal isOpen={showProfileCompletionModal} onClose={() => setShowProfileCompletionModal(false)} />

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <img src={bookangLogo} alt="Bookang" className="h-8 brightness-0 invert" />
              </div>
              <p className="text-primary-foreground/80 text-sm">
                Your smart booking platform - Connecting customers with professional service providers.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <div className="space-y-2">
                <p className="text-primary-foreground/80 hover:text-accent cursor-pointer text-sm" onClick={() => setCurrentPage('explore')}>
                  Explore Services
                </p>
                <p className="text-primary-foreground/80 hover:text-accent cursor-pointer text-sm" onClick={() => openAuthModal('register')}>
                  Register
                </p>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <div className="space-y-2">
                <p className="text-primary-foreground/80 hover:text-accent cursor-pointer text-sm" onClick={() => setCurrentPage('settings')}>
                  Account settings
                </p>
                <p className="text-primary-foreground/80 hover:text-accent cursor-pointer text-sm">Help Center</p>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Contact</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-primary-foreground/80 text-sm">
                  <Mail className="h-4 w-4 text-royal-blue" />
                  <span>admin@bookang.co.za</span>
                </div>
                <div className="flex items-center space-x-2 text-primary-foreground/80 text-sm">
                  
                  
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-primary-foreground/20 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center">
            <p className="text-primary-foreground/80 text-sm mb-4 sm:mb-0">&copy; 2024 Bookang. All rights reserved.</p>
            
            {/* Employee Login Button */}
            <Button variant="outline" size="sm" className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white" onClick={() => openAuthModal('login', 'employee')}>
              <UserCheck className="mr-2 h-4 w-4" />
              Employee Login
            </Button>
          </div>
        </div>
      </footer>
    </div>;
};
export default Index;