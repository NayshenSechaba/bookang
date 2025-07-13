
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Image, Plus, Edit, Trash2, Upload } from 'lucide-react';
import { PortfolioImage } from '@/types/dashboard';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';

interface PortfolioSectionProps {
  images: PortfolioImage[];
  onImageUpload: (newImage: PortfolioImage) => void;
  onImageEdit: (updatedImage: PortfolioImage) => void;
  onImageDelete: (id: number) => void;
}

const PortfolioSection = ({ images, onImageUpload, onImageEdit, onImageDelete }: PortfolioSectionProps) => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [editingImage, setEditingImage] = useState<PortfolioImage | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState('');
  const { toast } = useToast();

  const form = useForm({
    defaultValues: {
      title: '',
      description: '',
      category: 'haircut',
      imageFile: null as File | null,
      imageUrl: ''
    }
  });

  const handleImageUpload = (data: any) => {
    // Handle custom category
    let finalCategory = data.category;
    if (data.category === 'other' && customCategory.trim()) {
      finalCategory = customCategory.trim();
    } else if (data.category === 'other' && !customCategory.trim()) {
      toast({
        title: "Error",
        description: "Please specify a custom category.",
        variant: "destructive"
      });
      return;
    }
    // Validate that either a file is uploaded or URL is provided
    if (!data.imageFile && !data.imageUrl) {
      toast({
        title: "Error",
        description: "Please select a file to upload or provide an image URL.",
        variant: "destructive"
      });
      return;
    }

    // Validate that title is provided
    if (!data.title.trim()) {
      toast({
        title: "Error", 
        description: "Please provide a title for your upload.",
        variant: "destructive"
      });
      return;
    }

    const newImage: PortfolioImage = {
      id: Date.now(),
      url: data.imageFile ? URL.createObjectURL(data.imageFile) : data.imageUrl,
      title: data.title,
      description: data.description,
      category: finalCategory,
      dateAdded: new Date().toISOString().split('T')[0]
    };
    
    onImageUpload(newImage);
    // Reset form and custom category
    form.reset();
    setCustomCategory('');
    setShowCustomCategory(false);
    setShowUploadModal(false);
    toast({
      title: "Success",
      description: "Image/video uploaded successfully!",
    });
  };

  const handleEditImage = (image: PortfolioImage) => {
    setEditingImage(image);
    
    // Check if the category is a custom one (not in our predefined list)
    const predefinedCategories = [
      'haircut', 'color', 'styling', 'treatment', 'bridal-hair', 'extensions',
      'mens-haircut', 'beard-trim', 'shave', 'mustache', 'fade',
      'manicure', 'pedicure', 'nail-art', 'gel-nails', 'acrylic-nails', 'nail-extensions',
      'facial', 'massage', 'body-treatment', 'skincare', 'waxing', 'eyebrow-services'
    ];
    
    if (predefinedCategories.includes(image.category)) {
      form.reset({
        title: image.title,
        description: image.description,
        category: image.category,
        imageFile: null,
        imageUrl: image.url
      });
      setShowCustomCategory(false);
      setCustomCategory('');
    } else {
      // It's a custom category
      form.reset({
        title: image.title,
        description: image.description,
        category: 'other',
        imageFile: null,
        imageUrl: image.url
      });
      setShowCustomCategory(true);
      setCustomCategory(image.category);
    }
    
    setShowUploadModal(true);
  };

  const handleEditSubmit = (data: any) => {
    if (editingImage) {
      // Handle custom category for edit
      let finalCategory = data.category;
      if (data.category === 'other' && customCategory.trim()) {
        finalCategory = customCategory.trim();
      } else if (data.category === 'other' && !customCategory.trim()) {
        toast({
          title: "Error",
          description: "Please specify a custom category.",
          variant: "destructive"
        });
        return;
      }

      // Validate that title is provided
      if (!data.title.trim()) {
        toast({
          title: "Error",
          description: "Please provide a title for your upload.",
          variant: "destructive"
        });
        return;
      }

      const updatedImage: PortfolioImage = {
        ...editingImage,
        title: data.title,
        description: data.description,
        category: finalCategory,
        url: data.imageFile ? URL.createObjectURL(data.imageFile) : data.imageUrl || editingImage.url
      };
      
      onImageEdit(updatedImage);
      // Reset form and custom category
      form.reset();
      setCustomCategory('');
      setShowCustomCategory(false);
      setShowUploadModal(false);
      setEditingImage(null);
      toast({
        title: "Success",
        description: "Image/video updated successfully!",
      });
    }
  };

  const handleDeleteClick = (id: number) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = () => {
    if (deleteConfirmId) {
      onImageDelete(deleteConfirmId);
      setDeleteConfirmId(null);
      toast({
        title: "Deleted",
        description: "Image/video has been removed from your portfolio.",
      });
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmId(null);
  };

  const handleCloseModal = () => {
    setShowUploadModal(false);
    setEditingImage(null);
    form.reset();
  };

  return (
    <>
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
              <Button onClick={() => setShowUploadModal(true)}>
                <Upload className="mr-2 h-4 w-4" />
                Upload Image/Video
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
                        onClick={() => handleEditImage(image)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleDeleteClick(image.id)}
                        className="text-red-600 hover:bg-red-50 hover:text-red-700"
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
                <p className="text-gray-600 mb-4">Add photos or videos of your best work to attract customers</p>
                <Button onClick={() => setShowUploadModal(true)}>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Your First Photo/Video
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Upload/Edit Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">
              {editingImage ? 'Edit Portfolio Item' : 'Upload New Image or Video'}
            </h3>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(editingImage ? handleEditSubmit : handleImageUpload)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Bridal Styling" {...field} required />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Brief description of this work"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <FormControl>
                        <select 
                          {...field}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                          onChange={(e) => {
                            field.onChange(e);
                            setShowCustomCategory(e.target.value === 'other');
                            if (e.target.value !== 'other') {
                              setCustomCategory('');
                            }
                          }}
                        >
                          <option value="">Select a category</option>
                          
                          {/* Hair Services */}
                          <optgroup label="Hair Services">
                            <option value="haircut">Haircut</option>
                            <option value="color">Hair Color</option>
                            <option value="styling">Hair Styling</option>
                            <option value="treatment">Hair Treatment</option>
                            <option value="bridal-hair">Bridal Hair</option>
                            <option value="extensions">Hair Extensions</option>
                          </optgroup>
                          
                          {/* Barber Services */}
                          <optgroup label="Barber Services">
                            <option value="mens-haircut">Men's Haircut</option>
                            <option value="beard-trim">Beard Trim</option>
                            <option value="shave">Shave</option>
                            <option value="mustache">Mustache Styling</option>
                            <option value="fade">Fade Cuts</option>
                          </optgroup>
                          
                          {/* Nail Services */}
                          <optgroup label="Nail Services">
                            <option value="manicure">Manicure</option>
                            <option value="pedicure">Pedicure</option>
                            <option value="nail-art">Nail Art</option>
                            <option value="gel-nails">Gel Nails</option>
                            <option value="acrylic-nails">Acrylic Nails</option>
                            <option value="nail-extensions">Nail Extensions</option>
                          </optgroup>
                          
                          {/* Spa Services */}
                          <optgroup label="Spa Services">
                            <option value="facial">Facial</option>
                            <option value="massage">Massage</option>
                            <option value="body-treatment">Body Treatment</option>
                            <option value="skincare">Skincare</option>
                            <option value="waxing">Waxing</option>
                            <option value="eyebrow-services">Eyebrow Services</option>
                          </optgroup>
                          
                          <option value="other">Other</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Custom Category Input */}
                {showCustomCategory && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Custom Category *
                    </label>
                    <Input
                      type="text"
                      placeholder="Type your custom category..."
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      className="w-full"
                      required={showCustomCategory}
                    />
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="imageFile"
                  render={({ field: { onChange, value, ...field } }) => (
                    <FormItem>
                      <FormLabel>Upload Image or Video</FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          accept="image/*,video/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            onChange(file);
                          }}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="text-center text-sm text-gray-500">or</div>

                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image/Video URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/image.jpg" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleCloseModal}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingImage ? 'Update' : 'Upload'}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-sm w-full p-6">
            <h3 className="text-lg font-semibold mb-4 text-center">Delete Image/Video</h3>
            <p className="text-gray-600 text-center mb-6">
              Are you sure you want to delete this item from your portfolio? This action cannot be undone.
            </p>
            
            <div className="flex justify-end space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={cancelDelete}
              >
                Cancel
              </Button>
              <Button 
                type="button" 
                variant="destructive"
                onClick={confirmDelete}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PortfolioSection;
