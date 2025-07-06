
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, Bookmark, Star, MapPin, Trash2, Eye } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface FavoriteItem {
  id: number;
  name: string;
  type: 'salon' | 'service';
  rating?: number;
  reviewCount?: number;
  location?: string;
  specialties?: string[];
  priceRange?: string;
  image: string;
  distance?: string;
  description?: string;
}

interface FavoritesManagerProps {
  likedItems: Set<number>;
  savedItems: Set<number>;
  onRemoveLiked: (id: number) => void;
  onRemoveSaved: (id: number) => void;
}

const FavoritesManager = ({ 
  likedItems, 
  savedItems, 
  onRemoveLiked, 
  onRemoveSaved 
}: FavoritesManagerProps) => {
  const [favoriteData, setFavoriteData] = useState<FavoriteItem[]>([]);
  const { toast } = useToast();

  // Mock data for favorite items (in a real app, this would come from an API)
  const mockFavoriteData: FavoriteItem[] = [
    {
      id: 1,
      name: 'Glamour Studio',
      type: 'salon',
      rating: 4.9,
      reviewCount: 127,
      location: 'Downtown',
      specialties: ['Color', 'Styling'],
      priceRange: 'Premium',
      image: '/placeholder.svg',
      distance: '0.5 mi'
    },
    {
      id: 2,
      name: 'Elite Hair Lounge',
      type: 'salon',
      rating: 4.8,
      reviewCount: 98,
      location: 'Midtown',
      specialties: ['Cuts', 'Extensions'],
      priceRange: 'Mid-Range',
      image: '/placeholder.svg',
      distance: '1.2 mi'
    },
    {
      id: 3,
      name: 'Luxury Hair Spa',
      type: 'salon',
      rating: 4.7,
      reviewCount: 85,
      location: 'Uptown',
      specialties: ['Spa', 'Treatment'],
      priceRange: 'Luxury',
      image: '/placeholder.svg',
      distance: '2.1 mi'
    },
    {
      id: 5,
      name: 'Fresh Look',
      type: 'salon',
      rating: 4.5,
      reviewCount: 15,
      location: 'Creative Quarter',
      specialties: ['Color', 'Beard'],
      priceRange: 'Budget',
      image: '/placeholder.svg',
      distance: '2.3 mi'
    },
    {
      id: 7,
      name: 'Hair Hub',
      type: 'salon',
      rating: 4.5,
      reviewCount: 54,
      location: 'Your Area',
      specialties: ['Family Cuts'],
      priceRange: 'Mid-Range',
      image: '/placeholder.svg',
      distance: '0.3 mi'
    },
    {
      id: 8,
      name: 'Style Express',
      type: 'salon',
      rating: 4.2,
      reviewCount: 89,
      location: 'Near You',
      specialties: ['Express'],
      priceRange: 'Budget',
      image: '/placeholder.svg',
      distance: '0.4 mi'
    }
  ];

  useEffect(() => {
    setFavoriteData(mockFavoriteData);
  }, []);

  const getLikedItems = () => {
    return favoriteData.filter(item => likedItems.has(item.id));
  };

  const getSavedItems = () => {
    return favoriteData.filter(item => savedItems.has(item.id));
  };

  const handleRemoveLiked = (id: number) => {
    onRemoveLiked(id);
    toast({
      title: "Removed from favorites",
      description: "Item removed from your liked list.",
    });
  };

  const handleRemoveSaved = (id: number) => {
    onRemoveSaved(id);
    toast({
      title: "Removed from saved",
      description: "Item removed from your bookmarks.",
    });
  };

  const FavoriteCard = ({ 
    item, 
    showRemove, 
    onRemove 
  }: { 
    item: FavoriteItem; 
    showRemove: boolean; 
    onRemove: (id: number) => void; 
  }) => (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <div className="flex">
        {/* Image */}
        <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 flex-shrink-0">
          <img 
            src={item.image} 
            alt={item.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content */}
        <div className="flex-1 p-4">
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">{item.name}</h3>
              {item.location && (
                <p className="text-sm text-gray-600 truncate flex items-center">
                  <MapPin className="h-3 w-3 mr-1" />
                  {item.location}
                </p>
              )}
            </div>
            
            {/* Actions */}
            <div className="flex items-center space-x-2 ml-2">
              {item.rating && (
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  <span className="text-sm font-medium ml-1">{item.rating}</span>
                </div>
              )}
              {showRemove && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onRemove(item.id)}
                  className="h-8 w-8 p-0 text-red-500 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Specialties */}
          {item.specialties && (
            <div className="flex flex-wrap gap-1 mb-2">
              {item.specialties.slice(0, 2).map((specialty) => (
                <Badge key={specialty} variant="outline" className="text-xs px-2 py-0.5">
                  {specialty}
                </Badge>
              ))}
              {item.specialties.length > 2 && (
                <Badge variant="outline" className="text-xs px-2 py-0.5">
                  +{item.specialties.length - 2}
                </Badge>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              {item.priceRange && (
                <Badge variant="secondary" className="text-xs">
                  {item.priceRange}
                </Badge>
              )}
              {item.distance && (
                <span className="text-xs">{item.distance}</span>
              )}
            </div>
            
            <Button size="sm" variant="outline" className="text-xs">
              <Eye className="h-3 w-3 mr-1" />
              View
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Heart className="h-5 w-5 text-red-500" />
            <Bookmark className="h-5 w-5 text-purple-600" />
            <span>My Favorites</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="liked" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="liked" className="flex items-center space-x-2">
                <Heart className="h-4 w-4" />
                <span>Liked ({likedItems.size})</span>
              </TabsTrigger>
              <TabsTrigger value="saved" className="flex items-center space-x-2">
                <Bookmark className="h-4 w-4" />
                <span>Saved ({savedItems.size})</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="liked" className="mt-4">
              <div className="space-y-4">
                {getLikedItems().length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Heart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No liked items yet</p>
                    <p className="text-sm">Start liking salons and services to see them here</p>
                  </div>
                ) : (
                  getLikedItems().map((item) => (
                    <FavoriteCard
                      key={item.id}
                      item={item}
                      showRemove={true}
                      onRemove={handleRemoveLiked}
                    />
                  ))
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="saved" className="mt-4">
              <div className="space-y-4">
                {getSavedItems().length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Bookmark className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No saved items yet</p>
                    <p className="text-sm">Start bookmarking salons and services to see them here</p>
                  </div>
                ) : (
                  getSavedItems().map((item) => (
                    <FavoriteCard
                      key={item.id}
                      item={item}
                      showRemove={true}
                      onRemove={handleRemoveSaved}
                    />
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default FavoritesManager;
