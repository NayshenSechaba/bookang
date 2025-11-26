import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { Search, UserCheck, CheckCircle, Clock, XCircle, Eye } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface BusinessWithVerification {
  id: string;
  full_name: string;
  business_name: string;
  email: string;
  phone: string;
  avatar_url: string | null;
  verification_status: string;
  created_at: string;
  checklist?: {
    documents_uploaded: boolean;
    paystack_code_added: boolean;
    paystack_business_verified: boolean;
    final_approval: boolean;
  };
}

export const BusinessVerificationManagement = () => {
  const [businesses, setBusinesses] = useState<BusinessWithVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const fetchBusinesses = async () => {
    setLoading(true);
    try {
      // Fetch all salon owner profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, business_name, email, phone, avatar_url, verification_status, created_at')
        .eq('role', 'salon_owner')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch verification checklists
      const { data: checklistsData, error: checklistsError } = await supabase
        .from('business_verification_checklist')
        .select('profile_id, documents_uploaded, paystack_code_added, paystack_business_verified, final_approval');

      if (checklistsError) throw checklistsError;

      // Merge data
      const businessesWithChecklist = (profilesData || []).map(profile => {
        const checklist = checklistsData?.find(c => c.profile_id === profile.id);
        return {
          ...profile,
          checklist: checklist || undefined
        };
      });

      setBusinesses(businessesWithChecklist);
    } catch (error) {
      console.error('Error fetching businesses:', error);
      toast({
        title: "Error",
        description: "Failed to load businesses. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getVerificationProgress = (business: BusinessWithVerification) => {
    if (!business.checklist) return 0;
    
    let completed = 0;
    if (business.checklist.documents_uploaded) completed++;
    if (business.checklist.paystack_code_added) completed++;
    if (business.checklist.paystack_business_verified) completed++;
    
    return Math.round((completed / 3) * 100);
  };

  const getStatusBadge = (business: BusinessWithVerification) => {
    if (business.checklist?.final_approval) {
      return <Badge variant="default" className="gap-1 bg-green-600"><CheckCircle className="h-3 w-3" />Approved</Badge>;
    }
    
    if (business.verification_status === 'pending') {
      return <Badge variant="outline" className="gap-1"><Clock className="h-3 w-3" />Pending</Badge>;
    }
    
    if (business.verification_status === 'rejected') {
      return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" />Rejected</Badge>;
    }

    const progress = getVerificationProgress(business);
    if (progress > 0) {
      return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" />In Progress ({progress}%)</Badge>;
    }
    
    return <Badge variant="outline" className="gap-1"><Clock className="h-3 w-3" />Not Started</Badge>;
  };

  const filteredBusinesses = businesses.filter(business =>
    business.business_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    business.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    business.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-6 w-6" />
            Business Verification Management
          </CardTitle>
          <CardDescription>
            Review and approve business verification applications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by business name, owner, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>

          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading businesses...</div>
          ) : filteredBusinesses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? 'No businesses found matching your search.' : 'No businesses registered yet.'}
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Business</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Registered</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBusinesses.map((business) => (
                    <TableRow key={business.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={business.avatar_url || undefined} />
                            <AvatarFallback>
                              {business.business_name?.substring(0, 2).toUpperCase() || 'B'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="font-medium">{business.business_name || 'Unnamed Business'}</div>
                        </div>
                      </TableCell>
                      <TableCell>{business.full_name || 'N/A'}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{business.email}</div>
                          <div className="text-muted-foreground">{business.phone || 'N/A'}</div>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(business)}</TableCell>
                      <TableCell>
                        {business.checklist ? (
                          <div className="space-y-1">
                            <div className="text-sm font-medium">{getVerificationProgress(business)}%</div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-primary transition-all"
                                style={{ width: `${getVerificationProgress(business)}%` }}
                              />
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">Not started</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(business.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/employee/client/${business.id}`)}
                          className="gap-1"
                        >
                          <Eye className="h-4 w-4" />
                          Review
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};