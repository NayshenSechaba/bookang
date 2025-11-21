import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star, MapPin, Phone, Mail, Clock, Instagram, Facebook, Twitter, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface BusinessData {
  id: string;
  business_name: string;
  full_name: string;
  business_description: string;
  avatar_url: string;
  banner_url: string;
  business_phone: string;
  business_email: string;
  business_address: string;
  business_city: string;
  business_province: string;
  latitude: number;
  longitude: number;
  business_hours: any;
  instagram_url: string;
  facebook_url: string;
  twitter_url: string;
  tiktok_url: string;
  ratings: number;
}

const BusinessProfile = () => {
  const { businessId } = useParams();
  const [business, setBusiness] = useState<BusinessData | null>(null);
  const [services, setServices] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [portfolioImages, setPortfolioImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (businessId) {
      fetchBusinessData();
    }
  }, [businessId]);

  const fetchBusinessData = async () => {
    try {
      // Fetch business profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', businessId)
        .single();

      if (profileError) throw profileError;
      setBusiness(profileData);

      // Fetch hairdresser data for services and portfolio
      const { data: hairdresserData } = await supabase
        .from('hairdressers')
        .select('id, portfolio_images')
        .eq('profile_id', businessId)
        .maybeSingle();

      if (hairdresserData) {
        // Fetch services
        const { data: servicesData } = await supabase
          .from('services')
          .select('*')
          .eq('hairdresser_id', hairdresserData.id)
          .eq('is_active', true);

        setServices(servicesData || []);

        // Set portfolio images
        if (hairdresserData.portfolio_images) {
          setPortfolioImages(hairdresserData.portfolio_images);
        }

        // Fetch reviews
        const { data: reviewsData } = await supabase
          .from('reviews')
          .select(`
            *,
            profiles:customer_id (full_name, avatar_url)
          `)
          .eq('hairdresser_id', hairdresserData.id)
          .order('created_at', { ascending: false })
          .limit(10);

        setReviews(reviewsData || []);
      }
    } catch (error) {
      console.error('Error fetching business data:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  const getDayName = (day: string) => {
    return day.charAt(0).toUpperCase() + day.slice(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-blue-600 text-xl">Loading...</div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Business Not Found</h2>
          <p className="text-gray-600">The business you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Cover Image */}
      <div className="relative h-64 w-full">
        {business.banner_url ? (
          <img
            src={business.banner_url}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-blue-400 to-blue-600" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      {/* Business Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative">
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6 mb-8">
          {/* Avatar */}
          <Avatar className="h-40 w-40 border-4 border-white shadow-lg">
            <AvatarImage src={business.avatar_url} alt={business.business_name} />
            <AvatarFallback className="bg-blue-600 text-white text-4xl">
              {business.business_name?.charAt(0) || 'B'}
            </AvatarFallback>
          </Avatar>

          {/* Business Name and Info */}
          <div className="flex-1 bg-white/95 backdrop-blur rounded-lg p-6 shadow-lg">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {business.business_name || business.full_name}
            </h1>
            <p className="text-gray-600 mb-4">{business.business_description}</p>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex">{renderStars(business.ratings || 0)}</div>
              <span className="text-sm text-gray-600">
                {business.ratings?.toFixed(1) || '0.0'} ({reviews.length} reviews)
              </span>
            </div>

            {/* Contact Info */}
            <div className="flex flex-wrap gap-4 text-sm">
              {business.business_phone && (
                <div className="flex items-center gap-2 text-blue-600">
                  <Phone className="h-4 w-4" />
                  <span>{business.business_phone}</span>
                </div>
              )}
              {business.business_email && (
                <div className="flex items-center gap-2 text-blue-600">
                  <Mail className="h-4 w-4" />
                  <span>{business.business_email}</span>
                </div>
              )}
              {business.business_address && (
                <div className="flex items-center gap-2 text-blue-600">
                  <MapPin className="h-4 w-4" />
                  <span>{business.business_address}, {business.business_city}</span>
                </div>
              )}
            </div>

            {/* Social Media */}
            <div className="flex gap-3 mt-4">
              {business.instagram_url && (
                <a
                  href={business.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                >
                  <Instagram className="h-5 w-5" />
                </a>
              )}
              {business.facebook_url && (
                <a
                  href={business.facebook_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                >
                  <Facebook className="h-5 w-5" />
                </a>
              )}
              {business.twitter_url && (
                <a
                  href={business.twitter_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                >
                  <Twitter className="h-5 w-5" />
                </a>
              )}
            </div>

            {/* Book Now Button */}
            <Button className="mt-6 bg-blue-600 hover:bg-blue-700 text-white">
              <Calendar className="mr-2 h-4 w-4" />
              Book Appointment
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="services" className="mb-12">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="services" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              Services
            </TabsTrigger>
            <TabsTrigger value="portfolio" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              Portfolio
            </TabsTrigger>
            <TabsTrigger value="reviews" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              Reviews
            </TabsTrigger>
            <TabsTrigger value="hours" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              Hours & Location
            </TabsTrigger>
          </TabsList>

          {/* Services Tab */}
          <TabsContent value="services">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.length === 0 ? (
                <p className="text-gray-600 col-span-full text-center py-8">
                  No services available
                </p>
              ) : (
                services.map((service) => (
                  <Card key={service.id} className="border-blue-200 hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-blue-900">{service.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 text-sm mb-4">{service.description}</p>
                      <div className="flex justify-between items-center">
                        <Badge className="bg-blue-600 text-white">R{service.price}</Badge>
                        <span className="text-sm text-gray-600">{service.duration_minutes} min</span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Portfolio Tab */}
          <TabsContent value="portfolio">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {portfolioImages.length === 0 ? (
                <p className="text-gray-600 col-span-full text-center py-8">
                  No portfolio images available
                </p>
              ) : (
                portfolioImages.map((image, index) => (
                  <div
                    key={index}
                    className="aspect-square rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow"
                  >
                    <img
                      src={image}
                      alt={`Portfolio ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews">
            <div className="space-y-4">
              {reviews.length === 0 ? (
                <p className="text-gray-600 text-center py-8">No reviews yet</p>
              ) : (
                reviews.map((review) => (
                  <Card key={review.id} className="border-blue-200">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <Avatar>
                          <AvatarImage src={review.profiles?.avatar_url} />
                          <AvatarFallback className="bg-blue-600 text-white">
                            {review.profiles?.full_name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-gray-900">
                              {review.profiles?.full_name || 'Anonymous'}
                            </h4>
                            <div className="flex">{renderStars(review.rating)}</div>
                          </div>
                          <p className="text-gray-600 text-sm">{review.comment}</p>
                          <p className="text-xs text-gray-400 mt-2">
                            {new Date(review.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Hours & Location Tab */}
          <TabsContent value="hours">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Business Hours */}
              <Card className="border-blue-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-900">
                    <Clock className="h-5 w-5 text-blue-600" />
                    Business Hours
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {business.business_hours &&
                      Object.entries(business.business_hours).map(([day, hours]: [string, any]) => (
                        <div key={day} className="flex justify-between py-2 border-b border-blue-100 last:border-0">
                          <span className="font-medium text-gray-700">{getDayName(day)}</span>
                          <span className="text-gray-600">
                            {hours.closed ? (
                              <Badge variant="outline" className="border-blue-600 text-blue-600">Closed</Badge>
                            ) : (
                              `${hours.open} - ${hours.close}`
                            )}
                          </span>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              {/* Map Placeholder */}
              <Card className="border-blue-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-900">
                    <MapPin className="h-5 w-5 text-blue-600" />
                    Location
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {business.latitude && business.longitude ? (
                    <div className="h-64 bg-blue-100 rounded-lg flex items-center justify-center">
                      <p className="text-blue-600">Map view (requires Mapbox integration)</p>
                    </div>
                  ) : (
                    <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                      <p className="text-gray-500">No location available</p>
                    </div>
                  )}
                  {business.business_address && (
                    <div className="mt-4 text-sm text-gray-600">
                      <p>{business.business_address}</p>
                      <p>{business.business_city}, {business.business_province}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default BusinessProfile;