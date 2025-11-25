import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Eye, 
  EyeOff, 
  Upload, 
  MapPin, 
  Phone, 
  Mail, 
  Building2, 
  Globe, 
  Shield, 
  CheckCircle, 
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Camera
} from 'lucide-react';
import CustomAlert from '@/components/CustomAlert';
import { supabase } from "@/integrations/supabase/client";

interface EnhancedRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (role: 'customer' | 'hairdresser' | 'employee', name: string) => void;
  onSwitchToLogin: () => void;
  defaultRole?: 'customer' | 'hairdresser' | 'employee';
}

interface RegistrationFormData {
  // Step 1: Essential Information
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: 'customer' | 'hairdresser' | 'employee';
  
  // Step 2: Profile & Preferences
  username: string;
  businessName: string;
  city: string;
  province: string;
  country: string;
  preferredLanguage: string;
  
  // Step 3: Consent & Verification
  termsAccepted: boolean;
  marketingConsent: boolean;
  smsMarketingConsent: boolean;
  profilePicture: File | null;
  
  // Verification
  emailVerificationSent: boolean;
  phoneVerificationSent: boolean;
  otpCode: string;
}

// South African provinces
const SA_PROVINCES = [
  'Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal', 
  'Limpopo', 'Mpumalanga', 'Northern Cape', 'North West', 'Western Cape'
];

// South African languages
const SA_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'af', name: 'Afrikaans' },
  { code: 'zu', name: 'isiZulu' },
  { code: 'xh', name: 'isiXhosa' },
  { code: 'st', name: 'Sesotho' },
  { code: 'nso', name: 'Sepedi' },
  { code: 'tn', name: 'Setswana' },
  { code: 'ts', name: 'Xitsonga' },
  { code: 'ss', name: 'siSwati' },
  { code: 've', name: 'Tshivenda' },
  { code: 'nr', name: 'isiNdebele' }
];

const EnhancedRegistrationModal: React.FC<EnhancedRegistrationModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  onSwitchToLogin,
  defaultRole = 'customer'
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [alertInfo, setAlertInfo] = useState<{
    show: boolean;
    type: 'success' | 'error' | 'info';
    title: string;
    message: string;
  }>({ show: false, type: 'info', title: '', message: '' });

  const [formData, setFormData] = useState<RegistrationFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: defaultRole,
    username: '',
    businessName: '',
    city: '',
    province: '',
    country: 'ZA',
    preferredLanguage: 'en',
    termsAccepted: false,
    marketingConsent: false,
    smsMarketingConsent: false,
    profilePicture: null,
    emailVerificationSent: false,
    phoneVerificationSent: false,
    otpCode: ''
  });

  const showAlert = (type: 'success' | 'error' | 'info', title: string, message: string) => {
    setAlertInfo({ show: true, type, title, message });
  };

  const handleInputChange = (field: keyof RegistrationFormData, value: string | boolean | File | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Validation functions
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^(\+27|0)[0-9]{9}$/;
    return phoneRegex.test(phone.replace(/\s+/g, ''));
  };

  const validatePassword = (password: string): { valid: boolean; strength: number; message: string } => {
    const minLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    let strength = 0;
    if (minLength) strength += 20;
    if (hasUppercase) strength += 20;
    if (hasLowercase) strength += 20;
    if (hasNumbers) strength += 20;
    if (hasSpecialChar) strength += 20;
    
    let message = '';
    if (strength < 60) {
      message = 'Password too weak. Include uppercase, lowercase, numbers, and special characters.';
    } else if (strength < 80) {
      message = 'Good password strength';
    } else {
      message = 'Strong password';
    }
    
    return { valid: strength >= 60, strength, message };
  };

  const validateUsername = (username: string): boolean => {
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    return usernameRegex.test(username);
  };

  // Step validation
  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.email || !validateEmail(formData.email)) {
          showAlert('error', 'Invalid Email', 'Please enter a valid email address.');
          return false;
        }
        if (!formData.password || !validatePassword(formData.password).valid) {
          showAlert('error', 'Invalid Password', validatePassword(formData.password).message);
          return false;
        }
        if (formData.password !== formData.confirmPassword) {
          showAlert('error', 'Password Mismatch', 'Passwords do not match.');
          return false;
        }
        if (!formData.firstName.trim() || !formData.lastName.trim()) {
          showAlert('error', 'Missing Information', 'Please enter your first and last name.');
          return false;
        }
        if (!formData.phone || !validatePhone(formData.phone)) {
          showAlert('error', 'Invalid Phone', 'Please enter a valid South African phone number.');
          return false;
        }
        return true;
      
      case 2:
        if (!formData.username || !validateUsername(formData.username)) {
          showAlert('error', 'Invalid Username', 'Username must be 3-20 characters, letters, numbers, and underscores only.');
          return false;
        }
        if (formData.role === 'hairdresser' && !formData.businessName.trim()) {
          showAlert('error', 'Missing Business Name', 'Please enter your business name.');
          return false;
        }
        if (!formData.city.trim() || !formData.province) {
          showAlert('error', 'Missing Location', 'Please enter your city and province.');
          return false;
        }
        return true;
      
      case 3:
        if (!formData.termsAccepted) {
          showAlert('error', 'Terms Required', 'Please accept the terms and conditions to continue.');
          return false;
        }
        return true;
      
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleRegistration = async () => {
    if (!validateStep(3)) return;
    
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: `${formData.firstName} ${formData.lastName}`,
            role: formData.role,
            username: formData.username,
            preferred_language: formData.preferredLanguage,
            business_name: formData.businessName || null,
            city: formData.city,
            province: formData.province,
            country: formData.country,
            marketing_consent: formData.marketingConsent,
            sms_marketing_consent: formData.smsMarketingConsent,
            phone: formData.phone
          }
        }
      });

      if (error) {
        showAlert('error', 'Registration Failed', error.message);
        return;
      }

      if (data.user) {
        // Track consent
        if (data.user.id) {
          const profileResponse = await supabase
            .from('profiles')
            .select('id')
            .eq('user_id', data.user.id)
            .single();

          if (profileResponse.data) {
            await supabase.from('consent_records').insert([
              {
                profile_id: profileResponse.data.id,
                consent_type: 'terms_and_conditions',
                ip_address: null, // Would be populated by edge function in production
                user_agent: navigator.userAgent
              },
              {
                profile_id: profileResponse.data.id,
                consent_type: 'marketing_emails',
                ip_address: null,
                user_agent: navigator.userAgent
              }
            ]);
          }
        }

        showAlert('success', 'Registration Successful!', 
          'Your account has been created! Please check your email to verify your account, then you can log in.');
        
        setTimeout(() => {
          onSwitchToLogin();
          resetForm();
        }, 3000);
      }
    } catch (error) {
      console.error('Registration error:', error);
      showAlert('error', 'Registration Failed', 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      phone: '',
      role: defaultRole,
      username: '',
      businessName: '',
      city: '',
      province: '',
      country: 'ZA',
      preferredLanguage: 'en',
      termsAccepted: false,
      marketingConsent: false,
      smsMarketingConsent: false,
      profilePicture: null,
      emailVerificationSent: false,
      phoneVerificationSent: false,
      otpCode: ''
    });
    setCurrentStep(1);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const getStepTitle = (step: number) => {
    switch (step) {
      case 1: return 'Essential Information';
      case 2: return 'Profile Setup';
      case 3: return 'Privacy & Preferences';
      default: return '';
    }
  };

  const progress = (currentStep / 3) * 100;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="bg-purple-100 p-3 rounded-full">
                <User className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <DialogTitle className="text-center text-2xl font-bold text-gray-900">
              Join Bookang Today
            </DialogTitle>
            <DialogDescription className="text-center text-gray-600">
              Create your account in just a few simple steps
            </DialogDescription>
          </DialogHeader>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-500 mb-2">
              <span>Step {currentStep} of 3</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="text-center mt-2">
              <Badge variant="outline" className="text-purple-600 border-purple-200">
                {getStepTitle(currentStep)}
              </Badge>
            </div>
          </div>

          <Card className="border-0 shadow-none">
            <CardContent className="p-0">
              {/* Step 1: Essential Information */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        type="text"
                        placeholder="Enter first name"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        type="text"
                        placeholder="Enter last name"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <div className="relative mt-1">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        inputMode="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <div className="relative mt-1">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="phone"
                        type="tel"
                        inputMode="tel"
                        placeholder="+27 or 0XX XXX XXXX"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      South African phone number for OTP verification
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="role">Account Type *</Label>
                    <Select 
                      value={formData.role} 
                      onValueChange={(value: 'customer' | 'hairdresser' | 'employee') => 
                        handleInputChange('role', value)
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select account type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="customer">Customer - Book appointments</SelectItem>
                        <SelectItem value="hairdresser">Business - Provide services</SelectItem>
                        <SelectItem value="employee">Employee - Team member</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="password">Password *</Label>
                    <div className="relative mt-1">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a strong password"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    </div>
                    {formData.password && (
                      <div className="mt-2">
                        <Progress 
                          value={validatePassword(formData.password).strength} 
                          className="h-1" 
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          {validatePassword(formData.password).message}
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword">Confirm Password *</Label>
                    <div className="relative mt-1">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    </div>
                    {formData.confirmPassword && (
                      <div className="flex items-center mt-1">
                        {formData.password === formData.confirmPassword ? (
                          <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-red-500 mr-1" />
                        )}
                        <p className={`text-xs ${
                          formData.password === formData.confirmPassword 
                            ? 'text-green-600' 
                            : 'text-red-600'
                        }`}>
                          {formData.password === formData.confirmPassword 
                            ? 'Passwords match' 
                            : 'Passwords do not match'
                          }
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 2: Profile Setup */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="username">Username *</Label>
                    <div className="relative mt-1">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="username"
                        type="text"
                        placeholder="Choose a unique username"
                        value={formData.username}
                        onChange={(e) => handleInputChange('username', e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      3-20 characters, letters, numbers, and underscores only
                    </p>
                  </div>

                  {formData.role === 'hairdresser' && (
                    <div>
                      <Label htmlFor="businessName">Business Name *</Label>
                      <div className="relative mt-1">
                        <Building2 className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="businessName"
                          type="text"
                          placeholder="Your salon or business name"
                          value={formData.businessName}
                          onChange={(e) => handleInputChange('businessName', e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City *</Label>
                      <div className="relative mt-1">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="city"
                          type="text"
                          placeholder="Your city"
                          value={formData.city}
                          onChange={(e) => handleInputChange('city', e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="province">Province *</Label>
                      <Select 
                        value={formData.province} 
                        onValueChange={(value) => handleInputChange('province', value)}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select province" />
                        </SelectTrigger>
                        <SelectContent>
                          {SA_PROVINCES.map(province => (
                            <SelectItem key={province} value={province}>
                              {province}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="preferredLanguage">Preferred Language</Label>
                    <div className="relative mt-1">
                      <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Select 
                        value={formData.preferredLanguage} 
                        onValueChange={(value) => handleInputChange('preferredLanguage', value)}
                      >
                        <SelectTrigger className="pl-10">
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                          {SA_LANGUAGES.map(lang => (
                            <SelectItem key={lang.code} value={lang.code}>
                              {lang.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Privacy & Preferences */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                    <Shield className="h-5 w-5 text-purple-600 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-2">Privacy & Data Protection</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Your privacy matters to us. We comply with POPIA (South Africa) and GDPR standards 
                        to protect your personal information.
                      </p>
                      
                      <div className="space-y-3">
                        <div className="flex items-start space-x-3">
                          <Checkbox 
                            id="terms"
                            checked={formData.termsAccepted}
                            onCheckedChange={(checked) => 
                              handleInputChange('termsAccepted', !!checked)
                            }
                          />
                          <div className="text-sm">
                            <Label htmlFor="terms" className="font-medium text-gray-900">
                              I accept the Terms & Conditions and Privacy Policy *
                            </Label>
                            <p className="text-gray-500 text-xs mt-1">
                              Required to create your account
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start space-x-3">
                          <Checkbox 
                            id="marketing"
                            checked={formData.marketingConsent}
                            onCheckedChange={(checked) => 
                              handleInputChange('marketingConsent', !!checked)
                            }
                          />
                          <div className="text-sm">
                            <Label htmlFor="marketing" className="font-medium text-gray-900">
                              Send me promotional emails about new features and offers
                            </Label>
                            <p className="text-gray-500 text-xs mt-1">
                              You can unsubscribe at any time
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start space-x-3">
                          <Checkbox 
                            id="sms"
                            checked={formData.smsMarketingConsent}
                            onCheckedChange={(checked) => 
                              handleInputChange('smsMarketingConsent', !!checked)
                            }
                          />
                          <div className="text-sm">
                            <Label htmlFor="sms" className="font-medium text-gray-900">
                              Send me SMS notifications about appointments and offers
                            </Label>
                            <p className="text-gray-500 text-xs mt-1">
                              Standard message rates may apply
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-center">
                    <p className="text-sm text-gray-600">
                      By creating an account, you agree to our data processing practices 
                      as outlined in our Privacy Policy. You have the right to access, 
                      modify, or delete your data at any time.
                    </p>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8">
                <div>
                  {currentStep > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={prevStep}
                      className="flex items-center"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Previous
                    </Button>
                  )}
                </div>

                <div className="flex space-x-3">
                  {currentStep < 3 ? (
                    <Button
                      type="button"
                      onClick={nextStep}
                      className="flex items-center bg-purple-600 hover:bg-purple-700"
                    >
                      Continue
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={handleRegistration}
                      disabled={isLoading}
                      className="flex items-center bg-purple-600 hover:bg-purple-700"
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Creating Account...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Create Account
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>

              {/* Switch to Login */}
              <div className="mt-6 text-center">
                <Button
                  variant="link"
                  onClick={onSwitchToLogin}
                  className="text-purple-600 hover:text-purple-700"
                >
                  Already have an account? Sign in here
                </Button>
              </div>
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>

      <CustomAlert
        isOpen={alertInfo.show}
        onClose={() => setAlertInfo(prev => ({ ...prev, show: false }))}
        type={alertInfo.type}
        title={alertInfo.title}
        message={alertInfo.message}
      />
    </>
  );
};

export default EnhancedRegistrationModal;