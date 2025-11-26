import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Search, DollarSign, CheckCircle, AlertCircle, Edit, Plus } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface BusinessProfile {
  id: string;
  full_name: string;
  business_name: string;
  email: string;
  phone: string;
  avatar_url: string | null;
  verification_status: string;
  created_at: string;
}

interface PaymentSetting {
  id: string;
  profile_id: string;
  paystack_subaccount_code: string | null;
  verified_by: string | null;
  verified_at: string | null;
  notes: string | null;
}

export const BusinessPaymentSettings = () => {
  const [businesses, setBusinesses] = useState<BusinessProfile[]>([]);
  const [paymentSettings, setPaymentSettings] = useState<Record<string, PaymentSetting>>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBusiness, setSelectedBusiness] = useState<BusinessProfile | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [subaccountCode, setSubaccountCode] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const fetchBusinesses = async () => {
    setLoading(true);
    try {
      // Fetch verified business profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, business_name, email, phone, avatar_url, verification_status, created_at')
        .eq('role', 'salon_owner')
        .eq('verification_status', 'approved')
        .order('business_name');

      if (profilesError) throw profilesError;

      // Fetch all payment settings
      const { data: settingsData, error: settingsError } = await supabase
        .from('business_payment_settings')
        .select('*');

      if (settingsError) throw settingsError;

      setBusinesses(profilesData || []);
      
      // Convert settings array to record for easy lookup
      const settingsMap: Record<string, PaymentSetting> = {};
      (settingsData || []).forEach((setting) => {
        settingsMap[setting.profile_id] = setting;
      });
      setPaymentSettings(settingsMap);
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

  const openDialog = (business: BusinessProfile) => {
    setSelectedBusiness(business);
    const existingSetting = paymentSettings[business.id];
    setSubaccountCode(existingSetting?.paystack_subaccount_code || '');
    setNotes(existingSetting?.notes || '');
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!selectedBusiness) return;

    // Validate subaccount code format
    if (subaccountCode && !subaccountCode.startsWith('ACCT_')) {
      toast({
        title: "Invalid Format",
        description: "Paystack subaccount code must start with 'ACCT_'",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      const existingSetting = paymentSettings[selectedBusiness.id];

      if (existingSetting) {
        // Update existing setting
        const { error } = await supabase
          .from('business_payment_settings')
          .update({
            paystack_subaccount_code: subaccountCode || null,
            notes: notes || null,
            verified_by: currentProfile?.id,
            verified_at: new Date().toISOString()
          })
          .eq('id', existingSetting.id);

        if (error) throw error;
      } else {
        // Insert new setting
        const { error } = await supabase
          .from('business_payment_settings')
          .insert({
            profile_id: selectedBusiness.id,
            paystack_subaccount_code: subaccountCode || null,
            notes: notes || null,
            verified_by: currentProfile?.id,
            verified_at: new Date().toISOString()
          });

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "Payment settings saved successfully."
      });

      setDialogOpen(false);
      fetchBusinesses(); // Refresh data
    } catch (error) {
      console.error('Error saving payment settings:', error);
      toast({
        title: "Error",
        description: "Failed to save payment settings. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const filteredBusinesses = businesses.filter(business => 
    business.business_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    business.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    business.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (profileId: string) => {
    const setting = paymentSettings[profileId];
    if (!setting || !setting.paystack_subaccount_code) {
      return <Badge variant="outline" className="gap-1"><AlertCircle className="h-3 w-3" />Not Configured</Badge>;
    }
    return <Badge variant="default" className="gap-1 bg-green-600"><CheckCircle className="h-3 w-3" />Configured</Badge>;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-6 w-6" />
            Business Payment Settings
          </CardTitle>
          <CardDescription>
            Manage Paystack subaccount codes for verified businesses to enable split payments
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
              {searchTerm ? 'No businesses found matching your search.' : 'No verified businesses found.'}
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
                    <TableHead>Subaccount Code</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBusinesses.map((business) => {
                    const setting = paymentSettings[business.id];
                    return (
                      <TableRow key={business.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={business.avatar_url || undefined} />
                              <AvatarFallback>
                                {business.business_name?.substring(0, 2).toUpperCase() || 'B'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{business.business_name || 'Unnamed Business'}</div>
                              <div className="text-xs text-muted-foreground">
                                Verified {new Date(business.created_at).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{business.full_name || 'N/A'}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{business.email}</div>
                            <div className="text-muted-foreground">{business.phone || 'N/A'}</div>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(business.id)}</TableCell>
                        <TableCell>
                          {setting?.paystack_subaccount_code ? (
                            <code className="text-xs bg-muted px-2 py-1 rounded">
                              {setting.paystack_subaccount_code}
                            </code>
                          ) : (
                            <span className="text-muted-foreground text-sm">Not set</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDialog(business)}
                            className="gap-1"
                          >
                            {setting?.paystack_subaccount_code ? (
                              <><Edit className="h-4 w-4" />Edit</>
                            ) : (
                              <><Plus className="h-4 w-4" />Add</>
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {paymentSettings[selectedBusiness?.id || '']?.paystack_subaccount_code 
                ? 'Edit Payment Settings' 
                : 'Add Payment Settings'}
            </DialogTitle>
            <DialogDescription>
              Configure Paystack subaccount code for <strong>{selectedBusiness?.business_name}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="subaccount">Paystack Subaccount Code</Label>
              <Input
                id="subaccount"
                placeholder="ACCT_xxxxxxxxxx"
                value={subaccountCode}
                onChange={(e) => setSubaccountCode(e.target.value)}
                maxLength={50}
              />
              <p className="text-xs text-muted-foreground">
                Enter the subaccount code from Paystack (starts with 'ACCT_')
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any notes about this payment configuration..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground">
                {notes.length}/500 characters
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};