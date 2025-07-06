import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Calendar, Clock, Star, DollarSign, Users, TrendingUp, CheckCircle, XCircle, Eye, Plus, Edit, Trash2, Package, Scissors, Camera, Upload } from 'lucide-react';
import CustomAlert from '@/components/CustomAlert';
import { useForm } from 'react-hook-form';

interface HairdresserDashboardProps {
  userName: string;
}

interface Service {
  id: number;
  name: string;
  description: string;
  duration: number; // in minutes
  price: number;
  category: 'haircut' | 'color' | 'styling' | 'treatment';
  isActive: boolean;
}

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: 'shampoo' | 'conditioner' | 'styling' | 'treatment' | 'tools';
  isActive: boolean;
}

const HairdresserDashboard = ({ userName }: HairdresserDashboardProps) => {
  // State management
  const [showFinanceModal, setShowFinanceModal] = useState(false);
  const [showProfilePictureModal, setShowProfilePictureModal] = useState(false);
  const [profilePicture, setProfilePicture] = useState<string>('https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face');
  const [appointments, setAppointments] = useState([
    {
      id: 1,
      customerName: 'Emily Johnson',
      service: 'Haircut & Styling',
      date: '2024-07-15',
      time: '2:00 PM',
      status: 'Pending',
      cost: 'R1,125',
      commission: 'R337.50'
    },
    {
      id: 2,
      customerName: 'Sarah Williams',
      service: 'Hair Color & Highlights',
      date: '2024-07-15',
      time: '10:00 AM',
      status: 'Confirmed',
      cost: 'R2,250',
      commission: 'R675.00'
    },
    {
      id: 3,
      customerName: 'Jessica Brown',
      service: 'Hair Treatment',
      date: '2024-07-15',
      time: '4:00 PM',
      status: 'Pending',
      cost: 'R1,800',
      commission: 'R540.00'
    }
  ]);

  // Alert state
  const [alertInfo, setAlertInfo] = useState<{
    show: boolean;
    type: 'success' | 'error' | 'info';
    title: string;
    message: string;
  }>({ show: false, type: 'info', title: '', message: '' });

  // Services and Products state
  const [services, setServices] = useState<Service[]>([
    {
      id: 1,
      name: 'Classic Haircut',
      description: 'Professional hair cutting and styling service',
      duration: 45,
      price: 750,
      category: 'haircut',
      isActive: true
    },
    {
      id: 2,
      name: 'Hair Color & Highlights',
      description: 'Full color treatment with highlights',
      duration: 120,
      price: 2250,
      category: 'color',
      isActive: true
    },
    {
      id: 3,
      name: 'Deep Conditioning Treatment',
      description: 'Restorative hair treatment for damaged hair',
      duration: 60,
      price: 1200,
      category: 'treatment',
      isActive: true
    }
  ]);

  const [products, setProducts] = useState<Product[]>([
    {
      id: 1,
      name: 'Premium Shampoo',
      description: 'Professional grade moisturizing shampoo',
      price: 375,
      stock: 15,
      category: 'shampoo',
      isActive: true
    },
    {
      id: 2,
      name: 'Hair Styling Gel',
      description: 'Long-lasting hold styling gel',
      price: 270,
      stock: 8,
      category: 'styling',
      isActive: true
    }
  ]);

  // Modal states for services and products
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Forms
  const serviceForm = useForm({
    defaultValues: {
      name: '',
      description: '',
      duration: 30,
      price: 0,
      category: 'haircut'
    }
  });

  const productForm = useForm({
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      stock: 0,
      category: 'shampoo'
    }
  });

  // Profile picture form
  const profilePictureForm = useForm({
    defaultValues: {
      imageUrl: profilePicture
    }
  });

  // Mock data for reviews
  const customerReviews = [
    {
      id: 1,
      customerName: 'Emily Johnson',
      service: 'Haircut',
      rating: 5,
      comment: 'Absolutely amazing! Sarah gave me the perfect haircut. She really listened to what I wanted and delivered exactly that. The salon atmosphere was great too!',
      date: '2024-06-28'
    },
    {
      id: 2,
      customerName: 'Maria Garcia',
      service: 'Hair Color',
      rating: 5,
      comment: 'Best hair color experience ever! The results exceeded my expectations. Professional, friendly, and skilled. Will definitely be back!',
      date: '2024-06-25'
    },
    {
      id: 3,
      customerName: 'Lisa Chen',
      service: 'Hair Styling',
      rating: 4,
      comment: 'Great service and lovely results. Sarah is very talented and made me feel comfortable throughout the appointment.',
      date: '2024-06-20'
    },
    {
      id: 4,
      customerName: 'Anna Wilson',
      service: 'Hair Treatment',
      rating: 5,
      comment: 'My hair has never felt better! The treatment was relaxing and the results speak for themselves. Highly recommend!',
      date: '2024-06-18'
    }
  ];

  // Financial data
  const financialData = {
    totalEarnings: 'R36,750.00',
    monthlyCommission: 'R11,025.00',
    pendingPayments: 'R1,552.50',
    commissionRate: '30%',
    totalAppointments: 42,
    averageRating: 4.8
  };

  // Show custom alert
  const showAlert = (type: 'success' | 'error' | 'info', title: string, message: string) => {
    setAlertInfo({ show: true, type, title, message });
  };

  // Handle appointment actions
  const handleAppointmentAction = (appointmentId: number, action: 'confirm' | 'cancel') => {
    setAppointments(prev => 
      prev.map(apt => 
        apt.id === appointmentId 
          ? { ...apt, status: action === 'confirm' ? 'Confirmed' : 'Cancelled' }
          : apt
      )
    );

    const appointment = appointments.find(apt => apt.id === appointmentId);
    if (action === 'confirm') {
      showAlert('success', 'Appointment Confirmed', 
        `Appointment with ${appointment?.customerName} has been confirmed. They will be notified via email.`);
    } else {
      showAlert('info', 'Appointment Cancelled', 
        `Appointment with ${appointment?.customerName} has been cancelled. They will be notified and can reschedule if needed.`);
    }
  };

  // Profile picture functions
  const handleProfilePictureSubmit = (data: any) => {
    setProfilePicture(data.imageUrl);
    setShowProfilePictureModal(false);
    showAlert('success', 'Profile Picture Updated', 'Your profile picture has been successfully updated.');
  };

  // Service management functions
  const handleAddService = () => {
    setEditingService(null);
    serviceForm.reset();
    setShowServiceModal(true);
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
    serviceForm.reset({
      name: service.name,
      description: service.description,
      duration: service.duration,
      price: service.price,
      category: service.category
    });
    setShowServiceModal(true);
  };

  const handleServiceSubmit = (data: any) => {
    if (editingService) {
      setServices(prev => prev.map(service => 
        service.id === editingService.id 
          ? { ...service, ...data }
          : service
      ));
      showAlert('success', 'Service Updated', `${data.name} has been successfully updated.`);
    } else {
      const newService: Service = {
        id: Date.now(),
        ...data,
        isActive: true
      };
      setServices(prev => [...prev, newService]);
      showAlert('success', 'Service Added', `${data.name} has been successfully added to your services.`);
    }
    setShowServiceModal(false);
  };

  const handleDeleteService = (serviceId: number) => {
    const service = services.find(s => s.id === serviceId);
    setServices(prev => prev.filter(s => s.id !== serviceId));
    showAlert('info', 'Service Removed', `${service?.name} has been removed from your services.`);
  };

  // Product management functions
  const handleAddProduct = () => {
    setEditingProduct(null);
    productForm.reset();
    setShowProductModal(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    productForm.reset({
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      category: product.category
    });
    setShowProductModal(true);
  };

  const handleProductSubmit = (data: any) => {
    if (editingProduct) {
      setProducts(prev => prev.map(product => 
        product.id === editingProduct.id 
          ? { ...product, ...data }
          : product
      ));
      showAlert('success', 'Product Updated', `${data.name} has been successfully updated.`);
    } else {
      const newProduct: Product = {
        id: Date.now(),
        ...data,
        isActive: true
      };
      setProducts(prev => [...prev, newProduct]);
      showAlert('success', 'Product Added', `${data.name} has been successfully added to your inventory.`);
    }
    setShowProductModal(false);
  };

  const handleDeleteProduct = (productId: number) => {
    const product = products.find(p => p.id === productId);
    setProducts(prev => prev.filter(p => p.id !== productId));
    showAlert('info', 'Product Removed', `${product?.name} has been removed from your inventory.`);
  };

  // Toggle service/product active status
  const toggleServiceStatus = (serviceId: number) => {
    setServices(prev => prev.map(service => 
      service.id === serviceId 
        ? { ...service, isActive: !service.isActive }
        : service
    ));
  };

  const toggleProductStatus = (productId: number) => {
    setProducts(prev => prev.map(product => 
      product.id === productId 
        ? { ...product, isActive: !product.isActive }
        : product
    ));
  };

  // Render star rating
  const StarRating = ({ rating }: { rating: number }) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating 
                ? 'text-yellow-400 fill-yellow-400' 
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Header with Profile Picture */}
        <div className="mb-8 flex items-center gap-6">
          <div className="relative">
            <img 
              src={profilePicture}
              alt="Profile"
              className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
            />
            <button
              onClick={() => setShowProfilePictureModal(true)}
              className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
            >
              <Camera className="h-4 w-4" />
            </button>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome, {userName}!
            </h1>
            <p className="text-gray-600">
              Manage your appointments, services, products, and track your earnings.
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Today's Appointments</p>
                  <p className="text-2xl font-bold">{appointments.length}</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-amber-500 to-amber-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-100">Active Services</p>
                  <p className="text-2xl font-bold">
                    {services.filter(s => s.isActive).length}
                  </p>
                </div>
                <Scissors className="h-8 w-8 text-amber-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100">Products in Stock</p>
                  <p className="text-2xl font-bold">{products.filter(p => p.isActive).length}</p>
                </div>
                <Package className="h-8 w-8 text-emerald-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100">Monthly Earnings</p>
                  <p className="text-2xl font-bold">{financialData.monthlyCommission}</p>
                </div>
                <DollarSign className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Services & Products Management */}
            <Card>
              <CardHeader>
                <CardTitle>Services & Products Management</CardTitle>
                <CardDescription>
                  Manage your service offerings and product inventory
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="services" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="services">Services</TabsTrigger>
                    <TabsTrigger value="products">Products</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="services" className="space-y-4 mt-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">Your Services</h3>
                      <Button onClick={handleAddService}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Service
                      </Button>
                    </div>
                    
                    <div className="space-y-4">
                      {services.map((service) => (
                        <div key={service.id} className="border rounded-lg p-4 bg-white">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-semibold text-lg">{service.name}</h4>
                                <Badge 
                                  variant={service.isActive ? 'default' : 'secondary'}
                                  className={service.isActive ? 'bg-green-100 text-green-800' : ''}
                                >
                                  {service.isActive ? 'Active' : 'Inactive'}
                                </Badge>
                              </div>
                              <p className="text-gray-600 mb-2">{service.description}</p>
                              <div className="flex gap-4 text-sm text-gray-500">
                                <span>Duration: {service.duration} min</span>
                                <span>Price: R{service.price}</span>
                                <span>Category: {service.category}</span>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => toggleServiceStatus(service.id)}
                              >
                                {service.isActive ? 'Deactivate' : 'Activate'}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditService(service)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteService(service.id)}
                                className="text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="products" className="space-y-4 mt-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">Your Products</h3>
                      <Button onClick={handleAddProduct}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Product
                      </Button>
                    </div>
                    
                    <div className="space-y-4">
                      {products.map((product) => (
                        <div key={product.id} className="border rounded-lg p-4 bg-white">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-semibold text-lg">{product.name}</h4>
                                <Badge 
                                  variant={product.isActive ? 'default' : 'secondary'}
                                  className={product.isActive ? 'bg-green-100 text-green-800' : ''}
                                >
                                  {product.isActive ? 'Available' : 'Unavailable'}
                                </Badge>
                                {product.stock <= 5 && (
                                  <Badge variant="destructive">Low Stock</Badge>
                                )}
                              </div>
                              <p className="text-gray-600 mb-2">{product.description}</p>
                              <div className="flex gap-4 text-sm text-gray-500">
                                <span>Price: R{product.price}</span>
                                <span>Stock: {product.stock}</span>
                                <span>Category: {product.category}</span>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => toggleProductStatus(product.id)}
                              >
                                {product.isActive ? 'Hide' : 'Show'}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditProduct(product)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteProduct(product.id)}
                                className="text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Appointments Management */}
            <Card>
              <CardHeader>
                <CardTitle>Today's Appointments</CardTitle>
                <CardDescription>
                  Manage your upcoming appointments and client bookings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {appointments.map((appointment) => (
                    <div key={appointment.id} className="border rounded-lg p-4 bg-white">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-lg">{appointment.customerName}</h3>
                          <p className="text-gray-600">{appointment.service}</p>
                        </div>
                        <Badge 
                          variant={
                            appointment.status === 'Confirmed' ? 'default' : 
                            appointment.status === 'Pending' ? 'secondary' : 'destructive'
                          }
                          className={
                            appointment.status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                            appointment.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : ''
                          }
                        >
                          {appointment.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
                        <div className="flex items-center">
                          <Calendar className="mr-2 h-4 w-4" />
                          {appointment.date}
                        </div>
                        <div className="flex items-center">
                          <Clock className="mr-2 h-4 w-4" />
                          {appointment.time}
                        </div>
                        <div className="flex items-center">
                          <DollarSign className="mr-2 h-4 w-4" />
                          {appointment.cost}
                        </div>
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-purple-600">
                            Commission: {appointment.commission}
                          </span>
                        </div>
                      </div>
                      
                      {appointment.status === 'Pending' && (
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            onClick={() => handleAppointmentAction(appointment.id, 'confirm')}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Confirm
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleAppointmentAction(appointment.id, 'cancel')}
                            className="border-red-200 text-red-600 hover:bg-red-50"
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Cancel
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Customer Reviews */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Reviews</CardTitle>
                <CardDescription>
                  See what your customers are saying about your services
                  <Badge variant="outline" className="ml-2">Standard Tier Feature</Badge>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {customerReviews.map((review) => (
                    <div key={review.id} className="border rounded-lg p-4 bg-white">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold">{review.customerName}</h4>
                          <p className="text-sm text-gray-600">{review.service} • {review.date}</p>
                        </div>
                        <StarRating rating={review.rating} />
                      </div>
                      
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {review.comment}
                      </p>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800">
                    <strong>Free Tier:</strong> Individual reviews are available with Standard Tier. 
                    Currently showing total review count and average rating only.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Finance Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="mr-2 h-5 w-5 text-green-500" />
                  Finance Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Earnings</span>
                    <span className="font-semibold text-lg">{financialData.totalEarnings}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Monthly Commission</span>
                    <span className="font-semibold text-green-600">{financialData.monthlyCommission}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Pending Payments</span>
                    <span className="font-semibold text-amber-600">{financialData.pendingPayments}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Commission Rate</span>
                    <span className="font-semibold">{financialData.commissionRate}</span>
                  </div>
                  
                  <Button 
                    className="w-full mt-4" 
                    onClick={() => setShowFinanceModal(true)}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Performance Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5 text-blue-500" />
                  Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-1">
                      {financialData.totalAppointments}
                    </div>
                    <p className="text-gray-600">Total Appointments</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-500 mb-1">
                      {financialData.averageRating}
                    </div>
                    <p className="text-gray-600">Average Rating</p>
                    <StarRating rating={Math.floor(financialData.averageRating)} />
                  </div>
                  
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600 mb-1">
                      {customerReviews.length}
                    </div>
                    <p className="text-gray-600">Total Reviews</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Tips */}
            <Card>
              <CardHeader>
                <CardTitle>Professional Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p>Keep your services updated with current pricing</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p>Monitor product stock levels regularly</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p>Respond to reviews to show you care</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p>Upload portfolio photos to attract customers</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Service Modal */}
      <Dialog open={showServiceModal} onOpenChange={setShowServiceModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingService ? 'Edit Service' : 'Add New Service'}
            </DialogTitle>
            <DialogDescription>
              {editingService ? 'Update your service details' : 'Add a new service to your offerings'}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...serviceForm}>
            <form onSubmit={serviceForm.handleSubmit(handleServiceSubmit)} className="space-y-4">
              <FormField
                control={serviceForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Classic Haircut" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={serviceForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input placeholder="Brief description of the service" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={serviceForm.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (minutes)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="45"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={serviceForm.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price (R)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="750"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={serviceForm.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <select 
                        className="w-full p-2 border rounded-md"
                        {...field}
                      >
                        <option value="haircut">Haircut</option>
                        <option value="color">Color</option>
                        <option value="styling">Styling</option>
                        <option value="treatment">Treatment</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowServiceModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingService ? 'Update Service' : 'Add Service'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Product Modal */}
      <Dialog open={showProductModal} onOpenChange={setShowProductModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </DialogTitle>
            <DialogDescription>
              {editingProduct ? 'Update your product details' : 'Add a new product to your inventory'}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...productForm}>
            <form onSubmit={productForm.handleSubmit(handleProductSubmit)} className="space-y-4">
              <FormField
                control={productForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Premium Shampoo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={productForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input placeholder="Brief description of the product" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={productForm.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price (R)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01"
                          placeholder="375.00"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={productForm.control}
                  name="stock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock Quantity</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="15"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={productForm.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <select 
                        className="w-full p-2 border rounded-md"
                        {...field}
                      >
                        <option value="shampoo">Shampoo</option>
                        <option value="conditioner">Conditioner</option>
                        <option value="styling">Styling</option>
                        <option value="treatment">Treatment</option>
                        <option value="tools">Tools</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowProductModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingProduct ? 'Update Product' : 'Add Product'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Profile Picture Modal */}
      <Dialog open={showProfilePictureModal} onOpenChange={setShowProfilePictureModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Profile Picture</DialogTitle>
            <DialogDescription>
              Upload a new profile picture by providing an image URL
            </DialogDescription>
          </DialogHeader>
          
          <Form {...profilePictureForm}>
            <form onSubmit={profilePictureForm.handleSubmit(handleProfilePictureSubmit)} className="space-y-4">
              <div className="flex justify-center mb-4">
                <img 
                  src={profilePictureForm.watch('imageUrl') || profilePicture}
                  alt="Preview"
                  className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face';
                  }}
                />
              </div>
              
              <FormField
                control={profilePictureForm.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="https://example.com/your-photo.jpg" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowProfilePictureModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  <Upload className="mr-2 h-4 w-4" />
                  Update Picture
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Finance Modal */}
      <Dialog open={showFinanceModal} onOpenChange={setShowFinanceModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Finance Management</DialogTitle>
            <DialogDescription>
              Detailed view of your earnings and commission structure
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="earnings" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="earnings">Earnings</TabsTrigger>
              <TabsTrigger value="commission">Commission</TabsTrigger>
            </TabsList>
            
            <TabsContent value="earnings" className="space-y-4 mt-6">
              <div className="space-y-4">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-green-800 font-medium">Total Earnings (This Month)</span>
                    <span className="text-2xl font-bold text-green-600">{financialData.totalEarnings}</span>
                  </div>
                  <p className="text-sm text-green-700">Based on {financialData.totalAppointments} completed appointments</p>
                </div>
                
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-blue-800 font-medium">Your Commission</span>
                    <span className="text-xl font-bold text-blue-600">{financialData.monthlyCommission}</span>
                  </div>
                  <p className="text-sm text-blue-700">At {financialData.commissionRate} commission rate</p>
                </div>
                
                <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-amber-800 font-medium">Pending Payments</span>
                    <span className="text-xl font-bold text-amber-600">{financialData.pendingPayments}</span>
                  </div>
                  <p className="text-sm text-amber-700">From recent appointments</p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="commission" className="space-y-4 mt-6">
              <div className="space-y-4">
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <h4 className="font-semibold text-purple-900 mb-2">Commission Structure</h4>
                  <div className="space-y-2 text-sm text-purple-800">
                    <div className="flex justify-between">
                      <span>Standard Services:</span>
                      <span className="font-medium">30%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Premium Services:</span>
                      <span className="font-medium">35%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Online Booking Fee:</span>
                      <span className="font-medium">2.5%</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-2">Payment Schedule</h4>
                  <p className="text-sm text-gray-700">
                    Payments are processed weekly on Fridays. Commission from online bookings 
                    is calculated after the service is completed and customer payment is confirmed.
                  </p>
                </div>
                
                <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                  <h4 className="font-semibold text-indigo-900 mb-2">Performance Bonuses</h4>
                  <p className="text-sm text-indigo-700">
                    Maintain a 4.8+ rating to qualify for monthly performance bonuses. 
                    Top performers receive additional commission increases.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="flex justify-end pt-4 border-t">
            <Button onClick={() => setShowFinanceModal(false)}>
              Close
            </Button>
          </div>
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
    </div>
  );
};

export default HairdresserDashboard;
