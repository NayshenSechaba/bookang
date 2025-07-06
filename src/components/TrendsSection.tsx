
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, Heart, Share2, Bookmark, Users, Calendar } from 'lucide-react';

const TrendsSection = () => {
  // Mock data for trending styles
  const trendingStyles = [
    {
      id: 1,
      title: 'Curtain Bangs Revolution',
      description: 'Soft, face-framing bangs that work with every hair type and face shape.',
      category: 'Cuts',
      popularity: 95,
      image: 'curtain-bangs.jpg',
      likes: 1247,
      shares: 89,
      trending: true,
      season: 'Fall 2024'
    },
    {
      id: 2,
      title: 'Chocolate Cherry Hair Color',
      description: 'Rich brown base with subtle cherry undertones for a luxurious autumn look.',
      category: 'Color',
      popularity: 88,
      image: 'chocolate-cherry.jpg',
      likes: 956,
      shares: 64,
      trending: true,
      season: 'Fall 2024'
    },
    {
      id: 3,
      title: 'Textured Bob with Layers',
      description: 'Modern take on the classic bob with strategic layers for movement and volume.',
      category: 'Cuts',
      popularity: 92,
      image: 'textured-bob.jpg',
      likes: 1156,
      shares: 78,
      trending: true,
      season: 'Year-round'
    },
    {
      id: 4,
      title: 'Balayage Highlights',
      description: 'Natural-looking highlights that grow out beautifully, perfect for low maintenance.',
      category: 'Color',
      popularity: 87,
      image: 'balayage.jpg',
      likes: 892,
      shares: 45,
      trending: false,
      season: 'Year-round'
    },
    {
      id: 5,
      title: 'Wolf Cut Variation',
      description: 'Edgy layered cut combining shag and mullet elements for a bold, modern look.',
      category: 'Cuts',
      popularity: 75,
      image: 'wolf-cut.jpg',
      likes: 634,
      shares: 52,
      trending: true,
      season: 'Fall 2024'
    },
    {
      id: 6,
      title: 'Money Piece Highlights',
      description: 'Face-framing highlights that brighten your complexion and add dimension.',
      category: 'Color',
      popularity: 83,
      image: 'money-piece.jpg',
      likes: 778,
      shares: 41,
      trending: false,
      season: 'Year-round'
    }
  ];

  // Mock data for seasonal trends
  const seasonalTrends = [
    {
      season: 'Fall 2024',
      theme: 'Warm & Rich',
      description: 'Embrace cozy autumn vibes with warm tones and textured styles',
      colors: ['Chocolate Brown', 'Caramel', 'Auburn', 'Copper'],
      styles: ['Layered Cuts', 'Curtain Bangs', 'Textured Bobs']
    },
    {
      season: 'Winter 2024',
      theme: 'Bold & Dramatic',
      description: 'Make a statement with deep colors and striking cuts',
      colors: ['Deep Black', 'Burgundy', 'Dark Plum', 'Espresso'],
      styles: ['Blunt Cuts', 'Geometric Bobs', 'Sleek Styles']
    }
  ];

  // Mock data for celebrity inspirations
  const celebrityInspired = [
    {
      id: 1,
      celebrity: 'Zendaya',
      style: 'Versatile Curls',
      description: 'Natural texture celebration with defined curls and protective styling',
      category: 'Styling',
      bookings: 145
    },
    {
      id: 2,
      celebrity: 'Billie Eilish',
      style: 'Bold Color Blocks',
      description: 'Statement roots with contrasting colors for an edgy, artistic look',
      category: 'Color',
      bookings: 98
    },
    {
      id: 3,
      celebrity: 'Hailey Bieber',
      style: 'Sleek Lob',
      description: 'Perfectly straight, shoulder-length cut with subtle layers',
      category: 'Cuts',
      bookings: 267
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Latest <span className="text-purple-600">Hair Trends</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Stay ahead of the curve with the hottest hair trends, seasonal inspirations, and celebrity-inspired looks
          </p>
        </div>

        {/* Trending Now Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Trending Now</h2>
              <p className="text-gray-600">The most popular styles this month</p>
            </div>
            <Badge className="bg-red-100 text-red-800">
              <TrendingUp className="h-3 w-3 mr-1" />
              Hot Right Now
            </Badge>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trendingStyles.map((style) => (
              <Card key={style.id} className="hover:shadow-lg transition-shadow border-gray-200">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{style.title}</CardTitle>
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge 
                          variant={style.category === 'Color' ? 'default' : 'secondary'}
                          className={style.category === 'Color' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}
                        >
                          {style.category}
                        </Badge>
                        {style.trending && (
                          <Badge className="bg-red-100 text-red-800 text-xs">
                            TRENDING
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-purple-600">{style.popularity}%</div>
                      <div className="text-xs text-gray-500">popularity</div>
                    </div>
                  </div>
                  <CardDescription className="text-gray-600">
                    {style.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <Heart className="h-4 w-4 mr-1" />
                        {style.likes}
                      </div>
                      <div className="flex items-center">
                        <Share2 className="h-4 w-4 mr-1" />
                        {style.shares}
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {style.season}
                    </Badge>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button size="sm" className="flex-1 bg-purple-600 hover:bg-purple-700">
                      Book This Style
                    </Button>
                    <Button size="sm" variant="outline">
                      <Bookmark className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Seasonal Trends */}
        <section className="mb-12">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Seasonal Inspirations</h2>
            <p className="text-gray-600">Discover what's perfect for each season</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {seasonalTrends.map((trend, index) => (
              <Card key={index} className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <CardTitle className="text-xl text-purple-900">{trend.season}</CardTitle>
                    <Badge className="bg-purple-600 text-white">{trend.theme}</Badge>
                  </div>
                  <CardDescription className="text-purple-700">
                    {trend.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-purple-900 mb-2">Trending Colors:</h4>
                      <div className="flex flex-wrap gap-2">
                        {trend.colors.map((color) => (
                          <Badge key={color} variant="secondary" className="bg-white text-purple-700">
                            {color}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-purple-900 mb-2">Popular Styles:</h4>
                      <div className="flex flex-wrap gap-2">
                        {trend.styles.map((style) => (
                          <Badge key={style} variant="outline" className="border-purple-300 text-purple-700">
                            {style}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Celebrity Inspired */}
        <section className="mb-12">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Celebrity Inspired</h2>
            <p className="text-gray-600">Get the look of your favorite stars</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {celebrityInspired.map((inspo) => (
              <Card key={inspo.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-pink-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-lg mb-1">{inspo.celebrity}</CardTitle>
                    <CardDescription className="text-purple-600 font-medium">
                      {inspo.style}
                    </CardDescription>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <p className="text-gray-600 text-sm mb-4 text-center">
                    {inspo.description}
                  </p>
                  
                  <div className="flex items-center justify-center space-x-4 mb-4">
                    <Badge 
                      variant={inspo.category === 'Color' ? 'default' : 'secondary'}
                      className={inspo.category === 'Color' ? 'bg-purple-100 text-purple-800' : ''}
                    >
                      {inspo.category}
                    </Badge>
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      {inspo.bookings} bookings
                    </div>
                  </div>
                  
                  <Button className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700">
                    Get This Look
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Trend Prediction */}
        <section className="mb-12">
          <Card className="bg-gradient-to-r from-indigo-100 to-purple-100 border-indigo-200">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-indigo-900 mb-2">
                What's Coming Next?
              </CardTitle>
              <CardDescription className="text-indigo-700 text-lg">
                Upcoming trends predicted by our style experts
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div className="space-y-2">
                  <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center mx-auto">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="font-semibold text-indigo-900">Spring 2025</h4>
                  <p className="text-sm text-indigo-700">Pastel highlights and soft, romantic curls</p>
                </div>
                
                <div className="space-y-2">
                  <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="font-semibold text-indigo-900">Summer 2025</h4>
                  <p className="text-sm text-indigo-700">Ultra-short pixie cuts and bold neon streaks</p>
                </div>
                
                <div className="space-y-2">
                  <div className="w-12 h-12 bg-pink-600 rounded-full flex items-center justify-center mx-auto">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="font-semibold text-indigo-900">Year-Round</h4>
                  <p className="text-sm text-indigo-700">Natural textures and sustainable hair care</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Call to Action */}
        <div className="text-center py-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-white">
          <h3 className="text-2xl font-bold mb-4">
            Ready to Try a New Trend?
          </h3>
          <p className="mb-6 max-w-2xl mx-auto">
            Book an appointment with one of our expert stylists to bring these trending looks to life.
          </p>
          <div className="flex justify-center space-x-4">
            <Button className="bg-white text-purple-600 hover:bg-gray-100">
              Book Consultation
            </Button>
            <Button variant="outline" className="border-white text-white hover:bg-white hover:text-purple-600">
              Browse Stylists
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrendsSection;
