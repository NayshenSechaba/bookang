import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Star, MapPin, Search, Heart, Bookmark, MoreHorizontal, Navigation, X, Calendar, Clock } from 'lucide-react';
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
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [likedItems, setLikedItems] = useState<Set<number>>(new Set());
  const [savedItems, setSavedItems] = useState<Set<number>>(new Set());
  
  // Booking modal state
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedSalon, setSelectedSalon] = useState<Salon | null>(null);
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

  // Mock data for salons with South African locations
  const allSalons: Salon[] = [
    {
      id: 1,
      name: 'Glamour Studio',
      rating: 4.9,
      reviewCount: 127,
      location: 'Sandton',
      specialties: ['Color', 'Styling'],
      priceRange: 'Premium',
      image: '/placeholder.svg',
      distance: '0.8 km',
      isLiked: false,
      isSaved: false,
      category: 'popular',
      coordinates: { lat: -26.1076, lng: 28.0567 }
    },
    {
      id: 2,
      name: 'Elite Hair Lounge',
      rating: 4.8,
      reviewCount: 98,
      location: 'Soweto',
      specialties: ['Cuts', 'Extensions'],
      priceRange: 'Mid-Range',
      image: '/placeholder.svg',
      distance: '1.9 km',
      isLiked: true,
      isSaved: false,
      category: 'popular',
      coordinates: { lat: -26.2678, lng: 27.8585 }
    },
    {
      id: 3,
      name: 'Luxury Hair Spa',
      rating: 4.7,
      reviewCount: 85,
      location: 'Rosebank',
      specialties: ['Spa', 'Treatment'],
      priceRange: 'Luxury',
      image: '/placeholder.svg',
      distance: '3.4 km',
      isLiked: false,
      isSaved: true,
      category: 'popular',
      coordinates: { lat: -26.1464, lng: 28.0414 }
    },
    {
      id: 4,
      name: 'Modern Edge',
      rating: 4.6,
      reviewCount: 23,
      location: 'Alexandra',
      specialties: ['Modern Cuts'],
      priceRange: 'Mid-Range',
      image: '/placeholder.svg',
      distance: '2.9 km',
      isLiked: false,
      isSaved: false,
      category: 'new',
      isNew: true,
      coordinates: { lat: -26.1021, lng: 28.0949 }
    },
    {
      id: 5,
      name: 'Fresh Look',
      rating: 4.5,
      reviewCount: 15,
      location: 'Johannesburg CBD',
      specialties: ['Color', 'Beard'],
      priceRange: 'Budget',
      image: '/placeholder.svg',
      distance: '3.7 km',
      isLiked: true,
      isSaved: false,
      category: 'new',
      isNew: true,
      coordinates: { lat: -26.2041, lng: 28.0473 }
    },
    {
      id: 6,
      name: 'Corner Cuts',
      rating: 4.3,
      reviewCount: 67,
      location: 'Midrand',
      specialties: ['Quick Cuts'],
      priceRange: 'Budget',
      image: '/placeholder.svg',
      distance: '0.3 km',
      isLiked: false,
      isSaved: false,
      category: 'nearby',
      coordinates: { lat: -25.9896, lng: 28.1285 }
    },
    {
      id: 7,
      name: 'Hair Hub',
      rating: 4.5,
      reviewCount: 54,
      location: 'Randburg',
      specialties: ['Family Cuts'],
      priceRange: 'Mid-Range',
      image: '/placeholder.svg',
      distance: '0.5 km',
      isLiked: false,
      isSaved: true,
      category: 'nearby',
      coordinates: { lat: -26.0943, lng: 27.9819 }
    },
    {
      id: 8,
      name: 'Style Express',
      rating: 4.2,
      reviewCount: 89,
      location: 'Diepsloot',
      specialties: ['Express'],
      priceRange: 'Budget',
      image: '/placeholder.svg',
      distance: '0.6 km',
      isLiked: true,
      isSaved: false,
      category: 'nearby',
      coordinates: { lat: -25.9321, lng: 28.0122 }
    },
    {
      id: 9,
      name: 'Yeoville Styles',
      rating: 4.4,
      reviewCount: 72,
      location: 'Yeoville',
      specialties: ['Braids', 'Weaves'],
      priceRange: 'Mid-Range',
      image: '/placeholder.svg',
      distance: '1.2 km',
      isLiked: false,
      isSaved: false,
      category: 'popular',
      coordinates: { lat: -26.1789, lng: 28.0683 }
    },
    {
      id: 10,
      name: 'Tembisa Touch',
      rating: 4.6,
      reviewCount: 91,
      location: 'Tembisa',
      specialties: ['Natural Hair', 'Color'],
      priceRange: 'Budget',
      image: '/placeholder.svg',
      distance: '2.1 km',
      isLiked: false,
      isSaved: false,
      category: 'new',
      isNew: true,
      coordinates: { lat: -25.9966, lng: 28.2269 }
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

  // Handle booking
  const handleBooking = (salon: Salon) => {
    setSelectedSalon(salon);
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
      description: `Your appointment at ${selectedSalon?.name} has been requested for ${bookingData.date} at ${bookingData.time}.`,
    });

    // Reset form and close modal
    setBookingData({ service: '', date: '', time: '', notes: '' });
    setShowBookingModal(false);
    setSelectedSalon(null);
  };
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

    // Filter by selected location
    if (selectedLocation !== 'all') {
      filtered = filtered.filter(salon => 
        salon.location.toLowerCase() === locations.find(loc => loc.id === selectedLocation)?.label.toLowerCase()
      );
    }
    
    return filtered;
  };


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

          {/* Location badge */}
          <div className="absolute bottom-3 right-3">
            <Badge className="text-xs px-2 py-1 rounded-full bg-white/90 text-gray-900">
              <MapPin className="h-3 w-3 mr-1" />
              {salon.location}
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
            
            <Button 
              size="sm" 
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-1.5 rounded-full text-xs"
              onClick={() => handleBooking(salon)}
            >
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

      {/* Booking Modal */}
      <Dialog open={showBookingModal} onOpenChange={setShowBookingModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Book Appointment</DialogTitle>
            <DialogDescription>
              Book your appointment at {selectedSalon?.name}
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
                  {selectedSalon?.specialties.map((specialty) => (
                    <SelectItem key={specialty} value={specialty}>{specialty}</SelectItem>
                  ))}
                  <SelectItem value="haircut">Haircut</SelectItem>
                  <SelectItem value="color">Hair Color</SelectItem>
                  <SelectItem value="styling">Styling</SelectItem>
                  <SelectItem value="treatment">Hair Treatment</SelectItem>
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
