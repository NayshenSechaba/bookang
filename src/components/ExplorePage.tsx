import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, MapPin, Search, Heart, Bookmark, MoreHorizontal, Navigation, X, Calendar, Clock, MessageSquare } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { BusinessReviews } from "@/components/BusinessReviews";

// Define types for better TypeScript support
interface ServiceProviderCoordinates {
  lat: number;
  lng: number;
}

interface ServiceProvider {
  id: string;
  name: string;
  rating: number;
  reviewCount: number;
  location: string;
  specialties: string[];
  priceRange: string;
  image: string;
  distance: string;
  isLiked: boolean;
  isSaved: boolean;
  category: string;
  coordinates: ServiceProviderCoordinates;
  isNew?: boolean;
  calculatedDistance?: number;
  businessType?: string;
  description?: string;
  hairdresserId?: string;
}

const ExplorePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set());
  const [savedItems, setSavedItems] = useState<Set<string>>(new Set());
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  
  // Booking modal state
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<ServiceProvider | null>(null);
  const [bookingData, setBookingData] = useState({
    service: '',
    date: '',
    time: '',
    notes: ''
  });
  
  const { toast } = useToast();

  // South African locations
  const locations = [
    { id: 'all', label: 'All Areas' },
    { id: 'sandton', label: 'Sandton' },
    { id: 'soweto', label: 'Soweto' },
    { id: 'rosebank', label: 'Rosebank' },
    { id: 'alexandra', label: 'Alexandra' },
    { id: 'johannesburg-cbd', label: 'Johannesburg CBD' },
    { id: 'midrand', label: 'Midrand' },
    { id: 'randburg', label: 'Randburg' },
    { id: 'diepsloot', label: 'Diepsloot' },
    { id: 'yeoville', label: 'Yeoville' },
    { id: 'braamfontein', label: 'Braamfontein' },
    { id: 'tembisa', label: 'Tembisa' },
    { id: 'fourways', label: 'Fourways' },
  ];

  // Fetch business profiles from database
  useEffect(() => {
    const fetchProviders = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          hairdressers!hairdressers_profile_id_fkey (
            id
          )
        `)
        .eq('role', 'hairdresser')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching providers:', error);
        return;
      }

      if (data) {
        const mappedProviders: ServiceProvider[] = data.map((profile: any, index) => ({
          id: profile.id,
          name: profile.business_name || profile.full_name || 'Business',
          rating: 4.5 + Math.random() * 0.5,
          reviewCount: Math.floor(Math.random() * 100) + 10,
          location: profile.city || profile.province || 'Location',
          specialties: profile.business_type ? [profile.business_type] : ['Services'],
          priceRange: 'Mid-Range',
          image: profile.avatar_url || '/placeholder.svg',
          distance: `${(Math.random() * 5).toFixed(1)} km`,
          isLiked: false,
          isSaved: false,
          category: index < 3 ? 'popular' : index < 6 ? 'nearby' : 'all',
          coordinates: { lat: -26.2041, lng: 28.0473 },
          isNew: !profile.onboarding_completed,
          businessType: profile.business_type,
          description: profile.business_description,
          hairdresserId: profile.hairdressers?.[0]?.id || null
        }));

        setProviders(mappedProviders);
      }
    };

    fetchProviders();
  }, []);

  // Handle like/unlike
  const toggleLike = (providerId: string) => {
    const newLikedItems = new Set(likedItems);
    if (newLikedItems.has(providerId)) {
      newLikedItems.delete(providerId);
      toast({
        title: "Removed from favorites",
        description: "Service provider removed from your liked list.",
      });
    } else {
      newLikedItems.add(providerId);
      toast({
        title: "Added to favorites",
        description: "Service provider added to your liked list.",
      });
    }
    setLikedItems(newLikedItems);
  };

  // Handle booking
  const handleBooking = (provider: ServiceProvider) => {
    setSelectedProvider(provider);
    setShowBookingModal(true);
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!bookingData.service || !bookingData.date || !bookingData.time) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Booking request sent!",
      description: `Your appointment with ${selectedProvider?.name} has been requested for ${bookingData.date} at ${bookingData.time}.`,
    });

    // Reset form and close modal
    setBookingData({ service: '', date: '', time: '', notes: '' });
    setShowBookingModal(false);
    setSelectedProvider(null);
  };
  const toggleSave = (providerId: string) => {
    const newSavedItems = new Set(savedItems);
    if (newSavedItems.has(providerId)) {
      newSavedItems.delete(providerId);
      toast({
        title: "Removed from saved",
        description: "Service provider removed from your bookmarks.",
      });
    } else {
      newSavedItems.add(providerId);
      toast({
        title: "Saved for later",
        description: "Service provider bookmarked for future reference.",
      });
    }
    setSavedItems(newSavedItems);
  };

  const openProviderDetails = (provider: ServiceProvider) => {
    setSelectedProvider(provider);
    setShowDetailsModal(true);
  };

  const handleBookFromDetails = () => {
    setShowDetailsModal(false);
    setShowBookingModal(true);
  };


  // Filter and sort providers
  const getFilteredProviders = (): ServiceProvider[] => {
    let filtered = providers.map(provider => ({
      ...provider,
      isLiked: likedItems.has(provider.id),
      isSaved: savedItems.has(provider.id)
    }));
    
    if (searchQuery) {
      filtered = filtered.filter(provider => 
        provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        provider.specialties.some((specialty: string) => 
          specialty.toLowerCase().includes(searchQuery.toLowerCase())
        ) ||
        provider.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(provider => provider.category === selectedCategory);
    }

    // Filter by selected location
    if (selectedLocation !== 'all') {
      filtered = filtered.filter(provider => 
        provider.location.toLowerCase() === locations.find(loc => loc.id === selectedLocation)?.label.toLowerCase()
      );
    }
    
    return filtered;
  };


  // Service provider card
  const ProviderCard = ({ provider }: { provider: ServiceProvider }) => (
    <Card className="overflow-hidden border-0 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="relative">
        {/* Image */}
        <div 
          className="aspect-square bg-gradient-to-br from-purple-100 to-pink-100 relative overflow-hidden cursor-pointer"
          onClick={() => handleBooking(provider)}
        >
          <Avatar className="w-full h-full rounded-none">
            <AvatarImage 
              src={provider.image} 
              alt={provider.name}
              className="w-full h-full object-cover"
            />
            <AvatarFallback className="w-full h-full rounded-none bg-gradient-to-br from-purple-100 to-pink-100 text-4xl">
              {provider.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          {/* Overlay badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1">
            {provider.isNew && (
              <Badge className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                NEW
              </Badge>
            )}
            <Badge className="bg-black/70 text-white text-xs px-2 py-1 rounded-full">
              {provider.priceRange}
            </Badge>
          </div>

          {/* Top right actions */}
          <div className="absolute top-3 right-3">
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 bg-black/20 hover:bg-black/40 text-white rounded-full">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>

          {/* Location badge */}
          <div className="absolute bottom-3 right-3">
            <Badge className="text-xs px-2 py-1 rounded-full bg-white/90 text-gray-900">
              <MapPin className="h-3 w-3 mr-1" />
              {provider.location}
            </Badge>
          </div>
        </div>

        {/* Content */}
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">{provider.name}</h3>
              <p className="text-sm text-gray-600 truncate">{provider.location}</p>
            </div>
            
            {/* Rating */}
            <div className="flex items-center ml-2">
              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
              <span className="text-sm font-medium ml-1">{provider.rating}</span>
            </div>
          </div>

          {/* Specialties */}
          <div className="flex flex-wrap gap-1 mb-3">
            {provider.specialties.slice(0, 2).map((specialty: string) => (
              <Badge key={specialty} variant="outline" className="text-xs px-2 py-0.5">
                {specialty}
              </Badge>
            ))}
            {provider.specialties.length > 2 && (
              <Badge variant="outline" className="text-xs px-2 py-0.5">
                +{provider.specialties.length - 2}
              </Badge>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                size="sm" 
                variant="ghost" 
                className="h-8 p-0 hover:bg-transparent"
                onClick={() => toggleLike(provider.id)}
              >
                <Heart className={`h-5 w-5 ${provider.isLiked ? 'text-red-500 fill-red-500' : 'text-gray-600'}`} />
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                className="h-8 p-0 hover:bg-transparent"
                onClick={() => toggleSave(provider.id)}
              >
                <Bookmark className={`h-5 w-5 ${provider.isSaved ? 'text-purple-600 fill-purple-600' : 'text-gray-600'}`} />
              </Button>
              <span className="text-sm text-gray-500">{provider.reviewCount} reviews</span>
            </div>
            
            <Button 
              size="sm" 
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-1.5 rounded-full text-xs"
              onClick={() => openProviderDetails(provider)}
            >
              View Details
            </Button>
          </div>
        </CardContent>
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search service providers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-gray-300 rounded-full bg-gray-50 focus:bg-white"
            />
          </div>

          {/* Location Filter */}
          <div className="mb-4">
            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger className="w-full bg-background">
                <SelectValue placeholder="Filter by location" />
              </SelectTrigger>
              <SelectContent className="bg-background border z-50 max-h-60">
                {locations.map((location) => (
                  <SelectItem key={location.id} value={location.id}>
                    {location.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Category tabs */}
          <div className="flex space-x-1 overflow-x-auto scrollbar-hide">
            {[
              { id: 'all', label: 'All' },
              { id: 'popular', label: 'Popular' },
              { id: 'new', label: 'New' },
              { id: 'nearby', label: 'Nearby' }
            ].map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'default' : 'ghost'}
                onClick={() => setSelectedCategory(category.id)}
                className={`rounded-full px-4 py-2 text-sm whitespace-nowrap ${
                  selectedCategory === category.id 
                    ? 'bg-purple-600 text-white' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {category.label}
              </Button>
            ))}
          </div>

          {/* Favorites Counter */}
          <div className="flex items-center justify-center mt-3 space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <Heart className="h-4 w-4 text-red-500" />
              <span>{likedItems.size} liked</span>
            </div>
            <div className="flex items-center space-x-1">
              <Bookmark className="h-4 w-4 text-purple-600" />
              <span>{savedItems.size} saved</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {getFilteredProviders().map((provider) => (
            <ProviderCard key={provider.id} provider={provider} />
          ))}
        </div>

        {/* Empty state */}
        {getFilteredProviders().length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="h-12 w-12 mx-auto" />
            </div>
            <p className="text-gray-500 text-lg mb-4">No service providers found</p>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="rounded-full"
            >
              Clear filters
            </Button>
          </div>
        )}
      </div>

      {/* Provider Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{selectedProvider?.name}</DialogTitle>
            <DialogDescription>
              {selectedProvider?.location} • {selectedProvider?.distance} away
            </DialogDescription>
          </DialogHeader>

          {selectedProvider && (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="reviews">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Reviews
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4 mt-4">
                {/* Business Image */}
                <div className="w-full h-48 rounded-lg overflow-hidden">
                  <Avatar className="w-full h-full rounded-lg">
                    <AvatarImage
                      src={selectedProvider.image}
                      alt={selectedProvider.name}
                      className="w-full h-full object-cover"
                    />
                    <AvatarFallback className="w-full h-full rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 text-4xl">
                      {selectedProvider.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>

                {/* Business Info */}
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">About</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedProvider.description || "No description available"}
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Specialties</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedProvider.specialties.map((specialty) => (
                        <Badge key={specialty} variant="secondary">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                      <span className="font-medium">{selectedProvider.rating.toFixed(1)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedProvider.location}</span>
                    </div>
                    <Badge variant="outline">{selectedProvider.priceRange}</Badge>
                  </div>
                </div>

                {/* Book Button */}
                <Button
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  onClick={handleBookFromDetails}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Book Appointment
                </Button>
              </TabsContent>

              <TabsContent value="reviews" className="mt-4">
                {selectedProvider.hairdresserId ? (
                  <BusinessReviews
                    hairdresserId={selectedProvider.hairdresserId}
                    businessName={selectedProvider.name}
                  />
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>Reviews not available</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Booking Modal */}
      <Dialog open={showBookingModal} onOpenChange={setShowBookingModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Book Appointment</DialogTitle>
            <DialogDescription>
              Book your appointment with {selectedProvider?.name}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleBookingSubmit} className="space-y-4">
            <div>
              <Label htmlFor="service">Service *</Label>
              <Select value={bookingData.service} onValueChange={(value) => setBookingData(prev => ({ ...prev, service: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a service" />
                </SelectTrigger>
                <SelectContent>
                  {selectedProvider?.specialties.map((specialty) => (
                    <SelectItem key={specialty} value={specialty}>{specialty}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={bookingData.date}
                onChange={(e) => setBookingData(prev => ({ ...prev, date: e.target.value }))}
                min={new Date().toISOString().split('T')[0]}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="time">Time *</Label>
              <Select value={bookingData.time} onValueChange={(value) => setBookingData(prev => ({ ...prev, time: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="09:00">9:00 AM</SelectItem>
                  <SelectItem value="10:00">10:00 AM</SelectItem>
                  <SelectItem value="11:00">11:00 AM</SelectItem>
                  <SelectItem value="12:00">12:00 PM</SelectItem>
                  <SelectItem value="13:00">1:00 PM</SelectItem>
                  <SelectItem value="14:00">2:00 PM</SelectItem>
                  <SelectItem value="15:00">3:00 PM</SelectItem>
                  <SelectItem value="16:00">4:00 PM</SelectItem>
                  <SelectItem value="17:00">5:00 PM</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="notes">Additional Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Any special requests or notes..."
                value={bookingData.notes}
                onChange={(e) => setBookingData(prev => ({ ...prev, notes: e.target.value }))}
                className="mt-1"
                rows={3}
              />
            </div>

            <div className="flex space-x-2 pt-4">
              <Button type="submit" className="flex-1 bg-purple-600 hover:bg-purple-700">
                <Calendar className="mr-2 h-4 w-4" />
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
    </div>
  );
};

export default ExplorePage;
