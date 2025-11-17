
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DollarSign, 
  Star, 
  Users, 
  MessageSquare, 
  Settings, 
  CreditCard,
  TrendingUp,
  UserCheck,
  Eye,
  ToggleLeft,
  ToggleRight,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';

interface EmployeeDashboardProps {
  userName: string;
}

interface Commission {
  id: number;
  hairdresserName: string;
  amount: number;
  status: 'pending' | 'paid';
  dueDate: string;
  serviceCount: number;
}

interface Review {
  id: number;
  customerName: string;
  hairdresserName: string;
  rating: number;
  comment: string;
  date: string;
  flagged: boolean;
}

interface HairdresserProfile {
  id: number;
  name: string;
  email: string;
  phone: string;
  isActive: boolean;
  totalEarnings: number;
  averageRating: number;
  totalBookings: number;
  joinDate: string;
}

const EmployeeDashboard = ({ userName }: EmployeeDashboardProps) => {
  // Mock data for commissions
  const [commissions] = useState<Commission[]>([
    {
      id: 1,
      hairdresserName: 'Sarah Johnson',
      amount: 450,
      status: 'pending',
      dueDate: '2024-01-20',
      serviceCount: 15
    },
    {
      id: 2,
      hairdresserName: 'Emily Davis',
      amount: 320,
      status: 'paid',
      dueDate: '2024-01-15',
      serviceCount: 12
    },
    {
      id: 3,
      hairdresserName: 'Jessica Wilson',
      amount: 280,
      status: 'pending',
      dueDate: '2024-01-22',
      serviceCount: 10
    },
  ]);

  // Mock data for reviews
  const [reviews] = useState<Review[]>([
    {
      id: 1,
      customerName: 'Alice Brown',
      hairdresserName: 'Sarah Johnson',
      rating: 5,
      comment: 'Amazing service! Very professional and friendly.',
      date: '2024-01-18',
      flagged: false
    },
    {
      id: 2,
      customerName: 'Mark Thompson',
      hairdresserName: 'Emily Davis',
      rating: 2,
      comment: 'Not satisfied with the haircut. Very rushed service.',
      date: '2024-01-17',
      flagged: true
    },
    {
      id: 3,
      customerName: 'Lisa Garcia',
      hairdresserName: 'Jessica Wilson',
      rating: 4,
      comment: 'Good experience overall, will come back again.',
      date: '2024-01-16',
      flagged: false
    },
  ]);

  // Mock data for hairdresser profiles
  const [hairdresserProfiles, setHairdresserProfiles] = useState<HairdresserProfile[]>([
    {
      id: 1,
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      phone: '+1 (555) 234-5678',
      isActive: true,
      totalEarnings: 12450,
      averageRating: 4.8,
      totalBookings: 156,
      joinDate: '2023-03-15'
    },
    {
      id: 2,
      name: 'Emily Davis',
      email: 'emily@example.com',
      phone: '+1 (555) 345-6789',
      isActive: true,
      totalEarnings: 9800,
      averageRating: 4.2,
      totalBookings: 98,
      joinDate: '2023-05-20'
    },
    {
      id: 3,
      name: 'Jessica Wilson',
      email: 'jessica@example.com',
      phone: '+1 (555) 456-7890',
      isActive: false,
      totalEarnings: 7200,
      averageRating: 4.5,
      totalBookings: 67,
      joinDate: '2023-07-10'
    },
  ]);

  const toggleProfileStatus = (id: number) => {
    setHairdresserProfiles(profiles =>
      profiles.map(profile =>
        profile.id === id ? { ...profile, isActive: !profile.isActive } : profile
      )
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'paid':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  const totalPendingCommission = commissions
    .filter(c => c.status === 'pending')
    .reduce((sum, c) => sum + c.amount, 0);

  const totalPaidCommission = commissions
    .filter(c => c.status === 'paid')
    .reduce((sum, c) => sum + c.amount, 0);

  const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  const flaggedReviews = reviews.filter(r => r.flagged).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Employee Dashboard
              </h1>
              <p className="text-gray-600 mt-2">
                Welcome back, <span className="font-medium text-orange-600">{userName}</span>
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                <UserCheck className="mr-2 h-4 w-4" />
                Super User Access
              </Badge>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Commission</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">R{totalPendingCommission}</div>
              <p className="text-xs text-muted-foreground">
                {commissions.filter(c => c.status === 'pending').length} pending payments
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Paid Commission</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">R{totalPaidCommission}</div>
              <p className="text-xs text-muted-foreground">
                {commissions.filter(c => c.status === 'paid').length} completed payments
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
              <Star className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{averageRating.toFixed(1)}/5</div>
              <p className="text-xs text-muted-foreground">
                {reviews.length} total reviews
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Flagged Reviews</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{flaggedReviews}</div>
              <p className="text-xs text-muted-foreground">
                Require attention
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="commissions" className="space-y-8">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="commissions" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              <span className="hidden sm:inline">Commissions</span>
            </TabsTrigger>
            <TabsTrigger value="reviews" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              <span className="hidden sm:inline">Reviews</span>
            </TabsTrigger>
            <TabsTrigger value="profiles" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Profiles</span>
            </TabsTrigger>
            <TabsTrigger value="communication" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Messages</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          {/* Commission Management */}
          <TabsContent value="commissions">
            <Card>
              <CardHeader>
                <CardTitle>Commission Management</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Business</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Services</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {commissions.map((commission) => (
                      <TableRow key={commission.id}>
                        <TableCell className="font-medium">{commission.hairdresserName}</TableCell>
                        <TableCell>R{commission.amount}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(commission.status)}>
                            {commission.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{commission.dueDate}</TableCell>
                        <TableCell>{commission.serviceCount}</TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Review Management */}
          <TabsContent value="reviews">
            <Card>
              <CardHeader>
                <CardTitle>Review Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div
                      key={review.id}
                      className={`p-4 rounded-lg border ${
                        review.flagged ? 'border-red-200 bg-red-50' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="font-medium">{review.customerName}</span>
                            <span className="text-gray-500">for</span>
                            <span className="font-medium">{review.hairdresserName}</span>
                            <div className="flex items-center space-x-1">
                              {renderStars(review.rating)}
                            </div>
                            {review.flagged && (
                              <Badge variant="destructive">Flagged</Badge>
                            )}
                          </div>
                          <p className="text-gray-700 mb-2">{review.comment}</p>
                          <p className="text-sm text-gray-500">{review.date}</p>
                        </div>
                        <Button size="sm" variant="outline">
                          Moderate
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Management */}
          <TabsContent value="profiles">
            <Card>
              <CardHeader>
                <CardTitle>Business Profile Management</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Earnings</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Bookings</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {hairdresserProfiles.map((profile) => (
                      <TableRow key={profile.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarImage src="/placeholder.svg" />
                              <AvatarFallback>
                                {profile.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{profile.name}</p>
                              <p className="text-sm text-gray-500">Joined {profile.joinDate}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm">{profile.email}</p>
                            <p className="text-sm text-gray-500">{profile.phone}</p>
                          </div>
                        </TableCell>
                        <TableCell>R{profile.totalEarnings}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <span>{profile.averageRating}</span>
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          </div>
                        </TableCell>
                        <TableCell>{profile.totalBookings}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={profile.isActive}
                              onCheckedChange={() => toggleProfileStatus(profile.id)}
                            />
                            <span className={profile.isActive ? 'text-green-600' : 'text-red-600'}>
                              {profile.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
                              View
                            </Button>
                            <Button size="sm" variant="outline">
                              Edit
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Communication Hub */}
          <TabsContent value="communication">
            <Card>
              <CardHeader>
                <CardTitle>Communication Hub</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Customer Messages</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <p className="font-medium">Alice Brown</p>
                          <p className="text-sm text-gray-600">Question about appointment...</p>
                          <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <p className="font-medium">Mark Thompson</p>
                          <p className="text-sm text-gray-600">Complaint about service...</p>
                          <p className="text-xs text-gray-500 mt-1">5 hours ago</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Supplier Communication</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="p-3 bg-green-50 rounded-lg">
                          <p className="font-medium">Beauty Supply Co.</p>
                          <p className="text-sm text-gray-600">New product catalog available...</p>
                          <p className="text-xs text-gray-500 mt-1">1 day ago</p>
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg">
                          <p className="font-medium">Hair Products Ltd.</p>
                          <p className="text-sm text-gray-600">Order confirmation...</p>
                          <p className="text-xs text-gray-500 mt-1">2 days ago</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Super User Settings */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Super User Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">System Configuration</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Commission Rates</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-gray-600 mb-2">Current rate: 15%</p>
                          <Button size="sm" variant="outline">
                            Modify Rates
                          </Button>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Platform Settings</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-gray-600 mb-2">System maintenance</p>
                          <Button size="sm" variant="outline">
                            Configure
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-4">User Management</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Access Control</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-gray-600 mb-2">Manage user permissions</p>
                          <Button size="sm" variant="outline">
                            Manage Access
                          </Button>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Audit Logs</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-gray-600 mb-2">View system activity</p>
                          <Button size="sm" variant="outline">
                            View Logs
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
