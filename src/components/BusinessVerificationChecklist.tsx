import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { CheckCircle2, FileCheck, CreditCard, Building2, UserCheck, Loader2, Mail } from 'lucide-react';

interface VerificationChecklistProps {
  profileId: string;
  businessName: string;
  onVerificationComplete?: () => void;
}

interface ChecklistData {
  id?: string;
  profile_id: string;
  documents_uploaded: boolean;
  documents_verified_by: string | null;
  documents_verified_at: string | null;
  paystack_code_added: boolean;
  paystack_code_verified_by: string | null;
  paystack_code_verified_at: string | null;
  paystack_business_name: string | null;
  paystack_business_verified: boolean;
  paystack_business_verified_by: string | null;
  paystack_business_verified_at: string | null;
  final_approval: boolean;
  final_approved_by: string | null;
  final_approved_at: string | null;
  verification_notes: string | null;
}

export const BusinessVerificationChecklist = ({ 
  profileId, 
  businessName,
  onVerificationComplete 
}: VerificationChecklistProps) => {
  const [checklist, setChecklist] = useState<ChecklistData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [paystackBusinessName, setPaystackBusinessName] = useState('');
  const [verificationNotes, setVerificationNotes] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<string>('pending');
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    fetchChecklist();
    fetchProfile();
    getCurrentUser();
  }, [profileId]);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();
      
      if (profile) {
        setCurrentUserId(profile.id);
      }
    }
  };

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('verification_status')
        .eq('id', profileId)
        .single();

      if (error) throw error;
      
      if (data) {
        setProfile(data);
        setVerificationStatus(data.verification_status || 'pending');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    setSaving(true);
    try {
      // Update profile status
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          verification_status: newStatus,
          ...(newStatus === 'in_review' && { verification_submitted_at: new Date().toISOString() })
        })
        .eq('id', profileId);

      if (profileError) throw profileError;

      // Send email notification
      await supabase.functions.invoke('send-verification-status-email', {
        body: {
          profile_id: profileId,
          status: newStatus,
          notes: verificationNotes || undefined,
        },
      });

      setVerificationStatus(newStatus);
      toast({
        title: "Status Updated",
        description: `Verification status changed to ${newStatus.replace('_', ' ')} and email sent.`
      });
    } catch (error: any) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update verification status.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const fetchChecklist = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('business_verification_checklist')
        .select('*')
        .eq('profile_id', profileId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setChecklist(data);
        setPaystackBusinessName(data.paystack_business_name || '');
        setVerificationNotes(data.verification_notes || '');
      } else {
        // Create initial checklist
        const { data: newChecklist, error: insertError } = await supabase
          .from('business_verification_checklist')
          .insert({
            profile_id: profileId,
            documents_uploaded: false,
            paystack_code_added: false,
            paystack_business_verified: false,
            final_approval: false
          })
          .select()
          .single();

        if (insertError) throw insertError;
        setChecklist(newChecklist);
      }
    } catch (error) {
      console.error('Error fetching checklist:', error);
      toast({
        title: "Error",
        description: "Failed to load verification checklist.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateChecklistItem = async (field: keyof ChecklistData, value: boolean) => {
    if (!checklist || !currentUserId) return;

    setSaving(true);
    try {
      const updateData: any = {
        [field]: value,
      };

      // Add verification metadata
      if (value) {
        updateData[`${field.replace('_uploaded', '').replace('_added', '').replace('_verified', '')}_verified_by`] = currentUserId;
        updateData[`${field.replace('_uploaded', '').replace('_added', '').replace('_verified', '')}_verified_at`] = new Date().toISOString();
      } else {
        updateData[`${field.replace('_uploaded', '').replace('_added', '').replace('_verified', '')}_verified_by`] = null;
        updateData[`${field.replace('_uploaded', '').replace('_added', '').replace('_verified', '')}_verified_at`] = null;
      }

      const { data, error } = await supabase
        .from('business_verification_checklist')
        .update(updateData)
        .eq('id', checklist.id)
        .select()
        .single();

      if (error) throw error;

      setChecklist(data);
      toast({
        title: "Updated",
        description: "Verification item updated successfully."
      });
    } catch (error) {
      console.error('Error updating checklist:', error);
      toast({
        title: "Error",
        description: "Failed to update verification item.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const savePaystackBusinessName = async () => {
    if (!checklist || !currentUserId) return;

    setSaving(true);
    try {
      const { data, error } = await supabase
        .from('business_verification_checklist')
        .update({
          paystack_business_name: paystackBusinessName,
        })
        .eq('id', checklist.id)
        .select()
        .single();

      if (error) throw error;

      setChecklist(data);
      toast({
        title: "Saved",
        description: "Paystack business name saved."
      });
    } catch (error) {
      console.error('Error saving business name:', error);
      toast({
        title: "Error",
        description: "Failed to save business name.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const saveVerificationNotes = async () => {
    if (!checklist) return;

    setSaving(true);
    try {
      const { data, error } = await supabase
        .from('business_verification_checklist')
        .update({
          verification_notes: verificationNotes,
        })
        .eq('id', checklist.id)
        .select()
        .single();

      if (error) throw error;

      setChecklist(data);
      toast({
        title: "Saved",
        description: "Verification notes saved."
      });
    } catch (error) {
      console.error('Error saving notes:', error);
      toast({
        title: "Error",
        description: "Failed to save notes.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleFinalApproval = async () => {
    if (!checklist || !currentUserId) return;

    // Check all requirements are met
    if (!checklist.documents_uploaded || !checklist.paystack_code_added || !checklist.paystack_business_verified) {
      toast({
        title: "Requirements Not Met",
        description: "All verification requirements must be completed before final approval.",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    try {
      // Update checklist
      const { error: checklistError } = await supabase
        .from('business_verification_checklist')
        .update({
          final_approval: true,
          final_approved_by: currentUserId,
          final_approved_at: new Date().toISOString()
        })
        .eq('id', checklist.id);

      if (checklistError) throw checklistError;

      // Update profile verification status
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          verification_status: 'approved',
          verification_approved_at: new Date().toISOString()
        })
        .eq('id', profileId);

      if (profileError) throw profileError;

      // Send approval email notification
      await supabase.functions.invoke('send-verification-status-email', {
        body: {
          profile_id: profileId,
          status: 'approved',
          notes: verificationNotes || undefined,
        },
      });

      toast({
        title: "Business Approved",
        description: `${businessName} has been successfully verified and approved.`
      });

      fetchChecklist();
      onVerificationComplete?.();
    } catch (error) {
      console.error('Error approving business:', error);
      toast({
        title: "Error",
        description: "Failed to approve business.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!checklist) return null;

  const allRequirementsMet = checklist.documents_uploaded && 
                              checklist.paystack_code_added && 
                              checklist.paystack_business_verified;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCheck className="h-5 w-5" />
          Business Verification Checklist
        </CardTitle>
        <CardDescription>
          Review and sign off on each requirement to verify {businessName}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Verification Status */}
        <div className="space-y-3 bg-muted/50 p-4 rounded-lg">
          <Label htmlFor="status" className="text-base font-medium">
            Verification Status
          </Label>
          <div className="flex gap-3 items-center">
            <Select
              value={verificationStatus}
              onValueChange={handleStatusChange}
              disabled={saving || checklist.final_approval}
            >
              <SelectTrigger id="status" className="max-w-xs">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_review">In Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Badge 
              variant={
                verificationStatus === 'approved' ? 'default' :
                verificationStatus === 'in_review' ? 'secondary' :
                verificationStatus === 'rejected' ? 'destructive' :
                'outline'
              }
              className="gap-1"
            >
              <Mail className="h-3 w-3" />
              Email sent on status change
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Changing the status will automatically send an email notification to the business.
          </p>
        </div>

        <Separator />
        {/* Documents Verification */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Checkbox
                id="documents"
                checked={checklist.documents_uploaded}
                onCheckedChange={(checked) => updateChecklistItem('documents_uploaded', checked as boolean)}
                disabled={saving}
              />
              <div className="space-y-1">
                <Label htmlFor="documents" className="text-base font-medium cursor-pointer flex items-center gap-2">
                  <FileCheck className="h-4 w-4" />
                  Documents Uploaded & Verified
                </Label>
                <p className="text-sm text-muted-foreground">
                  All required business documents have been uploaded and reviewed
                </p>
              </div>
            </div>
            {checklist.documents_uploaded && (
              <Badge variant="default" className="gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Verified
              </Badge>
            )}
          </div>
          {checklist.documents_verified_at && (
            <p className="text-xs text-muted-foreground pl-7">
              Verified on {new Date(checklist.documents_verified_at).toLocaleDateString()}
            </p>
          )}
        </div>

        <Separator />

        {/* Paystack Code Verification */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Checkbox
                id="paystack_code"
                checked={checklist.paystack_code_added}
                onCheckedChange={(checked) => updateChecklistItem('paystack_code_added', checked as boolean)}
                disabled={saving}
              />
              <div className="space-y-1">
                <Label htmlFor="paystack_code" className="text-base font-medium cursor-pointer flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Paystack Subaccount Code Added
                </Label>
                <p className="text-sm text-muted-foreground">
                  Paystack subaccount code has been created and added to payment settings
                </p>
              </div>
            </div>
            {checklist.paystack_code_added && (
              <Badge variant="default" className="gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Verified
              </Badge>
            )}
          </div>
          {checklist.paystack_code_verified_at && (
            <p className="text-xs text-muted-foreground pl-7">
              Verified on {new Date(checklist.paystack_code_verified_at).toLocaleDateString()}
            </p>
          )}
        </div>

        <Separator />

        {/* Paystack Business Name Verification */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Checkbox
                id="paystack_business"
                checked={checklist.paystack_business_verified}
                onCheckedChange={(checked) => updateChecklistItem('paystack_business_verified', checked as boolean)}
                disabled={saving}
              />
              <div className="space-y-1">
                <Label htmlFor="paystack_business" className="text-base font-medium cursor-pointer flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Paystack Business Name Verified
                </Label>
                <p className="text-sm text-muted-foreground">
                  Business name on Paystack matches registration details
                </p>
              </div>
            </div>
            {checklist.paystack_business_verified && (
              <Badge variant="default" className="gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Verified
              </Badge>
            )}
          </div>

          <div className="pl-7 space-y-2">
            <Label htmlFor="paystack_name">Business Name on Paystack</Label>
            <div className="flex gap-2">
              <Input
                id="paystack_name"
                value={paystackBusinessName}
                onChange={(e) => setPaystackBusinessName(e.target.value)}
                placeholder="Enter business name as shown on Paystack"
                disabled={saving}
              />
              <Button 
                onClick={savePaystackBusinessName} 
                disabled={saving}
                variant="outline"
              >
                Save
              </Button>
            </div>
          </div>

          {checklist.paystack_business_verified_at && (
            <p className="text-xs text-muted-foreground pl-7">
              Verified on {new Date(checklist.paystack_business_verified_at).toLocaleDateString()}
            </p>
          )}
        </div>

        <Separator />

        {/* Verification Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes">Verification Notes (Optional)</Label>
          <Textarea
            id="notes"
            value={verificationNotes}
            onChange={(e) => setVerificationNotes(e.target.value)}
            placeholder="Add any notes about the verification process..."
            rows={4}
            disabled={saving}
          />
          <Button 
            onClick={saveVerificationNotes} 
            disabled={saving}
            variant="outline"
            size="sm"
          >
            Save Notes
          </Button>
        </div>

        <Separator />

        {/* Final Approval */}
        <div className="space-y-4">
          {!checklist.final_approval ? (
            <>
              {!allRequirementsMet && (
                <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
                  <p className="text-sm text-orange-700 dark:text-orange-400">
                    All requirements must be completed before final approval can be granted.
                  </p>
                </div>
              )}
              <Button
                onClick={handleFinalApproval}
                disabled={!allRequirementsMet || saving}
                className="w-full"
                size="lg"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Grant Final Approval & Verify Business
                  </>
                )}
              </Button>
            </>
          ) : (
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2 text-green-700 dark:text-green-400 font-medium">
                <CheckCircle2 className="h-5 w-5" />
                Business Approved & Verified
              </div>
              <p className="text-sm text-muted-foreground">
                Final approval granted on {new Date(checklist.final_approved_at!).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};