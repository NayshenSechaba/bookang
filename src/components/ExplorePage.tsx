import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Star, MapPin, Search, Heart, Bookmark, MoreHorizontal, Navigation, X } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

// Define types for better TypeScript support
interface SalonCoordinates {
  lat: number;
  lng: number;
}

interface Salon {
  id: number;
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
  coordinates: SalonCoordinates;
  isNew?: boolean;
  calculatedDistance?: number;
}

const ExplorePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [locationPermissionAsked, setLocationPermissionAsked] = useState(false);
  const [showLocationPrompt, setShowLocationPrompt] = useState(true);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [likedItems, setLikedItems] = useState<Set<number>>(new Set());
  const [savedItems, setSavedItems] = useState<Set<number>>(new Set());
  const { toast } = useToast();

  // Mock data for salons with coordinates
  const allSalons: Salon[] = [
    {
      id: 1,
      name: 'Glamour Studio',
      rating: 4.9,
      reviewCount: 127,
      location: 'Downtown',
      specialties: ['Color', 'Styling'],
      priceRange: 'Premium',
      image: '/placeholder.svg',
      distance: '0.8 km',
      isLiked: false,
      isSaved: false,
      category: 'popular',
      coordinates: { lat: 40.7128, lng: -74.0060 }
    },
    {
      id: 2,
      name: 'Elite Hair Lounge',
      rating: 4.8,
      reviewCount: 98,
      location: 'Midtown',
      specialties: ['Cuts', 'Extensions'],
      priceRange: 'Mid-Range',
      image: '/placeholder.svg',
      distance: '1.9 km',
      isLiked: true,
      isSaved: false,
      category: 'popular',
      coordinates: { lat: 40.7589, lng: -73.9851 }
    },
    {
      id: 3,
      name: 'Luxury Hair Spa',
      rating: 4.7,
      reviewCount: 85,
      location: 'Uptown',
      specialties: ['Spa', 'Treatment'],
      priceRange: 'Luxury',
      image: '/placeholder.svg',
      distance: '3.4 km',
      isLiked: false,
      isSaved: true,
      category: 'popular',
      coordinates: { lat: 40.7831, lng: -73.9712 }
    },
    {
      id: 4,
      name: 'Modern Edge',
      rating: 4.6,
      reviewCount: 23,
      location: 'Arts District',
      specialties: ['Modern Cuts'],
      priceRange: 'Mid-Range',
      image: '/placeholder.svg',
      distance: '2.9 km',
      isLiked: false,
      isSaved: false,
      category: 'new',
      isNew: true,
      coordinates: { lat: 40.7505, lng: -73.9934 }
    },
    {
      id: 5,
      name: 'Fresh Look',
      rating: 4.5,
      reviewCount: 15,
      location: 'Creative Quarter',
      specialties: ['Color', 'Beard'],
      priceRange: 'Budget',
      image: '/placeholder.svg',
      distance: '3.7 km',
      isLiked: true,
      isSaved: false,
      category: 'new',
      isNew: true,
      coordinates: { lat: 40.7282, lng: -74.0776 }
    },
    {
      id: 6,
      name: 'Corner Cuts',
      rating: 4.3,
      reviewCount: 67,
      location: 'Your Neighborhood',
      specialties: ['Quick Cuts'],
      priceRange: 'Budget',
      image: '/placeholder.svg',
      distance: '0.3 km',
      isLiked: false,
      isSaved: false,
      category: 'nearby',
      coordinates: { lat: 40.7614, lng: -73.9776 }
    },
    {
      id: 7,
      name: 'Hair Hub',
      rating: 4.5,
      reviewCount: 54,
      location: 'Your Area',
      specialties: ['Family Cuts'],
      priceRange: 'Mid-Range',
      image: '/placeholder.svg',
      distance: '0.5 km',
      isLiked: false,
      isSaved: true,
      category: 'nearby',
      coordinates: { lat: 40.7480, lng: -73.9857 }
    },
    {
      id: 8,
      name: 'Style Express',
      rating: 4.2,
      reviewCount: 89,
      location: 'Near You',
      specialties: ['Express'],
      priceRange: 'Budget',
      image: '/placeholder.svg',
      distance: '0.6 km',
      isLiked: true,
      isSaved: false,
      category: 'nearby',
      coordinates: { lat: 40.7549, lng: -73.9840 }
    }
  ];

  // Initialize liked and saved items from salon data
  useEffect(() => {
    const initialLiked = new Set<number>();
    const initialSaved = new Set<number>();
    
    allSalons.forEach(salon => {
      if (salon.isLiked) initialLiked.add(salon.id);
      if (salon.isSaved) initialSaved.add(salon.id);
    });
    
    setLikedItems(initialLiked);
    setSavedItems(initialSaved);
  }, []);

  // Handle like/unlike
  const toggleLike = (salonId: number) => {
    const newLikedItems = new Set(likedItems);
    if (newLikedItems.has(salonId)) {
      newLikedItems.delete(salonId);
      toast({
        title: "Removed from favorites",
        description: "Salon removed from your liked list.",
      });
    } else {
      newLikedItems.add(salonId);
      toast({
        title: "Added to favorites",
        description: "Salon added to your liked list.",
      });
    }
    setLikedItems(newLikedItems);
  };

  // Handle save/unsave
  const toggleSave = (salonId: number) => {
    const newSavedItems = new Set(savedItems);
    if (newSavedItems.has(salonId)) {
      newSavedItems.delete(salonId);
      toast({
        title: "Removed from saved",
        description: "Salon removed from your bookmarks.",
      });
    } else {
      newSavedItems.add(salonId);
      toast({
        title: "Saved for later",
        description: "Salon bookmarked for future reference.",
      });
    }
    setSavedItems(newSavedItems);
  };

  // Calculate distance between two coordinates
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 3959; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Request user's location
  const requestLocation = async () => {
    setIsLoadingLocation(true);
    setLocationPermissionAsked(true);
    
    if (!navigator.geolocation) {
      toast({
        title: "Location not supported",
        description: "Your browser doesn't support location services.",
        variant: "destructive"
      });
      setIsLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        setShowLocationPrompt(false);
        setIsLoadingLocation(false);
        toast({
          title: "Location enabled",
          description: "Now showing salons sorted by distance from your location.",
        });
      },
      (error) => {
        console.error('Error getting location:', error);
        setIsLoadingLocation(false);
        toast({
          title: "Location access denied",
          description: "Enable location permissions to see nearby salons.",
          variant: "destructive"
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  };

  // Filter and sort salons
  const getFilteredSalons = (): Salon[] => {
    let filtered = allSalons.map(salon => ({
      ...salon,
      isLiked: likedItems.has(salon.id),
      isSaved: savedItems.has(salon.id)
    }));
    
    if (searchQuery) {
      filtered = filtered.filter(salon => 
        salon.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        salon.specialties.some((specialty: string) => 
          specialty.toLowerCase().includes(searchQuery.toLowerCase())
        ) ||
        salon.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(salon => salon.category === selectedCategory);
    }

    // Sort by distance if user location is available
    if (userLocation) {
      filtered = filtered.map(salon => ({
        ...salon,
        calculatedDistance: calculateDistance(
          userLocation.lat,
          userLocation.lng,
          salon.coordinates.lat,
          salon.coordinates.lng
        )
      })).sort((a, b) => (a.calculatedDistance || 0) - (b.calculatedDistance || 0));

      // Update distance display
      filtered = filtered.map(salon => ({
        ...salon,
        distance: `${(salon.calculatedDistance! * 1.60934).toFixed(1)} km`
      }));
    }
    
    return filtered;
  };

  // Location prompt component
  const LocationPrompt = () => (
    showLocationPrompt && !locationPermissionAsked && (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <Navigation className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-900">Find salons near you</h3>
              <p className="text-sm text-blue-700 mt-1">
                Allow location access to see salons sorted by distance from your current location.
              </p>
              <div className="flex space-x-2 mt-3">
                <Button 
                  size="sm" 
                  onClick={requestLocation}
                  disabled={isLoadingLocation}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isLoadingLocation ? (
                    <>Getting location...</>
                  ) : (
                    <>
                      <Navigation className="h-4 w-4 mr-2" />
                      Enable Location
                    </>
                  )}
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setShowLocationPrompt(false)}
                  className="border-blue-300 text-blue-700 hover:bg-blue-50"
                >
                  Maybe later
                </Button>
              </div>
            </div>
          </div>
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={() => setShowLocationPrompt(false)}
            className="text-blue-600 hover:bg-blue-100 p-1"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  );

  // Instagram-like salon card
  const SalonCard = ({ salon }: { salon: Salon }) => (
    <Card className="overflow-hidden border-0 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="relative">
        {/* Image */}
        <div className="aspect-square bg-gradient-to-br from-purple-100 to-pink-100 relative overflow-hidden">
          <img 
            src={salon.image} 
            alt={salon.name}
            className="w-full h-full object-cover"
          />
          
          {/* Overlay badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1">
            {salon.isNew && (
              <Badge className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                NEW
              </Badge>
            )}
            <Badge className="bg-black/70 text-white text-xs px-2 py-1 rounded-full">
              {salon.priceRange}
            </Badge>
          </div>

          {/* Top right actions */}
          <div className="absolute top-3 right-3">
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 bg-black/20 hover:bg-black/40 text-white rounded-full">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>

          {/* Distance badge */}
          <div className="absolute bottom-3 right-3">
            <Badge className={`text-xs px-2 py-1 rounded-full ${
              userLocation ? 'bg-blue-500 text-white' : 'bg-white/90 text-gray-900'
            }`}>
              <MapPin className="h-3 w-3 mr-1" />
              {salon.distance}
            </Badge>
          </div>
        </div>

        {/* Content */}
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">{salon.name}</h3>
              <p className="text-sm text-gray-600 truncate">{salon.location}</p>
            </div>
            
            {/* Rating */}
            <div className="flex items-center ml-2">
              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
              <span className="text-sm font-medium ml-1">{salon.rating}</span>
            </div>
          </div>

          {/* Specialties */}
          <div className="flex flex-wrap gap-1 mb-3">
            {salon.specialties.slice(0, 2).map((specialty: string) => (
              <Badge key={specialty} variant="outline" className="text-xs px-2 py-0.5">
                {specialty}
              </Badge>
            ))}
            {salon.specialties.length > 2 && (
              <Badge variant="outline" className="text-xs px-2 py-0.5">
                +{salon.specialties.length - 2}
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
                onClick={() => toggleLike(salon.id)}
              >
                <Heart className={`h-5 w-5 ${salon.isLiked ? 'text-red-500 fill-red-500' : 'text-gray-600'}`} />
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                className="h-8 p-0 hover:bg-transparent"
                onClick={() => toggleSave(salon.id)}
              >
                <Bookmark className={`h-5 w-5 ${salon.isSaved ? 'text-purple-600 fill-purple-600' : 'text-gray-600'}`} />
              </Button>
              <span className="text-sm text-gray-500">{salon.reviewCount} reviews</span>
            </div>
            
            <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-1.5 rounded-full text-xs">
              Book
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
          {/* Location Prompt */}
          <LocationPrompt />
          
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search salons..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-gray-300 rounded-full bg-gray-50 focus:bg-white"
            />
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

          {/* Location status */}
          {userLocation && (
            <div className="flex items-center justify-center mt-3 text-sm text-green-600">
              <Navigation className="h-4 w-4 mr-2" />
              Showing salons sorted by distance from your location
            </div>
          )}

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
          {getFilteredSalons().map((salon) => (
            <SalonCard key={salon.id} salon={salon} />
          ))}
        </div>

        {/* Empty state */}
        {getFilteredSalons().length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="h-12 w-12 mx-auto" />
            </div>
            <p className="text-gray-500 text-lg mb-4">No salons found</p>
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
    </div>
  );
};

export default ExplorePage;
