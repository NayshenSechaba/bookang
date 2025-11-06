import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, User, Building, MapPin, Phone, Mail, Globe } from 'lucide-react';
import { z } from 'zod';

// Validation schemas
const personalInfoSchema = z.object({
  full_name: z.string().trim().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  username: z.string().trim().min(3, "Username must be at least 3 characters").max(50, "Username must be less than 50 characters").optional().or(z.literal('')),
  phone: z.string().trim().regex(/^(\+27|0)[0-9]{9}$/, "Phone must be in format: 0662386107 or +27662386107").optional().or(z.literal('')),
  email: z.string().email("Invalid email address"),
  preferred_language: z.enum(['en', 'af', 'zu', 'xh']),
});

const locationSchema = z.object({
  address: z.string().trim().max(200, "Address must be less than 200 characters").optional().or(z.literal('')),
  city: z.string().trim().max(100, "City must be less than 100 characters").optional().or(z.literal('')),
  province: z.string().trim().max(100, "Province must be less than 100 characters").optional().or(z.literal('')),
  country: z.string().length(2, "Country code must be 2 characters"),
});

const businessInfoSchema = z.object({
  business_name: z.string().trim().max(150, "Business name must be less than 150 characters").optional().or(z.literal('')),
  business_description: z.string().trim().max(500, "Description must be less than 500 characters").optional().or(z.literal('')),
  business_type: z.string().trim().max(100, "Business type must be less than 100 characters").optional().or(z.literal('')),
  contact_number: z.string().trim().regex(/^(\+27|0)[0-9]{9}$/, "Phone must be in format: 0662386107 or +27662386107").optional().or(z.literal('')),
});

interface AccountSettingsProps {
  userName: string;
}

const AccountSettings = ({ userName }: AccountSettingsProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [userId, setUserId] = useState<string>('');
  const [profileId, setProfileId] = useState<string>('');
  
  // Personal Information
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState('en');
  
  // Location Information
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [country, setCountry] = useState('ZA');
  
  // Business Information
  const [businessName, setBusinessName] = useState('');
  const [businessDescription, setBusinessDescription] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [contactNumber, setContactNumber] = useState('');

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setUserId(user.id);
      setEmail(user.email || '');

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      if (profile) {
        setProfileId(profile.id);
        setFullName(profile.full_name || '');
        setUsername(profile.username || '');
        setPhone(profile.phone || '');
        setAvatarUrl(profile.avatar_url || '');
        setBannerUrl(profile.banner_url || '');
        setPreferredLanguage(profile.preferred_language || 'en');
        setAddress(profile.address || '');
        setCity(profile.city || '');
        setProvince(profile.province || '');
        setCountry(profile.country || 'ZA');
        setBusinessName(profile.business_name || '');
        setBusinessDescription(profile.business_description || '');
        setBusinessType(profile.business_type || '');
        setContactNumber(profile.contact_number || '');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile information",
        variant: "destructive",
      });
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "Image must be less than 2MB",
        variant: "destructive",
      });
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Only image files are allowed",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const filePath = `${userId}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profile-avatars')
        .getPublicUrl(filePath);

      setAvatarUrl(publicUrl);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', profileId);

      if (updateError) throw updateError;

      toast({
        title: "Success",
        description: "Profile picture updated successfully",
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Error",
        description: "Failed to upload profile picture",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB for banner)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "Banner image must be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Only image files are allowed",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const filePath = `banner-${userId}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profile-avatars')
        .getPublicUrl(filePath);

      setBannerUrl(publicUrl);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ banner_url: publicUrl })
        .eq('id', profileId);

      if (updateError) throw updateError;

      toast({
        title: "Success",
        description: "Banner image updated successfully",
      });
    } catch (error) {
      console.error('Error uploading banner:', error);
      toast({
        title: "Error",
        description: "Failed to upload banner image",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleUpdatePersonalInfo = async () => {
    try {
      setLoading(true);

      // Validate input
      const validatedData = personalInfoSchema.parse({
        full_name: fullName,
        username: username || '',
        phone: phone || '',
        email,
        preferred_language: preferredLanguage,
      });

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: validatedData.full_name,
          username: validatedData.username || null,
          phone: validatedData.phone || null,
          preferred_language: validatedData.preferred_language,
        })
        .eq('id', profileId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Personal information updated successfully",
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation Error",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else {
        console.error('Error updating personal info:', error);
        toast({
          title: "Error",
          description: "Failed to update personal information",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateLocation = async () => {
    try {
      setLoading(true);

      // Validate input
      const validatedData = locationSchema.parse({
        address: address || '',
        city: city || '',
        province: province || '',
        country,
      });

      const { error } = await supabase
        .from('profiles')
        .update({
          address: validatedData.address || null,
          city: validatedData.city || null,
          province: validatedData.province || null,
          country: validatedData.country,
        })
        .eq('id', profileId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Location information updated successfully",
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation Error",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else {
        console.error('Error updating location:', error);
        toast({
          title: "Error",
          description: "Failed to update location information",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBusinessInfo = async () => {
    try {
      setLoading(true);

      // Validate input
      const validatedData = businessInfoSchema.parse({
        business_name: businessName || '',
        business_description: businessDescription || '',
        business_type: businessType || '',
        contact_number: contactNumber || '',
      });

      const { error } = await supabase
        .from('profiles')
        .update({
          business_name: validatedData.business_name || null,
          business_description: validatedData.business_description || null,
          business_type: validatedData.business_type || null,
          contact_number: validatedData.contact_number || null,
        })
        .eq('id', profileId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Business information updated successfully",
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation Error",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else {
        console.error('Error updating business info:', error);
        toast({
          title: "Error",
          description: "Failed to update business information",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Account Settings</h1>
        <p className="text-muted-foreground">Manage your account information and preferences</p>
      </div>

      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="personal">
            <User className="w-4 h-4 mr-2" />
            Personal
          </TabsTrigger>
          <TabsTrigger value="location">
            <MapPin className="w-4 h-4 mr-2" />
            Location
          </TabsTrigger>
          <TabsTrigger value="business">
            <Building className="w-4 h-4 mr-2" />
            Business
          </TabsTrigger>
        </TabsList>

        {/* Personal Information Tab */}
        <TabsContent value="personal">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your personal details and profile picture</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Banner Image */}
              <div className="space-y-2">
                <Label>Banner Image</Label>
                {bannerUrl && (
                  <div className="relative w-full h-32 rounded-lg overflow-hidden bg-gradient-to-r from-purple-100 to-pink-100">
                    <img 
                      src={bannerUrl}
                      alt="Profile banner"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <Label htmlFor="banner" className="cursor-pointer">
                  <div className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-accent w-fit">
                    {uploading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                    <span>Upload Banner</span>
                  </div>
                </Label>
                <Input
                  id="banner"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleBannerUpload}
                  disabled={uploading}
                />
                <p className="text-xs text-muted-foreground">Max 5MB, JPG or PNG. Recommended: 1500x500px</p>
              </div>

              {/* Profile Picture */}
              <div className="flex items-center gap-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={avatarUrl} alt={fullName} />
                  <AvatarFallback>{fullName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <Label htmlFor="avatar" className="cursor-pointer">
                    <div className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-accent">
                      {uploading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4" />
                      )}
                      <span>Upload Photo</span>
                    </div>
                  </Label>
                  <Input
                    id="avatar"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                    disabled={uploading}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Max 2MB, JPG or PNG</p>
                </div>
              </div>

              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="fullName">
                  Full Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  maxLength={100}
                />
              </div>

              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Choose a username"
                  maxLength={50}
                />
              </div>

              {/* Email (Read-only) */}
              <div className="space-y-2">
                <Label htmlFor="email">
                  Email <span className="text-destructive">*</span>
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    disabled
                    className="bg-muted"
                  />
                  <Mail className="w-5 h-5 text-muted-foreground self-center" />
                </div>
                <p className="text-xs text-muted-foreground">Email cannot be changed</p>
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="flex gap-2">
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0662386107 or +27662386107"
                  />
                  <Phone className="w-5 h-5 text-muted-foreground self-center" />
                </div>
                <p className="text-xs text-muted-foreground">Required for SMS notifications</p>
              </div>

              {/* Preferred Language */}
              <div className="space-y-2">
                <Label htmlFor="language">Preferred Language</Label>
                <Select value={preferredLanguage} onValueChange={setPreferredLanguage}>
                  <SelectTrigger id="language">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="af">Afrikaans</SelectItem>
                    <SelectItem value="zu">Zulu</SelectItem>
                    <SelectItem value="xh">Xhosa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleUpdatePersonalInfo} disabled={loading} className="w-full">
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Save Personal Information
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Location Tab */}
        <TabsContent value="location">
          <Card>
            <CardHeader>
              <CardTitle>Location Information</CardTitle>
              <CardDescription>Update your address and location details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Address */}
              <div className="space-y-2">
                <Label htmlFor="address">Street Address</Label>
                <Textarea
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter your street address"
                  maxLength={200}
                  rows={3}
                />
              </div>

              {/* City */}
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Enter your city"
                  maxLength={100}
                />
              </div>

              {/* Province */}
              <div className="space-y-2">
                <Label htmlFor="province">Province / State</Label>
                <Input
                  id="province"
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  placeholder="Enter your province or state"
                  maxLength={100}
                />
              </div>

              {/* Country */}
              <div className="space-y-2">
                <Label htmlFor="country">Country Code</Label>
                <Input
                  id="country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value.toUpperCase())}
                  placeholder="ZA"
                  maxLength={2}
                />
                <p className="text-xs text-muted-foreground">2-letter country code (e.g., ZA for South Africa)</p>
              </div>

              <Button onClick={handleUpdateLocation} disabled={loading} className="w-full">
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Save Location Information
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Business Information Tab */}
        <TabsContent value="business">
          <Card>
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
              <CardDescription>Update your business details (for service providers)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Business Name */}
              <div className="space-y-2">
                <Label htmlFor="businessName">Business Name</Label>
                <Input
                  id="businessName"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Enter your business name"
                  maxLength={150}
                />
              </div>

              {/* Business Type */}
              <div className="space-y-2">
                <Label htmlFor="businessType">Business Type</Label>
                <Input
                  id="businessType"
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  placeholder="e.g., Consulting, Clinic, Legal Services, Coaching"
                  maxLength={100}
                />
              </div>

              {/* Business Description */}
              <div className="space-y-2">
                <Label htmlFor="businessDescription">Business Description</Label>
                <Textarea
                  id="businessDescription"
                  value={businessDescription}
                  onChange={(e) => setBusinessDescription(e.target.value)}
                  placeholder="Describe your business"
                  maxLength={500}
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">{businessDescription.length}/500 characters</p>
              </div>

              {/* Contact Number */}
              <div className="space-y-2">
                <Label htmlFor="contactNumber">Business Contact Number</Label>
                <Input
                  id="contactNumber"
                  type="tel"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  placeholder="0662386107 or +27662386107"
                />
              </div>

              <Button onClick={handleUpdateBusinessInfo} disabled={loading} className="w-full">
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Save Business Information
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AccountSettings;
