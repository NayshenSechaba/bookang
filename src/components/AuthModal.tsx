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
    hairdresserName: '',
    // Additional hairdresser fields
    address: '',
    telephoneNumber: '',
    idNumber: '',
    idDocument: null as File | null,
    companyRegistration: null as File | null
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
  const handleLogin = (e: React.FormEvent) => {
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
    
    // Simulate successful login
    const userName = formData.email.split('@')[0]; // Use email prefix as name
    showAlert('success', 'Login Successful', `Welcome back! Redirecting to your ${loginType} dashboard...`);
    
    setTimeout(() => {
      onAuthSuccess(loginType, userName);
      resetForm();
    }, 1500);
  };

  // Handle registration form submission
  const handleRegister = (e: React.FormEvent) => {
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
    
    // Additional validation for hairdressers
    if (formData.role === 'hairdresser') {
      if (!formData.hairdresserName.trim()) {
        showAlert('error', 'Missing Information', 'Please enter your professional name as a hairdresser.');
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
    
    // Simulate successful registration
    showAlert('success', 'Registration Successful', 'Your account has been created successfully! Please log in to continue.');
    
    setTimeout(() => {
      onSwitchMode('login');
      resetForm();
    }, 2000);
  };

  // Reset form data
  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      role: 'customer',
      hairdresserName: '',
      address: '',
      telephoneNumber: '',
      idNumber: '',
      idDocument: null,
      companyRegistration: null
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
              <div className="bg-purple-100 p-3 rounded-full">
                {loginType === 'employee' ? (
                  <UserCheck className="h-6 w-6 text-purple-600" />
                ) : (
                  <Scissors className="h-6 w-6 text-purple-600" />
                )}
              </div>
            </div>
            <DialogTitle className="text-center text-2xl font-bold">
              {mode === 'login' ? 'Welcome Back' : 'Join SalonConnect'}
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
                    <User className="h-5 w-5 text-purple-600" />
                  ) : loginType === 'employee' ? (
                    <UserCheck className="h-5 w-5 text-purple-600" />
                  ) : (
                    <Scissors className="h-5 w-5 text-purple-600" />
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
                  
                  <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700">
                    Sign In
                  </Button>
                </form>
                
                <div className="mt-4 text-center">
                  <Button
                    variant="link"
                    onClick={() => onSwitchMode('register')}
                    className="text-purple-600 hover:text-purple-700"
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
                        <SelectItem value="hairdresser">Hairdresser</SelectItem>
                        <SelectItem value="employee">Employee</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {formData.role === 'hairdresser' && (
                    <div className="space-y-4 p-4 bg-purple-50 rounded-lg border">
                      <h3 className="font-semibold text-purple-900 flex items-center">
                        <Scissors className="mr-2 h-4 w-4" />
                        Professional Information
                      </h3>
                      
                      <div>
                        <Label htmlFor="hairdresser-name">Professional Name *</Label>
                        <Input
                          id="hairdresser-name"
                          type="text"
                          placeholder="Enter your professional name"
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
                    </div>
                  )}
                  
                  <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700">
                    Create Account
                  </Button>
                </form>
                
                <div className="mt-4 text-center">
                  <Button
                    variant="link"
                    onClick={() => onSwitchMode('login')}
                    className="text-purple-600 hover:text-purple-700"
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
