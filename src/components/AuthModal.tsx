import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Scissors, User, Eye, EyeOff, Upload, FileText, IdCard, UserCheck } from 'lucide-react';
import CustomAlert from '@/components/CustomAlert';
import { supabase } from "@/integrations/supabase/client";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'login' | 'register';
  loginType: 'customer' | 'hairdresser' | 'employee';
  onAuthSuccess: (role: 'customer' | 'hairdresser' | 'employee', name: string) => void;
  onSwitchMode: (mode: 'login' | 'register') => void;
}

const AuthModal = ({ 
  isOpen, 
  onClose, 
  mode, 
  loginType, 
  onAuthSuccess, 
  onSwitchMode 
}: AuthModalProps) => {
  // Form state management
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: 'customer' as 'customer' | 'hairdresser' | 'employee',
    phoneNumber: '',
    hairdresserName: '',
    // Additional hairdresser fields
    address: '',
    telephoneNumber: '',
    idNumber: '',
    idDocument: null as File | null,
    companyRegistration: null as File | null,
    // Social media URLs
    tiktokUrl: '',
    facebookUrl: '',
    instagramUrl: ''
  });
  
  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [alertInfo, setAlertInfo] = useState<{
    show: boolean;
    type: 'success' | 'error' | 'info';
    title: string;
    message: string;
  }>({ show: false, type: 'info', title: '', message: '' });

  // Handle input changes
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle file uploads
  const handleFileChange = (field: string, file: File | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: file
    }));
  };

  // Show custom alert
  const showAlert = (type: 'success' | 'error' | 'info', title: string, message: string) => {
    setAlertInfo({ show: true, type, title, message });
  };

  // Validate email format
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validate phone number format
  const isValidPhone = (phone: string) => {
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
  };

  // Handle login form submission
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation checks
    if (!formData.email || !formData.password) {
      showAlert('error', 'Validation Error', 'Please fill in all required fields.');
      return;
    }
    
    if (!isValidEmail(formData.email)) {
      showAlert('error', 'Invalid Email', 'Please enter a valid email address.');
      return;
    }

    try {
      // Sign in with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        showAlert('error', 'Login Failed', error.message);
        return;
      }

      if (data.user) {
        // Get user profile to determine actual role
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, role')
          .eq('user_id', data.user.id)
          .single();

        const userName = profile?.full_name || data.user.email?.split('@')[0] || 'User';
        const userRole = profile?.role || loginType;
        
        // For employee login, verify they have employee role in employee_roles table
        if (loginType === 'employee') {
          const { data: employeeRole, error: roleError } = await supabase
            .from('employee_roles')
            .select('role')
            .eq('user_id', data.user.id)
            .maybeSingle();

          if (roleError || !employeeRole) {
            showAlert('error', 'Access Denied', 'You do not have employee access. Please contact an administrator.');
            await supabase.auth.signOut();
            return;
          }

          // Redirect to employee dashboard
          showAlert('success', 'Login Successful', 'Welcome back! Redirecting to employee dashboard...');
          setTimeout(() => {
            window.location.href = '/employee';
          }, 1500);
          return;
        }
        
        showAlert('success', 'Login Successful', `Welcome back! Redirecting to your ${userRole} dashboard...`);
        
        setTimeout(() => {
          onAuthSuccess(userRole as 'customer' | 'hairdresser' | 'employee', userName);
          resetForm();
        }, 1500);
      }
    } catch (error) {
      console.error('Login error:', error);
      showAlert('error', 'Login Failed', 'An unexpected error occurred. Please try again.');
    }
  };

  // Handle registration form submission
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation checks
    if (!formData.email || !formData.password || !formData.confirmPassword) {
      showAlert('error', 'Validation Error', 'Please fill in all required fields.');
      return;
    }
    
    if (!isValidEmail(formData.email)) {
      showAlert('error', 'Invalid Email', 'Please enter a valid email address.');
      return;
    }
    
    if (formData.password.length < 6) {
      showAlert('error', 'Weak Password', 'Password must be at least 6 characters long.');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      showAlert('error', 'Password Mismatch', 'Passwords do not match. Please check and try again.');
      return;
    }
    
    // Validate phone number for all users
    if (!formData.phoneNumber && formData.role !== 'hairdresser') {
      showAlert('error', 'Missing Phone Number', 'Please enter your phone number for booking confirmations.');
      return;
    }
    
    if (formData.phoneNumber && !isValidPhone(formData.phoneNumber)) {
      showAlert('error', 'Invalid Phone', 'Please enter a valid phone number.');
      return;
    }
    
    // Additional validation for hairdressers
    if (formData.role === 'hairdresser') {
      if (!formData.hairdresserName.trim()) {
        showAlert('error', 'Missing Information', 'Please enter your professional name as a business.');
        return;
      }
      
      if (!formData.address.trim()) {
        showAlert('error', 'Missing Information', 'Please enter your business address.');
        return;
      }
      
      if (!formData.telephoneNumber.trim()) {
        showAlert('error', 'Missing Information', 'Please enter your telephone number.');
        return;
      }
      
      if (!isValidPhone(formData.telephoneNumber)) {
        showAlert('error', 'Invalid Phone', 'Please enter a valid telephone number.');
        return;
      }
      
      if (!formData.idNumber.trim()) {
        showAlert('error', 'Missing Information', 'Please enter your ID or Passport number.');
        return;
      }
      
      if (!formData.idDocument) {
        showAlert('error', 'Missing Document', 'Please upload your ID or Passport document.');
        return;
      }
    }

    try {
      // Sign up with Supabase
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: formData.role === 'hairdresser' ? formData.hairdresserName : formData.email.split('@')[0],
            role: formData.role,
            phone: formData.role === 'hairdresser' ? formData.telephoneNumber : formData.phoneNumber,
            address: formData.role === 'hairdresser' ? formData.address : null,
          }
        }
      });

      if (error) {
        showAlert('error', 'Registration Failed', error.message);
        return;
      }

      if (data.user) {
        showAlert('success', 'Registration Successful', 'Your account has been created successfully! Please check your email to verify your account, then log in to continue.');
        
        setTimeout(() => {
          onSwitchMode('login');
          resetForm();
        }, 3000);
      }
    } catch (error) {
      console.error('Registration error:', error);
      showAlert('error', 'Registration Failed', 'An unexpected error occurred. Please try again.');
    }
  };

  // Reset form data
  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      role: 'customer',
      phoneNumber: '',
      hairdresserName: '',
      address: '',
      telephoneNumber: '',
      idNumber: '',
      idDocument: null,
      companyRegistration: null,
      tiktokUrl: '',
      facebookUrl: '',
      instagramUrl: ''
    });
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  // Handle modal close
  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="bg-blue-100 p-3 rounded-full">
                {loginType === 'employee' ? (
                  <UserCheck className="h-6 w-6 text-blue-600" />
                ) : (
                  <Scissors className="h-6 w-6 text-blue-600" />
                )}
              </div>
            </div>
            <DialogTitle className="text-center text-2xl font-bold">
              {mode === 'login' ? 'Welcome Back' : 'Join Bookang'}
            </DialogTitle>
            <DialogDescription className="text-center">
              {mode === 'login' 
                ? `Sign in to your ${loginType} account` 
                : 'Create your account and start connecting with salon professionals'
              }
            </DialogDescription>
          </DialogHeader>

          {mode === 'login' ? (
            // Login Form
            <Card className="border-0 shadow-none">
              <CardHeader className="text-center pb-4">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  {loginType === 'customer' ? (
                    <User className="h-5 w-5 text-blue-600" />
                  ) : loginType === 'employee' ? (
                    <UserCheck className="h-5 w-5 text-blue-600" />
                  ) : (
                    <Scissors className="h-5 w-5 text-blue-600" />
                  )}
                  <CardTitle className="text-lg">
                    {loginType === 'customer' ? 'Customer Login' : 
                     loginType === 'employee' ? 'Employee Login' : 'Business Login'}
                  </CardTitle>
                </div>
              </CardHeader>
              
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      inputMode="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <div className="relative mt-1">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
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
                  </div>
                  
                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                    Sign In
                  </Button>
                </form>
                
                <div className="mt-4 text-center">
                  <Button
                    variant="link"
                    onClick={() => onSwitchMode('register')}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    Don't have an account? Register here
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            // Registration Form
            <Card className="border-0 shadow-none">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-lg">Create Your Account</CardTitle>
              </CardHeader>
              
              <CardContent>
                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <Label htmlFor="reg-email">Email Address *</Label>
                    <Input
                      id="reg-email"
                      type="email"
                      inputMode="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="reg-password">Password *</Label>
                    <div className="relative mt-1">
                      <Input
                        id="reg-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a password (min. 6 characters)"
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
                  </div>
                  
                  <div>
                    <Label htmlFor="confirm-password">Confirm Password *</Label>
                    <div className="relative mt-1">
                      <Input
                        id="confirm-password"
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
                  </div>
                  
                  <div>
                    <Label htmlFor="role">Account Type *</Label>
                    <Select 
                      value={formData.role} 
                      onValueChange={(value: 'customer' | 'hairdresser' | 'employee') => handleInputChange('role', value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="customer">Customer</SelectItem>
                        <SelectItem value="hairdresser">Business</SelectItem>
                        <SelectItem value="employee">Employee</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      inputMode="tel"
                      placeholder="+27 or 0XX XXX XXXX"
                      value={formData.phoneNumber}
                      onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      For booking confirmations via SMS
                    </p>
                  </div>
                  
                  {formData.role === 'hairdresser' && (
                    <div className="space-y-4 p-4 bg-blue-50 rounded-lg border">
                      <h3 className="font-semibold text-blue-900 flex items-center">
                        <Scissors className="mr-2 h-4 w-4" />
                        Business Information
                      </h3>
                      
                      <div>
                        <Label htmlFor="hairdresser-name">Business Name *</Label>
                        <Input
                          id="hairdresser-name"
                          type="text"
                          placeholder="Enter your business name"
                          value={formData.hairdresserName}
                          onChange={(e) => handleInputChange('hairdresserName', e.target.value)}
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="address">Business Address *</Label>
                        <Textarea
                          id="address"
                          placeholder="Enter your full business address"
                          value={formData.address}
                          onChange={(e) => handleInputChange('address', e.target.value)}
                          className="mt-1"
                          rows={3}
                        />
                      </div>

                      <div>
                        <Label htmlFor="telephone">Telephone Number *</Label>
                        <Input
                          id="telephone"
                          type="tel"
                          inputMode="tel"
                          placeholder="Enter your telephone number"
                          value={formData.telephoneNumber}
                          onChange={(e) => handleInputChange('telephoneNumber', e.target.value)}
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="id-number">ID / Passport Number *</Label>
                        <Input
                          id="id-number"
                          type="text"
                          inputMode="numeric"
                          placeholder="Enter your ID or Passport number"
                          value={formData.idNumber}
                          onChange={(e) => handleInputChange('idNumber', e.target.value)}
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="id-document" className="flex items-center">
                          <IdCard className="mr-2 h-4 w-4" />
                          ID / Passport Document *
                        </Label>
                        <Input
                          id="id-document"
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleFileChange('idDocument', e.target.files?.[0] || null)}
                          className="mt-1"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Upload a clear copy of your ID or Passport (PDF, JPG, PNG)
                        </p>
                      </div>

                      <div>
                        <Label htmlFor="company-registration" className="flex items-center">
                          <FileText className="mr-2 h-4 w-4" />
                          Company Registration (Optional)
                        </Label>
                        <Input
                          id="company-registration"
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleFileChange('companyRegistration', e.target.files?.[0] || null)}
                          className="mt-1"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Upload company registration document if applicable (PDF, JPG, PNG)
                        </p>
                      </div>

                      <div className="space-y-4 pt-4 border-t border-blue-200">
                        <h4 className="font-medium text-blue-900">Social Media (Optional)</h4>
                        
                        <div>
                          <Label htmlFor="instagram-url">Instagram URL</Label>
                          <Input
                            id="instagram-url"
                            type="url"
                            inputMode="url"
                            placeholder="https://instagram.com/yourprofile"
                            value={formData.instagramUrl}
                            onChange={(e) => handleInputChange('instagramUrl', e.target.value)}
                            className="mt-1"
                          />
                        </div>

                        <div>
                          <Label htmlFor="tiktok-url">TikTok URL</Label>
                          <Input
                            id="tiktok-url"
                            type="url"
                            inputMode="url"
                            placeholder="https://tiktok.com/@yourprofile"
                            value={formData.tiktokUrl}
                            onChange={(e) => handleInputChange('tiktokUrl', e.target.value)}
                            className="mt-1"
                          />
                        </div>

                        <div>
                          <Label htmlFor="facebook-url">Facebook URL</Label>
                          <Input
                            id="facebook-url"
                            type="url"
                            inputMode="url"
                            placeholder="https://facebook.com/yourpage"
                            value={formData.facebookUrl}
                            onChange={(e) => handleInputChange('facebookUrl', e.target.value)}
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                    Create Account
                  </Button>
                </form>
                
                <div className="mt-4 text-center">
                  <Button
                    variant="link"
                    onClick={() => onSwitchMode('login')}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    Already have an account? Sign in here
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </DialogContent>
      </Dialog>

      {/* Custom Alert */}
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

export default AuthModal;
