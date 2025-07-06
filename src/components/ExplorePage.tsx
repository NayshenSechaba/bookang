
import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Star, MapPin, Search, Heart, Bookmark, MoreHorizontal } from 'lucide-react';

const ExplorePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Mock data for salons
  const allSalons = [
    {
      id: 1,
      name: 'Glamour Studio',
      rating: 4.9,
      reviewCount: 127,
      location: 'Downtown',
      specialties: ['Color', 'Styling'],
      priceRange: 'Premium',
      image: '/placeholder.svg',
      distance: '0.5 mi',
      isLiked: false,
      isSaved: false,
      category: 'popular'
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
      distance: '1.2 mi',
      isLiked: true,
      isSaved: false,
      category: 'popular'
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
      distance: '2.1 mi',
      isLiked: false,
      isSaved: true,
      category: 'popular'
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
      distance: '1.8 mi',
      isLiked: false,
      isSaved: false,
      category: 'new',
      isNew: true
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
      distance: '2.3 mi',
      isLiked: true,
      isSaved: false,
      category: 'new',
      isNew: true
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
      distance: '0.2 mi',
      isLiked: false,
      isSaved: false,
      category: 'nearby'
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
      distance: '0.3 mi',
      isLiked: false,
      isSaved: true,
      category: 'nearby'
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
      distance: '0.4 mi',
      isLiked: true,
      isSaved: false,
      category: 'nearby'
    }
  ];

  // Filter salons
  const getFilteredSalons = () => {
    let filtered = allSalons;
    
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
    
    return filtered;
  };

  // Instagram-like salon card
  const SalonCard = ({ salon }: { salon: any }) => (
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
            <Badge className="bg-white/90 text-gray-900 text-xs px-2 py-1 rounded-full">
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
              <Button size="sm" variant="ghost" className="h-8 p-0 hover:bg-transparent">
                <Heart className={`h-5 w-5 ${salon.isLiked ? 'text-red-500 fill-red-500' : 'text-gray-600'}`} />
              </Button>
              <Button size="sm" variant="ghost" className="h-8 p-0 hover:bg-transparent">
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
