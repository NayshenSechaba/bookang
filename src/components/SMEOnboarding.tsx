import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, 
  Plus, 
  Trash2, 
  Check, 
  ArrowRight, 
  ArrowLeft, 
  Building2, 
  CreditCard,
  Calendar,
  Clock,
  MapPin,
  Scissors
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface SMEOnboardingProps {
  onComplete: () => void;
  onBack: () => void;
}

interface Service {
  id: string;
  name: string;
  duration: string;
  price: string;
}

interface WeeklySchedule {
  [key: string]: {
    isOpen: boolean;
    openTime: string;
    closeTime: string;
  };
}

const SMEOnboarding = ({ onComplete, onBack }: SMEOnboardingProps) => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Step 1: Public Business Profile
  const [businessProfile, setBusinessProfile] = useState({
    businessLogo: '',
    publicBusinessName: '',
    category: '',
    description: '',
    publicPhone: '',
    publicEmail: '',
    businessAddress: '',
    socialMediaLink: '',
    googleBusinessLink: ''
  });

  // Account credentials
  const [accountData, setAccountData] = useState({
    fullName: '',
    password: ''
  });

  const [services, setServices] = useState<Service[]>([]);
  const [weeklySchedule, setWeeklySchedule] = useState<WeeklySchedule>({
    monday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
    tuesday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
    wednesday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
    thursday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
    friday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
    saturday: { isOpen: true, openTime: '09:00', closeTime: '15:00' },
    sunday: { isOpen: false, openTime: '09:00', closeTime: '17:00' }
  });

  const businessCategories = [
    'Plumbing',
    'Hair Salon',
    'Beauty Spa',
    'Barbershop',
    'Nail Salon',
    'Consulting',
    'Electrical Services',
    'Carpentry',
    'Cleaning Services',
    'Photography',
    'Tutoring',
    'Personal Training',
    'Wellness Center',
    'Fitness Studio',
    'Massage Therapy',
    'Skincare Clinic',
    'Other'
  ];

  const daysOfWeek = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' }
  ];

  // Add new service
  const addService = () => {
    const newService: Service = {
      id: Date.now().toString(),
      name: '',
      duration: '60',
      price: ''
    };
    setServices([...services, newService]);
  };

  // Remove service
  const removeService = (id: string) => {
    setServices(services.filter(service => service.id !== id));
  };

  // Update service
  const updateService = (id: string, field: keyof Service, value: string) => {
    setServices(services.map(service => 
      service.id === id ? { ...service, [field]: value } : service
    ));
  };

  // Update schedule
  const updateSchedule = (day: string, field: string, value: string | boolean) => {
    setWeeklySchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value
      }
    }));
  };

  // Handle business profile creation
  const handleBusinessProfileCreation = async () => {
    if (!businessProfile.publicBusinessName || !businessProfile.category || 
        !businessProfile.description || !businessProfile.publicPhone || 
        !businessProfile.publicEmail || !businessProfile.businessAddress ||
        !accountData.fullName || !accountData.password) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields marked with *",
        variant: "destructive"
      });
      return;
    }

    if (businessProfile.description.length > 500) {
      toast({
        title: "Description Too Long",
        description: "Business description must be 500 characters or less.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Create Supabase auth user
      const { data, error } = await supabase.auth.signUp({
        email: businessProfile.publicEmail,
        password: accountData.password,
        options: {
          data: {
            full_name: accountData.fullName,
            business_name: businessProfile.publicBusinessName,
            role: 'hairdresser'
          }
        }
      });

      if (error) throw error;

      // Update profile with additional business info
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            business_description: businessProfile.description,
            contact_number: businessProfile.publicPhone,
            address: businessProfile.businessAddress,
            avatar_url: businessProfile.businessLogo,
            business_type: businessProfile.category
          })
          .eq('user_id', data.user.id);

        if (profileError) console.error('Profile update error:', profileError);
      }

      toast({
        title: "Profile Created",
        description: "Please check your email to verify your account.",
      });

      setCurrentStep(2);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create profile",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle services and availability
  const handleServicesAndAvailability = () => {
    if (services.length === 0) {
      toast({
        title: "Add Services",
        description: "Please add at least one service.",
        variant: "destructive"
      });
      return;
    }

    // Validate services
    const invalidServices = services.filter(service => !service.name || !service.price);
    if (invalidServices.length > 0) {
      toast({
        title: "Incomplete Services",
        description: "Please complete all service details.",
        variant: "destructive"
      });
      return;
    }

    setCurrentStep(3);
  };

  // Handle payout setup
  const handlePayoutSetup = () => {
    toast({
      title: "Payment Setup",
      description: "Payment integration coming soon! Your profile will be saved.",
    });
    setCurrentStep(4);
  };

  // Complete onboarding
  const completeOnboarding = () => {
    toast({
      title: "Welcome to Bookang!",
      description: "Your business profile is now live.",
    });
    onComplete();
  };

  // Render step 1: Create Public Business Profile
  const renderStep1 = () => (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-primary mb-2">Step 1 of 3: Create Your Public Business Profile</h1>
        <p className="text-muted-foreground">
          Let's get your profile ready for customers. This information will be displayed publicly on your "Bookang" profile page.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Business Logo</CardTitle>
          <CardDescription>
            Upload your company's logo. (Recommended: Square image, .jpg or .png, max 2MB)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="h-20 w-20 bg-muted rounded-lg flex items-center justify-center overflow-hidden border-2 border-dashed">
              {businessProfile.businessLogo ? (
                <img src={businessProfile.businessLogo} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <Upload className="h-8 w-8 text-muted-foreground" />
              )}
            </div>
            <input
              type="file"
              id="logo-upload-step1"
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  if (file.size > 2 * 1024 * 1024) {
                    toast({
                      title: "File Too Large",
                      description: "Please upload an image smaller than 2MB.",
                      variant: "destructive"
                    });
                    return;
                  }
                  try {
                    const fileExt = file.name.split('.').pop();
                    const fileName = `business-logo-${Date.now()}.${fileExt}`;
                    const filePath = `${fileName}`;

                    const { error: uploadError } = await supabase.storage
                      .from('profile-avatars')
                      .upload(filePath, file);

                    if (uploadError) throw uploadError;

                    const { data: { publicUrl } } = supabase.storage
                      .from('profile-avatars')
                      .getPublicUrl(filePath);

                    setBusinessProfile({...businessProfile, businessLogo: publicUrl});
                    
                    toast({
                      title: "Logo Uploaded",
                      description: "Your business logo has been uploaded successfully.",
                    });
                  } catch (error: any) {
                    toast({
                      title: "Upload Failed",
                      description: error.message,
                      variant: "destructive"
                    });
                  }
                }
              }}
            />
            <Button 
              variant="outline" 
              onClick={() => document.getElementById('logo-upload-step1')?.click()}
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload Logo
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Business Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="publicBusinessName">Public Business Name *</Label>
            <Input
              id="publicBusinessName"
              placeholder="The trading name your customers will see"
              value={businessProfile.publicBusinessName}
              onChange={(e) => setBusinessProfile({...businessProfile, publicBusinessName: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Business Category *</Label>
            <Select 
              value={businessProfile.category} 
              onValueChange={(value) => setBusinessProfile({...businessProfile, category: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a Category..." />
              </SelectTrigger>
              <SelectContent>
                {businessCategories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              e.g., "Plumbing", "Hair Salon", "Consulting"
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Business Description (Bio) *</Label>
            <Textarea
              id="description"
              placeholder="Tell customers what makes your business great."
              className="min-h-[100px]"
              value={businessProfile.description}
              onChange={(e) => setBusinessProfile({...businessProfile, description: e.target.value})}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground text-right">
              {businessProfile.description.length}/500 characters
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Public Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="publicPhone">Public Phone Number *</Label>
            <Input
              id="publicPhone"
              type="tel"
              placeholder="+27 12 345 6789"
              value={businessProfile.publicPhone}
              onChange={(e) => setBusinessProfile({...businessProfile, publicPhone: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="publicEmail">Public Email Address *</Label>
            <Input
              id="publicEmail"
              type="email"
              placeholder="business@example.com"
              value={businessProfile.publicEmail}
              onChange={(e) => setBusinessProfile({...businessProfile, publicEmail: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="businessAddress">Business Address or Service Area *</Label>
            <Input
              id="businessAddress"
              placeholder='e.g., "123 Main St, Sandton" or "Servicing all of Gauteng"'
              value={businessProfile.businessAddress}
              onChange={(e) => setBusinessProfile({...businessProfile, businessAddress: e.target.value})}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Online Links</CardTitle>
          <CardDescription>Optional, but highly recommended</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="socialMediaLink">Social Media Link</Label>
            <Input
              id="socialMediaLink"
              type="url"
              placeholder="https://facebook.com/yourbusiness"
              value={businessProfile.socialMediaLink}
              onChange={(e) => setBusinessProfile({...businessProfile, socialMediaLink: e.target.value})}
            />
            <p className="text-xs text-muted-foreground">
              e.g., Your Facebook, Instagram, or LinkedIn page
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="googleBusinessLink">Google Business Link</Label>
            <Input
              id="googleBusinessLink"
              type="url"
              placeholder="https://maps.google.com/yourbusiness"
              value={businessProfile.googleBusinessLink}
              onChange={(e) => setBusinessProfile({...businessProfile, googleBusinessLink: e.target.value})}
            />
            <p className="text-xs text-muted-foreground">
              Link to your Google Maps / Business Profile
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Account Setup</CardTitle>
          <CardDescription>Create your account credentials</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Your Full Name *</Label>
            <Input
              id="fullName"
              placeholder="Your full name"
              value={accountData.fullName}
              onChange={(e) => setAccountData({...accountData, fullName: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password *</Label>
            <Input
              id="password"
              type="password"
              placeholder="Choose a secure password (min 6 characters)"
              value={accountData.password}
              onChange={(e) => setAccountData({...accountData, password: e.target.value})}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button onClick={handleBusinessProfileCreation} disabled={isLoading}>
          {isLoading ? "Creating Profile..." : "Save & Continue to Verification"}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  // Render step 2: Services and Availability
  const renderStep2 = () => (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-primary mb-2">Step 2 of 3: Add Your Services & Availability</h1>
        <p className="text-muted-foreground">Define what services you offer and when you're available</p>
      </div>

      {/* Services */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Scissors className="mr-2 h-5 w-5" />
              Services
            </span>
            <Button onClick={addService} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Service
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {services.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No services added yet. Click "Add Service" to get started.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {services.map((service) => (
                <div key={service.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                      placeholder="Service name (e.g., Men's Haircut)"
                      value={service.name}
                      onChange={(e) => updateService(service.id, 'name', e.target.value)}
                    />
                    <Select
                      value={service.duration}
                      onValueChange={(value) => updateService(service.id, 'duration', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="45">45 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="90">1.5 hours</SelectItem>
                        <SelectItem value="120">2 hours</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">R</span>
                      <Input
                        type="number"
                        placeholder="250"
                        value={service.price}
                        onChange={(e) => updateService(service.id, 'price', e.target.value)}
                      />
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => removeService(service.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Availability */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="mr-2 h-5 w-5" />
            Availability
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {daysOfWeek.map(({ key, label }) => (
              <div key={key} className="flex items-center space-x-4 p-4 border rounded-lg">
                <div className="w-20">
                  <Label className="font-medium">{label}</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={weeklySchedule[key].isOpen}
                    onChange={(e) => updateSchedule(key, 'isOpen', e.target.checked)}
                    className="rounded"
                  />
                  <Label className="text-sm">Open</Label>
                </div>

                {weeklySchedule[key].isOpen && (
                  <div className="flex items-center space-x-2">
                    <Input
                      type="time"
                      value={weeklySchedule[key].openTime}
                      onChange={(e) => updateSchedule(key, 'openTime', e.target.value)}
                      className="w-32"
                    />
                    <span className="text-sm text-muted-foreground">to</span>
                    <Input
                      type="time"
                      value={weeklySchedule[key].closeTime}
                      onChange={(e) => updateSchedule(key, 'closeTime', e.target.value)}
                      className="w-32"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setCurrentStep(1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>
        <Button onClick={handleServicesAndAvailability}>
          Save and Continue
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  // Render step 3: Payout Setup
  const renderStep3 = () => (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-primary flex items-center justify-center">
          <CreditCard className="mr-2 h-6 w-6" />
          Step 3 of 3: Set Up Payouts to Get Paid
        </CardTitle>
        <CardDescription className="max-w-lg mx-auto">
          Bookang partners with Paystack and Payfast, South Africa's leading payment gateways, 
          to securely process your earnings. Connect your account to receive deposits and payments 
          directly into your bank account. We never store your banking details.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-muted/50 p-6 rounded-lg">
          <div className="flex items-center space-x-4 mb-4">
            <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <CreditCard className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Secure Payment Processing</h3>
              <p className="text-sm text-muted-foreground">
                Bank-level security with instant payouts
              </p>
            </div>
          </div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center">
              <Check className="mr-2 h-4 w-4 text-green-500" />
              Receive customer deposits automatically
            </li>
            <li className="flex items-center">
              <Check className="mr-2 h-4 w-4 text-green-500" />
              Daily payouts to your bank account
            </li>
            <li className="flex items-center">
              <Check className="mr-2 h-4 w-4 text-green-500" />
              Full transaction history and reporting
            </li>
          </ul>
        </div>

        <div className="text-center">
          <Button size="lg" onClick={handlePayoutSetup} className="w-full max-w-sm">
            <CreditCard className="mr-2 h-5 w-5" />
            Securely Connect with Paystack/Payfast
          </Button>
          <p className="text-xs text-muted-foreground mt-2">
            You can set this up later in your dashboard settings
          </p>
        </div>

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={() => setCurrentStep(2)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
          <Button variant="ghost" onClick={() => setCurrentStep(4)}>
            Skip for Now
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  // Render step 4: Completion
  const renderStep4 = () => (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
          <Check className="h-8 w-8 text-green-600" />
        </div>
        <CardTitle className="text-2xl font-bold text-primary">Welcome to Bookang!</CardTitle>
        <CardDescription>
          Your profile is live. You can now manage your bookings, services, and schedule from your dashboard.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-muted/50 p-6 rounded-lg">
          <h3 className="font-semibold mb-3">What's Next?</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center">
              <Check className="mr-2 h-4 w-4 text-green-500" />
              Complete your payment setup to start receiving bookings
            </li>
            <li className="flex items-center">
              <Check className="mr-2 h-4 w-4 text-green-500" />
              Add photos to showcase your work
            </li>
            <li className="flex items-center">
              <Check className="mr-2 h-4 w-4 text-green-500" />
              Share your profile link with customers
            </li>
          </ul>
        </div>

        <div className="text-center">
          <Button size="lg" onClick={completeOnboarding} className="w-full max-w-sm">
            Go to My Dashboard
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 py-8">
      <div className="container mx-auto px-4">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex justify-center items-center space-x-4">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`
                  h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${currentStep >= step 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'
                  }
                `}>
                  {currentStep > step ? <Check className="h-4 w-4" /> : step}
                </div>
                {step < 4 && (
                  <div className={`
                    w-16 h-1 mx-2
                    ${currentStep > step ? 'bg-primary' : 'bg-muted'}
                  `} />
                )}
              </div>
            ))}
          </div>
          <div className="text-center mt-4">
            <p className="text-sm text-muted-foreground">
              Step {currentStep} of 4
            </p>
          </div>
        </div>

        {/* Step content */}
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}
      </div>
    </div>
  );
};

export default SMEOnboarding;