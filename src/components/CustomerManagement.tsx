import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { User, Flag, Star, AlertTriangle, Search, Phone, Mail } from 'lucide-react';
import { Customer } from '@/types/dashboard';
import StarRating from './StarRating';
import { toast } from "@/hooks/use-toast";

interface CustomerManagementProps {
  customers: Customer[];
  onUpdateCustomer: (customer: Customer) => void;
}

const CustomerManagement = ({ customers, onUpdateCustomer }: CustomerManagementProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFlagCustomer = (customer: Customer) => {
    const updatedCustomer: Customer = {
      ...customer,
      flagged: !customer.flagged
    };
    onUpdateCustomer(updatedCustomer);
    toast({
      title: customer.flagged ? "Customer Unflagged" : "Customer Flagged",
      description: `${customer.name} has been ${customer.flagged ? 'unflagged' : 'flagged as problematic'}.`,
    });
  };

  const handleUpdateCustomer = () => {
    if (!editingCustomer) return;
    
    onUpdateCustomer(editingCustomer);
    setShowEditModal(false);
    setEditingCustomer(null);
    
    toast({
      title: "Customer Updated",
      description: `${editingCustomer.name}'s information has been updated.`,
    });
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 3.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getCustomerStatusBadge = (customer: Customer) => {
    if (customer.flagged) {
      return <Badge variant="destructive" className="ml-2">Flagged</Badge>;
    }
    if (customer.noShowCount > 2) {
      return <Badge variant="secondary" className="ml-2 bg-yellow-100 text-yellow-800">High Risk</Badge>;
    }
    if (customer.rating >= 4.5) {
      return <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800">VIP</Badge>;
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Customer Management
          </CardTitle>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredCustomers.map((customer) => (
              <div key={customer.id} className={`border rounded-lg p-4 ${customer.flagged ? 'border-red-200 bg-red-50' : ''}`}>
                <div className="flex justify-between items-start">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center">
                      <h3 className="font-semibold">{customer.name}</h3>
                      {getCustomerStatusBadge(customer)}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Mail className="h-3 w-3" />
                          {customer.email}
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-3 w-3" />
                          {customer.phone}
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <div>Total visits: {customer.totalVisits}</div>
                        <div>Last visit: {customer.lastVisit}</div>
                        {customer.noShowCount > 0 && (
                          <div className="flex items-center gap-1 text-red-600">
                            <AlertTriangle className="h-3 w-3" />
                            No-shows: {customer.noShowCount}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">Rating:</span>
                        <div className="flex items-center gap-1">
                          <StarRating rating={Math.round(customer.rating)} />
                          <span className={`text-sm font-medium ${getRatingColor(customer.rating)}`}>
                            {customer.rating.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {customer.notes && (
                      <div className="bg-gray-50 rounded p-2 text-sm">
                        <span className="font-medium">Notes: </span>
                        {customer.notes}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    <Button
                      variant={customer.flagged ? "destructive" : "outline"}
                      size="sm"
                      onClick={() => handleFlagCustomer(customer)}
                    >
                      <Flag className="h-3 w-3 mr-1" />
                      {customer.flagged ? 'Unflag' : 'Flag'}
                    </Button>
                    
                    <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingCustomer({ ...customer });
                          }}
                        >
                          Edit
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Edit Customer</DialogTitle>
                        </DialogHeader>
                        {editingCustomer && (
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="name">Name</Label>
                              <Input
                                id="name"
                                value={editingCustomer.name}
                                onChange={(e) => setEditingCustomer({
                                  ...editingCustomer,
                                  name: e.target.value
                                })}
                              />
                            </div>
                            <div>
                              <Label htmlFor="email">Email</Label>
                              <Input
                                id="email"
                                type="email"
                                value={editingCustomer.email}
                                onChange={(e) => setEditingCustomer({
                                  ...editingCustomer,
                                  email: e.target.value
                                })}
                              />
                            </div>
                            <div>
                              <Label htmlFor="phone">Phone</Label>
                              <Input
                                id="phone"
                                value={editingCustomer.phone}
                                onChange={(e) => setEditingCustomer({
                                  ...editingCustomer,
                                  phone: e.target.value
                                })}
                              />
                            </div>
                            <div>
                              <Label htmlFor="rating">Your Rating (1-5)</Label>
                              <div className="flex gap-1 mt-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <button
                                    key={star}
                                    onClick={() => setEditingCustomer({
                                      ...editingCustomer,
                                      rating: star
                                    })}
                                    className={`p-1 ${
                                      star <= editingCustomer.rating 
                                        ? 'text-yellow-400' 
                                        : 'text-gray-300'
                                    }`}
                                  >
                                    <Star className="h-5 w-5 fill-current" />
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div>
                              <Label htmlFor="notes">Notes</Label>
                              <Textarea
                                id="notes"
                                value={editingCustomer.notes}
                                onChange={(e) => setEditingCustomer({
                                  ...editingCustomer,
                                  notes: e.target.value
                                })}
                                placeholder="Add any notes about this customer..."
                              />
                            </div>
                            <div className="flex gap-2 pt-4">
                              <Button onClick={handleUpdateCustomer}>
                                Save Changes
                              </Button>
                              <Button 
                                variant="outline" 
                                onClick={() => setShowEditModal(false)}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredCustomers.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm ? 'No customers found matching your search.' : 'No customers yet.'}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerManagement;