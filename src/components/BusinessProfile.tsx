
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Camera, MapPin, Instagram, Facebook, Twitter, Link, Plus, Edit, Trash2, Save, CreditCard } from 'lucide-react';
import CustomAlert from '@/components/CustomAlert';
import { useForm } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface BusinessProfileData {
  businessName: string;
  businessDescription: string;
  businessImage: string;
  location: string;
  socialMedia: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    website?: string;
  };
  portfolio: Array<{
    id: number;
    image: string;
    title: string;
    description: string;
  }>;
}

const BusinessProfile = () => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [showPortfolioModal, setShowPortfolioModal] = useState(false);
  const [editingPortfolioItem, setEditingPortfolioItem] = useState<any>(null);
  const [paystackPublicKey, setPaystackPublicKey] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  
  // Alert state
  const [alertInfo, setAlertInfo] = useState<{
    show: boolean;
    type: 'success' | 'error' | 'info';
    title: string;
    message: string;
  }>({ show: false, type: 'info', title: '', message: '' });

  useEffect(() => {
    const fetchUserProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        const { data: profile } = await supabase
          .from('profiles')
          .select('paystack_public_key')
          .eq('user_id', user.id)
          .single();
        
        if (profile?.paystack_public_key) {
          setPaystackPublicKey(profile.paystack_public_key);
        }
      }
    };
    
    fetchUserProfile();
  }, []);

  // Business profile data - fetched from database
  const [profileData, setProfileData] = useState<BusinessProfileData>({
    businessName: '',
    businessDescription: '',
    businessImage: '',
    location: '',
    socialMedia: {},
    portfolio: []
  });

  // Forms
  const profileForm = useForm({
    defaultValues: {
      businessName: profileData.businessName,
      businessDescription: profileData.businessDescription,
      businessImage: profileData.businessImage,
      location: profileData.location,
      instagram: profileData.socialMedia.instagram || '',
      facebook: profileData.socialMedia.facebook || '',
      twitter: profileData.socialMedia.twitter || '',
      website: profileData.socialMedia.website || ''
    }
  });

  const portfolioForm = useForm({
    defaultValues: {
      title: '',
      description: '',
      image: ''
    }
  });

  // Show custom alert
  const showAlert = (type: 'success' | 'error' | 'info', title: string, message: string) => {
    setAlertInfo({ show: true, type, title, message });
  };

  // Handle profile save
  const handleProfileSave = (data: any) => {
    setProfileData({
      ...profileData,
      businessName: data.businessName,
      businessDescription: data.businessDescription,
      businessImage: data.businessImage,
      location: data.location,
      socialMedia: {
        instagram: data.instagram,
        facebook: data.facebook,
        twitter: data.twitter,
        website: data.website
      }
    });
    setIsEditing(false);
    showAlert('success', 'Profile Updated', 'Your business profile has been successfully updated.');
  };

  // Portfolio management
  const handleAddPortfolioItem = () => {
    setEditingPortfolioItem(null);
    portfolioForm.reset();
    setShowPortfolioModal(true);
  };

  const handleEditPortfolioItem = (item: any) => {
    setEditingPortfolioItem(item);
    portfolioForm.reset({
      title: item.title,
      description: item.description,
      image: item.image
    });
    setShowPortfolioModal(true);
  };

  const handlePortfolioSubmit = (data: any) => {
    if (editingPortfolioItem) {
      setProfileData(prev => ({
        ...prev,
        portfolio: prev.portfolio.map(item => 
          item.id === editingPortfolioItem.id 
            ? { ...item, ...data }
            : item
        )
      }));
      showAlert('success', 'Portfolio Updated', 'Portfolio item has been successfully updated.');
    } else {
      const newItem = {
        id: Date.now(),
        ...data
      };
      setProfileData(prev => ({
        ...prev,
        portfolio: [...prev.portfolio, newItem]
      }));
      showAlert('success', 'Portfolio Added', 'New portfolio item has been successfully added.');
    }
    setShowPortfolioModal(false);
  };

  const handleDeletePortfolioItem = (itemId: number) => {
    setProfileData(prev => ({
      ...prev,
      portfolio: prev.portfolio.filter(item => item.id !== itemId)
    }));
    showAlert('info', 'Portfolio Removed', 'Portfolio item has been removed.');
  };

  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case 'instagram': return Instagram;
      case 'facebook': return Facebook;
      case 'twitter': return Twitter;
      case 'website': return Link;
      default: return Link;
    }
  };

  const handleSavePaymentDetails = async () => {
    if (!userId) {
      toast({
        title: "Error",
        description: "User not logged in",
        variant: "destructive"
      });
      return;
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        paystack_public_key: paystackPublicKey,
        paystack_status: 'Completed'
      })
      .eq('user_id', userId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to save payment details",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Payment details saved successfully"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Business Profile</h1>
            <p className="text-gray-600">Manage your business information and showcase your work</p>
          </div>
          <Button 
            onClick={() => setIsEditing(!isEditing)}
            variant={isEditing ? "outline" : "default"}
          >
            <Edit className="mr-2 h-4 w-4" />
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </Button>
        </div>

        {/* Service Categories */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Our Platform Serves</CardTitle>
            <CardDescription>We provide comprehensive management tools for various wellness and beauty businesses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <h3 className="font-semibold text-lg text-gray-900">Hair Salons</h3>
                <p className="text-gray-600 text-sm">Online booking, appointment management, and marketing tools.</p>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold text-lg text-gray-900">Barbershops</h3>
                <p className="text-gray-600 text-sm">Streamlined scheduling, client management, and payment processing.</p>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold text-lg text-gray-900">Nail Salons</h3>
                <p className="text-gray-600 text-sm">Tools for managing appointments, inventory, and client information.</p>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold text-lg text-gray-900">Spas</h3>
                <p className="text-gray-600 text-sm">Online booking, treatment management, and customer communication.</p>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold text-lg text-gray-900">Massage Therapists</h3>
                <p className="text-gray-600 text-sm">Appointments, scheduling, client history management.</p>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold text-lg text-gray-900">Fitness Studios</h3>
                <p className="text-gray-600 text-sm">Online booking, class management, and membership tracking.</p>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold text-lg text-gray-900">Physical Therapy Clinics</h3>
                <p className="text-gray-600 text-sm">Streamlined appointment scheduling and patient management.</p>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold text-lg text-gray-900">Health Practices</h3>
                <p className="text-gray-600 text-sm">Appointment scheduling, client records, and reporting features.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Business Profile Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Business Information</CardTitle>
            <CardDescription>Your business details and contact information</CardDescription>
          </CardHeader>
          <CardContent>
            {!isEditing ? (
              <div className="space-y-6">
                {/* Business Image & Basic Info */}
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-shrink-0">
                    <img 
                      src={profileData.businessImage} 
                      alt={profileData.businessName}
                      className="w-32 h-32 rounded-lg object-cover border-2 border-gray-200"
                    />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {profileData.businessName}
                    </h2>
                    <div className="flex items-center text-gray-600 mb-3">
                      <MapPin className="mr-2 h-4 w-4" />
                      {profileData.location}
                    </div>
                    <p className="text-gray-700 leading-relaxed">
                      {profileData.businessDescription}
                    </p>
                  </div>
                </div>

                {/* Social Media Links */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Social Media & Links</h3>
                  <div className="flex flex-wrap gap-3">
                    {Object.entries(profileData.socialMedia).map(([platform, handle]) => {
                      if (!handle) return null;
                      const IconComponent = getSocialIcon(platform);
                      return (
                        <Badge key={platform} variant="secondary" className="px-3 py-2">
                          <IconComponent className="mr-2 h-4 w-4" />
                          {handle}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(handleProfileSave)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={profileForm.control}
                      name="businessName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter business name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={profileForm.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <Input placeholder="City, Country" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={profileForm.control}
                    name="businessImage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Image URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/image.jpg" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={profileForm.control}
                    name="businessDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe your business, services, and what makes you unique..."
                            className="min-h-[100px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Social Media & Links</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={profileForm.control}
                        name="instagram"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Instagram Handle</FormLabel>
                            <FormControl>
                              <Input placeholder="@yourbusiness" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={profileForm.control}
                        name="facebook"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Facebook Page</FormLabel>
                            <FormControl>
                              <Input placeholder="YourBusinessPage" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={profileForm.control}
                        name="twitter"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Twitter Handle</FormLabel>
                            <FormControl>
                              <Input placeholder="@yourbusiness" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={profileForm.control}
                        name="website"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Website URL</FormLabel>
                            <FormControl>
                              <Input placeholder="www.yourbusiness.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      <Save className="mr-2 h-4 w-4" />
                      Save Profile
                    </Button>
                  </div>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>

        {/* Payment Setup Section */}
        <Card className="mb-8" id="payment-setup">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Setup
            </CardTitle>
            <CardDescription>Configure your Paystack payment integration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Paystack Public Key</label>
              <Input 
                placeholder="pk_test_xxxxxxxxxxxx"
                value={paystackPublicKey}
                onChange={(e) => setPaystackPublicKey(e.target.value)}
              />
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Don't have a Paystack account?{' '}
                <a 
                  href="https://paystack.com/signup" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Register here
                </a>
              </p>
              <Button onClick={handleSavePaymentDetails}>
                Save Payment Details
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Portfolio Section */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Portfolio</CardTitle>
                <CardDescription>Showcase your best work and attract new customers</CardDescription>
              </div>
              <Button onClick={handleAddPortfolioItem}>
                <Plus className="mr-2 h-4 w-4" />
                Add Work
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {profileData.portfolio.map((item) => (
                <div key={item.id} className="border rounded-lg overflow-hidden bg-white shadow-sm">
                  <img 
                    src={item.image} 
                    alt={item.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-lg">{item.title}</h4>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditPortfolioItem(item)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeletePortfolioItem(item.id)}
                          className="text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {profileData.portfolio.length === 0 && (
              <div className="text-center py-12">
                <Camera className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No portfolio items yet</h3>
                <p className="text-gray-600 mb-4">Start showcasing your work by adding your first portfolio item</p>
                <Button onClick={handleAddPortfolioItem}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Work
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Portfolio Modal */}
        {showPortfolioModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-semibold mb-4">
                {editingPortfolioItem ? 'Edit Portfolio Item' : 'Add Portfolio Item'}
              </h3>
              
              <Form {...portfolioForm}>
                <form onSubmit={portfolioForm.handleSubmit(handlePortfolioSubmit)} className="space-y-4">
                  <FormField
                    control={portfolioForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Bridal Styling" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={portfolioForm.control}
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
                    control={portfolioForm.control}
                    name="image"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Image URL</FormLabel>
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
                      onClick={() => setShowPortfolioModal(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingPortfolioItem ? 'Update' : 'Add'} Portfolio Item
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </div>
        )}

        {/* Custom Alert */}
        <CustomAlert
          isOpen={alertInfo.show}
          onClose={() => setAlertInfo(prev => ({ ...prev, show: false }))}
          type={alertInfo.type}
          title={alertInfo.title}
          message={alertInfo.message}
        />
      </div>
    </div>
  );
};

export default BusinessProfile;
