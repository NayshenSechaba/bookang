
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Image, Plus, Edit, Trash2 } from 'lucide-react';
import { PortfolioImage } from '@/types/dashboard';

interface PortfolioSectionProps {
  images: PortfolioImage[];
  onImageUpload: (newImage: PortfolioImage) => void;
  onImageEdit: (updatedImage: PortfolioImage) => void;
  onImageDelete: (id: number) => void;
}

const PortfolioSection = ({ images, onImageUpload, onImageEdit, onImageDelete }: PortfolioSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Image className="mr-2 h-5 w-5 text-pink-500" />
          Style Portfolio
        </CardTitle>
        <CardDescription>
          Showcase your best work to attract new customers
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Your Work</h3>
            <Button onClick={() => onImageUpload({
              id: Date.now(),
              url: '/api/placeholder/300/300',
              title: 'New Style',
              description: 'A beautiful new style',
              category: 'haircut',
              dateAdded: new Date().toISOString().split('T')[0]
            })}>
              <Plus className="mr-2 h-4 w-4" />
              Add Style Photo
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {images.map((image) => (
              <div key={image.id} className="relative group">
                <div className="aspect-square overflow-hidden rounded-lg border">
                  <img 
                    src={image.url}
                    alt={image.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400&h=400&fit=crop';
                    }}
                  />
                </div>
                
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => onImageEdit(image)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => onImageDelete(image.id)}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-sm">{image.title}</h4>
                    <Badge variant="outline" className="text-xs">
                      {image.category}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 line-clamp-2">{image.description}</p>
                  <p className="text-xs text-gray-400 mt-1">{image.dateAdded}</p>
                </div>
              </div>
            ))}
          </div>
          
          {images.length === 0 && (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Image className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No portfolio images yet</h3>
              <p className="text-gray-600 mb-4">Add photos of your best work to attract customers</p>
              <Button onClick={() => onImageUpload({
                id: Date.now(),
                url: '/api/placeholder/300/300',
                title: 'First Style',
                description: 'Your first portfolio image',
                category: 'haircut',
                dateAdded: new Date().toISOString().split('T')[0]
              })}>
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Photo
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PortfolioSection;
