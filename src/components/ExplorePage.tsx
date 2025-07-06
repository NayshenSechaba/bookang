
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Star, MapPin, Phone, Clock, Search, Filter, Navigation } from 'lucide-react';

const ExplorePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Mock data for salons
  const highlyRatedSalons = [
    {
      id: 1,
      name: 'Glamour Studio Premium',
      rating: 4.9,
      reviewCount: 127,
      location: '123 Fashion Ave, Downtown',
      phone: '(555) 123-4567',
      specialties: ['Hair Color', 'Styling', 'Treatment'],
      priceRange: '$$$',
      image: 'premium-salon.jpg',
      distance: '0.5 miles',
      openNow: true
    },
    {
      id: 2,
      name: 'Elite Hair Lounge',
      rating: 4.8,
      reviewCount: 98,
      location: '456 Beauty Blvd, Midtown',
      phone: '(555) 234-5678',
      specialties: ['Cuts', 'Color', 'Extensions'],
      priceRange: '$$',
      image: 'elite-salon.jpg',
      distance: '1.2 miles',
      openNow: true
    },
    {
      id: 3,
      name: 'Luxury Hair Spa',
      rating: 4.7,
      reviewCount: 85,
      location: '789 Spa Street, Uptown',
      phone: '(555) 345-6789',
      specialties: ['Spa Services', 'Treatment', 'Styling'],
      priceRange: '$$$$',
      image: 'luxury-spa.jpg',
      distance: '2.1 miles',
      openNow: false
    }
  ];

  const newSalons = [
    {
      id: 4,
      name: 'Modern Edge Salon',
      rating: 4.6,
      reviewCount: 23,
      location: '321 Trendy Lane, Arts District',
      phone: '(555) 456-7890',
      specialties: ['Modern Cuts', 'Color', 'Styling'],
      priceRange: '$$',
      image: 'modern-salon.jpg',
      distance: '1.8 miles',
      openNow: true,
      isNew: true
    },
    {
      id: 5,
      name: 'Fresh Look Studio',
      rating: 4.5,
      reviewCount: 15,
      location: '654 New Street, Creative Quarter',
      phone: '(555) 567-8901',
      specialties: ['Cuts', 'Color', 'Beard Styling'],
      priceRange: '$',
      image: 'fresh-salon.jpg',
      distance: '2.3 miles',
      openNow: true,
      isNew: true
    },
    {
      id: 6,
      name: 'Style Revolution',
      rating: 4.4,
      reviewCount: 31,
      location: '987 Innovation Ave, Tech District',
      phone: '(555) 678-9012',
      specialties: ['Experimental Cuts', 'Color Art', 'Styling'],
      priceRange: '$$$',
      image: 'revolution-salon.jpg',
      distance: '3.0 miles',
      openNow: false,
      isNew: true
    }
  ];

  const closestSalons = [
    {
      id: 7,
      name: 'Corner Cuts',
      rating: 4.3,
      reviewCount: 67,
      location: '100 Main Street, Your Neighborhood',
      phone: '(555) 789-0123',
      specialties: ['Quick Cuts', 'Wash & Go', 'Basic Color'],
      priceRange: '$',
      image: 'corner-salon.jpg',
      distance: '0.2 miles',
      openNow: true
    },
    {
      id: 8,
      name: 'Neighborhood Hair Hub',
      rating: 4.5,
      reviewCount: 54,
      location: '200 Local Ave, Your Area',
      phone: '(555) 890-1234',
      specialties: ['Family Cuts', 'Color', 'Styling'],
      priceRange: '$$',
      image: 'neighborhood-salon.jpg',
      distance: '0.3 miles',
      openNow: true
    },
    {
      id: 9,
      name: 'Quick Style Express',
      rating: 4.2,
      reviewCount: 89,
      location: '300 Convenient St, Near You',
      phone: '(555) 901-2345',
      specialties: ['Express Cuts', 'Quick Color', 'Blowouts'],
      priceRange: '$',
      image: 'express-salon.jpg',
      distance: '0.4 miles',
      openNow: false
    }
  ];

  // Combine all salons for search
  const allSalons = [...highlyRatedSalons, ...newSalons, ...closestSalons];

  // Filter salons based on search and category
  const getFilteredSalons = (salons: any[]) => {
    let filtered = salons;
    
    if (searchQuery) {
      filtered = filtered.filter(salon => 
        salon.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        salon.specialties.some((specialty: string) => 
          specialty.toLowerCase().includes(searchQuery.toLowerCase())
        ) ||
        salon.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered;
  };

  // Render star rating
  const StarRating = ({ rating, reviewCount }: { rating: number; reviewCount: number }) => {
    return (
      <div className="flex items-center space-x-1">
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`h-4 w-4 ${
                star <= Math.floor(rating) 
                  ? 'text-yellow-400 fill-yellow-400' 
                  : star <= rating 
                  ? 'text-yellow-400 fill-yellow-400 opacity-50'
                  : 'text-gray-300'
              }`}
            />
          ))}
        </div>
        <span className="text-sm text-gray-600">
          {rating} ({reviewCount} reviews)
        </span>
      </div>
    );
  };

  // Render salon card
  const SalonCard = ({ salon }: { salon: any }) => (
    <Card className="hover:shadow-lg transition-shadow border-gray-200">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">{salon.name}</h3>
              {salon.isNew && (
                <Badge className="bg-green-100 text-green-800 text-xs">NEW</Badge>
              )}
              {salon.openNow ? (
                <Badge className="bg-emerald-100 text-emerald-800 text-xs">OPEN</Badge>
              ) : (
                <Badge variant="secondary" className="text-xs">CLOSED</Badge>
              )}
            </div>
            <StarRating rating={salon.rating} reviewCount={salon.reviewCount} />
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-purple-600">{salon.priceRange}</div>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-gray-600 text-sm">
            <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
            <span>{salon.location}</span>
          </div>
          <div className="flex items-center text-gray-600 text-sm">
            <Navigation className="h-4 w-4 mr-2 flex-shrink-0" />
            <span>{salon.distance} away</span>
          </div>
          <div className="flex items-center text-gray-600 text-sm">
            <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
            <span>{salon.phone}</span>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">Specialties:</p>
          <div className="flex flex-wrap gap-1">
            {salon.specialties.map((specialty: string) => (
              <Badge key={specialty} variant="outline" className="text-xs">
                {specialty}
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex space-x-2 pt-4 border-t">
          <Button size="sm" className="flex-1 bg-purple-600 hover:bg-purple-700">
            Book Now
          </Button>
          <Button size="sm" variant="outline" className="flex-1">
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Explore <span className="text-purple-600">Salons</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover the best salons in your area, from highly-rated establishments to exciting new venues
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8">
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by salon name, service, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-3 text-lg border-gray-300 focus:border-purple-500 focus:ring-purple-500"
              />
            </div>
            
            <div className="flex justify-center mt-4 space-x-4">
              <Button
                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                onClick={() => setSelectedCategory('all')}
                size="sm"
              >
                All Salons
              </Button>
              <Button
                variant={selectedCategory === 'rating' ? 'default' : 'outline'}  
                onClick={() => setSelectedCategory('rating')}
                size="sm"
              >
                Highly Rated
              </Button>
              <Button
                variant={selectedCategory === 'new' ? 'default' : 'outline'}
                onClick={() => setSelectedCategory('new')}
                size="sm"
              >
                New Salons
              </Button>
              <Button
                variant={selectedCategory === 'nearby' ? 'default' : 'outline'}
                onClick={() => setSelectedCategory('nearby')}
                size="sm"
              >
                Nearby
              </Button>
            </div>
          </div>
        </div>

        {/* Search Results */}
        {searchQuery && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Search Results for "{searchQuery}"
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getFilteredSalons(allSalons).map((salon) => (
                <SalonCard key={salon.id} salon={salon} />
              ))}
            </div>
            {getFilteredSalons(allSalons).length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No salons found matching your search.</p>
                <Button 
                  variant="outline" 
                  onClick={() => setSearchQuery('')}
                  className="mt-4"
                >
                  Clear Search
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Category Sections */}
        {!searchQuery && (
          <>
            {/* Highly Rated Salons */}
            {(selectedCategory === 'all' || selectedCategory === 'rating') && (
              <section className="mb-12">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Highly Rated Salons</h2>
                    <p className="text-gray-600">Top-rated salons with excellent customer reviews</p>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-800">
                    <Star className="h-3 w-3 mr-1" />
                    Top Rated
                  </Badge>
                </div>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {getFilteredSalons(highlyRatedSalons).map((salon) => (
                    <SalonCard key={salon.id} salon={salon} />
                  ))}
                </div>
              </section>
            )}

            {/* New Salons */}
            {(selectedCategory === 'all' || selectedCategory === 'new') && (
              <section className="mb-12">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">New Salons</h2>
                    <p className="text-gray-600">Recently opened salons offering fresh experiences</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">
                    New Arrivals
                  </Badge>
                </div>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {getFilteredSalons(newSalons).map((salon) => (
                    <SalonCard key={salon.id} salon={salon} />
                  ))}
                </div>
              </section>
            )}

            {/* Closest Salons */}
            {(selectedCategory === 'all' || selectedCategory === 'nearby') && (
              <section className="mb-12">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Salons Close to You</h2>
                    <p className="text-gray-600">Convenient locations in your neighborhood</p>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">
                    <Navigation className="h-3 w-3 mr-1" />
                    Nearby
                  </Badge>
                </div>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {getFilteredSalons(closestSalons).map((salon) => (
                    <SalonCard key={salon.id} salon={salon} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        {/* Call to Action */}
        <div className="text-center py-12 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Can't Find What You're Looking For?
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Let us know what services you need, and we'll help you find the perfect salon match.
          </p>
          <div className="flex justify-center space-x-4">
            <Button className="bg-purple-600 hover:bg-purple-700">
              Request Recommendations
            </Button>
            <Button variant="outline">
              Join Our Waitlist
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExplorePage;
