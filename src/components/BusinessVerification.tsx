import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileCheck, Shield } from "lucide-react";

interface BusinessVerificationProps {
  profileId: string;
  onComplete: () => void;
}

const SOUTH_AFRICAN_BANKS = [
  "ABSA Bank", "African Bank", "Capitec Bank", "Discovery Bank", "First National Bank (FNB)",
  "Investec Bank", "Nedbank", "Standard Bank", "TymeBank", "Bidvest Bank", "Grindrod Bank",
  "Sasfin Bank", "Access Bank South Africa", "Albaraka Bank", "Bank of Athens", "Bank Zero",
  "Finbond Mutual Bank", "Grobank", "Habib Overseas Bank", "HBZ Bank", "Ithala SOC", 
  "Mercantile Bank", "Olympus Mobile", "Ubank", "VBS Mutual Bank"
];

export const BusinessVerification = ({ profileId, onComplete }: BusinessVerificationProps) => {
  const [businessType, setBusinessType] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [documents, setDocuments] = useState<{
    idDocument?: File;
    addressDocument?: File;
    bankDocument?: File;
    companyDocument?: File;
    businessAddress?: File;
    representativeId?: File;
    representativeAddress?: File;
  }>({});
  const [bankDetails, setBankDetails] = useState({
    accountHolder: "",
    branchNumber: "",
    accountNumber: "",
    bankName: ""
  });
  const { toast } = useToast();

  const handleFileChange = (documentType: string, file: File | undefined) => {
    setDocuments(prev => ({ ...prev, [documentType]: file }));
  };

  const uploadDocument = async (file: File, documentType: string, userId: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${documentType}-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('verification-documents')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    // Save to verification_documents table
    const { error: dbError } = await supabase
      .from('verification_documents')
      .insert({
        profile_id: profileId,
        document_type: documentType,
        file_path: fileName,
      });

    if (dbError) throw dbError;

    return fileName;
  };

  const handleSubmit = async () => {
    if (!businessType) {
      toast({
        title: "Business Type Required",
        description: "Please select your business type",
        variant: "destructive",
      });
      return;
    }

    const requiredDocs = businessType === 'individual'
      ? ['idDocument', 'addressDocument', 'bankDocument']
      : ['companyDocument', 'businessAddress', 'representativeId', 'representativeAddress', 'bankDocument'];

    const missingDocs = requiredDocs.filter(doc => !documents[doc as keyof typeof documents]);
    
    if (missingDocs.length > 0) {
      toast({
        title: "Missing Documents",
        description: "Please upload all required documents",
        variant: "destructive",
      });
      return;
    }

    // Validate bank details
    if (!bankDetails.accountHolder || !bankDetails.branchNumber || !bankDetails.accountNumber || !bankDetails.bankName) {
      toast({
        title: "Missing Bank Details",
        description: "Please fill in all bank account information",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Upload all documents
      for (const [key, file] of Object.entries(documents)) {
        if (file) {
          await uploadDocument(file, key, user.id);
        }
      }

      // Update profile with verification status and bank details
      const profileInfo = JSON.stringify({ bankDetails });
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          verification_status: 'pending',
          business_type: businessType,
          verification_submitted_at: new Date().toISOString(),
          profile_information: profileInfo,
        })
        .eq('id', profileId);

      if (updateError) throw updateError;

      toast({
        title: "Verification Submitted",
        description: "Your documents have been submitted for review. We'll notify you by email once the verification is complete.",
      });

      onComplete();
    } catch (error: any) {
      console.error('Verification submission error:', error);
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit verification documents",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          <Shield className="h-6 w-6 text-primary" />
          <CardTitle>Complete Your Business Verification</CardTitle>
        </div>
        <CardDescription>
          To comply with national financial regulations (FICA) and ensure a secure marketplace for all users,
          we must verify your identity. This is a one-time step required to activate your profile and receive payouts.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Step 1: Business Type Selection */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Step 1: Select Your Business Type</h3>
          <RadioGroup value={businessType} onValueChange={setBusinessType}>
            <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-accent">
              <RadioGroupItem value="individual" id="individual" />
              <Label htmlFor="individual" className="cursor-pointer flex-1">
                <div className="font-medium">Individual / Sole Proprietor</div>
                <div className="text-sm text-muted-foreground">You trade under your own name</div>
              </Label>
            </div>
            <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-accent">
              <RadioGroupItem value="registered" id="registered" />
              <Label htmlFor="registered" className="cursor-pointer flex-1">
                <div className="font-medium">Registered Business</div>
                <div className="text-sm text-muted-foreground">e.g., (Pty) Ltd, CC</div>
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Step 2: Document Upload */}
        {businessType && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
            <h3 className="text-lg font-semibold">Step 2: Upload Your Documents</h3>
            
            {businessType === 'individual' ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">We need to verify your personal identity and address.</p>
                
                {/* ID Document */}
                <div className="space-y-2">
                  <Label className="text-base">1. Proof of Identity</Label>
                  <p className="text-sm text-muted-foreground">
                    Please upload one valid, government-issued photo ID (e.g., SA Smart ID Card, Green ID Book, Driver's License, or Passport)
                  </p>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" className="w-full" asChild>
                      <label className="cursor-pointer">
                        <Upload className="h-4 w-4 mr-2" />
                        {documents.idDocument ? documents.idDocument.name : 'Upload ID Document'}
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*,.pdf"
                          onChange={(e) => handleFileChange('idDocument', e.target.files?.[0])}
                        />
                      </label>
                    </Button>
                    {documents.idDocument && <FileCheck className="h-5 w-5 text-green-500" />}
                  </div>
                </div>

                {/* Address Document */}
                <div className="space-y-2">
                  <Label className="text-base">2. Proof of Address</Label>
                  <p className="text-sm text-muted-foreground">
                    Please upload one document from the last 3 months (e.g., Utility bill, bank statement, or rental agreement)
                  </p>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" className="w-full" asChild>
                      <label className="cursor-pointer">
                        <Upload className="h-4 w-4 mr-2" />
                        {documents.addressDocument ? documents.addressDocument.name : 'Upload Address Document'}
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*,.pdf"
                          onChange={(e) => handleFileChange('addressDocument', e.target.files?.[0])}
                        />
                      </label>
                    </Button>
                    {documents.addressDocument && <FileCheck className="h-5 w-5 text-green-500" />}
                  </div>
                </div>

                {/* Bank Document */}
                <div className="space-y-2">
                  <Label className="text-base">3. Bank Letter or Bank Statement</Label>
                  <p className="text-sm text-muted-foreground">
                    Please upload an official bank letter or bank statement from the last 3 months
                  </p>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" className="w-full" asChild>
                      <label className="cursor-pointer">
                        <Upload className="h-4 w-4 mr-2" />
                        {documents.bankDocument ? documents.bankDocument.name : 'Upload Bank Document'}
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*,.pdf"
                          onChange={(e) => handleFileChange('bankDocument', e.target.files?.[0])}
                        />
                      </label>
                    </Button>
                    {documents.bankDocument && <FileCheck className="h-5 w-5 text-green-500" />}
                  </div>
                </div>

                {/* Bank Account Details */}
                <div className="space-y-2">
                  <Label className="text-base">4. Bank Account Information</Label>
                  <div className="space-y-3 pl-4 border-l-2">
                    <div className="space-y-2">
                      <Label className="text-sm">Bank Account Holder</Label>
                      <Input
                        placeholder="Full name as it appears on your bank account"
                        value={bankDetails.accountHolder}
                        onChange={(e) => setBankDetails(prev => ({ ...prev, accountHolder: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">Branch Number</Label>
                      <Input
                        placeholder="6-digit branch code"
                        value={bankDetails.branchNumber}
                        onChange={(e) => setBankDetails(prev => ({ ...prev, branchNumber: e.target.value }))}
                        maxLength={6}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">Account Number</Label>
                      <Input
                        placeholder="Your bank account number"
                        value={bankDetails.accountNumber}
                        onChange={(e) => setBankDetails(prev => ({ ...prev, accountNumber: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">Bank</Label>
                      <Select
                        value={bankDetails.bankName}
                        onValueChange={(value) => setBankDetails(prev => ({ ...prev, bankName: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select your bank" />
                        </SelectTrigger>
                        <SelectContent>
                          {SOUTH_AFRICAN_BANKS.map((bank) => (
                            <SelectItem key={bank} value={bank}>
                              {bank}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">We need to verify your business entity and the primary individual representing it.</p>
                
                {/* Company Registration */}
                <div className="space-y-2">
                  <Label className="text-base">1. Company Registration Document</Label>
                  <p className="text-sm text-muted-foreground">
                    Please upload your official company registration certificate (e.g., CIPC Certificate of Incorporation (CoR 14.3))
                  </p>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" className="w-full" asChild>
                      <label className="cursor-pointer">
                        <Upload className="h-4 w-4 mr-2" />
                        {documents.companyDocument ? documents.companyDocument.name : 'Upload Company Document'}
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*,.pdf"
                          onChange={(e) => handleFileChange('companyDocument', e.target.files?.[0])}
                        />
                      </label>
                    </Button>
                    {documents.companyDocument && <FileCheck className="h-5 w-5 text-green-500" />}
                  </div>
                </div>

                {/* Business Address */}
                <div className="space-y-2">
                  <Label className="text-base">2. Proof of Business Address</Label>
                  <p className="text-sm text-muted-foreground">
                    Please upload one document from the last 3 months showing your company's address
                  </p>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" className="w-full" asChild>
                      <label className="cursor-pointer">
                        <Upload className="h-4 w-4 mr-2" />
                        {documents.businessAddress ? documents.businessAddress.name : 'Upload Business Address Document'}
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*,.pdf"
                          onChange={(e) => handleFileChange('businessAddress', e.target.files?.[0])}
                        />
                      </label>
                    </Button>
                    {documents.businessAddress && <FileCheck className="h-5 w-5 text-green-500" />}
                  </div>
                </div>

                {/* Representative Documents */}
                <div className="space-y-2">
                  <Label className="text-base">3. Key Individual Verification</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Please upload the documents for the primary director or representative completing this registration.
                  </p>
                  
                  <div className="space-y-3 pl-4 border-l-2">
                    <div className="space-y-2">
                      <Label className="text-sm">Representative's Proof of Identity</Label>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" className="w-full" asChild>
                          <label className="cursor-pointer">
                            <Upload className="h-4 w-4 mr-2" />
                            {documents.representativeId ? documents.representativeId.name : "Upload Representative's ID"}
                            <input
                              type="file"
                              className="hidden"
                              accept="image/*,.pdf"
                              onChange={(e) => handleFileChange('representativeId', e.target.files?.[0])}
                            />
                          </label>
                        </Button>
                        {documents.representativeId && <FileCheck className="h-5 w-5 text-green-500" />}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm">Representative's Proof of Address</Label>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" className="w-full" asChild>
                          <label className="cursor-pointer">
                            <Upload className="h-4 w-4 mr-2" />
                            {documents.representativeAddress ? documents.representativeAddress.name : "Upload Representative's Address"}
                            <input
                              type="file"
                              className="hidden"
                              accept="image/*,.pdf"
                              onChange={(e) => handleFileChange('representativeAddress', e.target.files?.[0])}
                            />
                          </label>
                        </Button>
                        {documents.representativeAddress && <FileCheck className="h-5 w-5 text-green-500" />}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bank Document */}
                <div className="space-y-2">
                  <Label className="text-base">4. Bank Letter or Bank Statement</Label>
                  <p className="text-sm text-muted-foreground">
                    Please upload an official bank letter or bank statement from the last 3 months
                  </p>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" className="w-full" asChild>
                      <label className="cursor-pointer">
                        <Upload className="h-4 w-4 mr-2" />
                        {documents.bankDocument ? documents.bankDocument.name : 'Upload Bank Document'}
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*,.pdf"
                          onChange={(e) => handleFileChange('bankDocument', e.target.files?.[0])}
                        />
                      </label>
                    </Button>
                    {documents.bankDocument && <FileCheck className="h-5 w-5 text-green-500" />}
                  </div>
                </div>

                {/* Bank Account Details */}
                <div className="space-y-2">
                  <Label className="text-base">5. Bank Account Information</Label>
                  <div className="space-y-3 pl-4 border-l-2">
                    <div className="space-y-2">
                      <Label className="text-sm">Bank Account Holder</Label>
                      <Input
                        placeholder="Business/Company name as it appears on bank account"
                        value={bankDetails.accountHolder}
                        onChange={(e) => setBankDetails(prev => ({ ...prev, accountHolder: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">Branch Number</Label>
                      <Input
                        placeholder="6-digit branch code"
                        value={bankDetails.branchNumber}
                        onChange={(e) => setBankDetails(prev => ({ ...prev, branchNumber: e.target.value }))}
                        maxLength={6}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">Account Number</Label>
                      <Input
                        placeholder="Company bank account number"
                        value={bankDetails.accountNumber}
                        onChange={(e) => setBankDetails(prev => ({ ...prev, accountNumber: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">Bank</Label>
                      <Select
                        value={bankDetails.bankName}
                        onValueChange={(value) => setBankDetails(prev => ({ ...prev, bankName: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select your bank" />
                        </SelectTrigger>
                        <SelectContent>
                          {SOUTH_AFRICAN_BANKS.map((bank) => (
                            <SelectItem key={bank} value={bank}>
                              {bank}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Submit Section */}
        {businessType && (
          <div className="space-y-4 pt-4 border-t animate-in fade-in slide-in-from-bottom-4">
            <h3 className="text-lg font-semibold">Final Step: Review and Submit</h3>
            <p className="text-sm text-muted-foreground">
              Your information is encrypted and will be stored securely. By clicking "Submit," you confirm that 
              the information provided is accurate and agree to our verification process.
            </p>
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <h4 className="font-medium">What's next?</h4>
              <p className="text-sm text-muted-foreground">
                Our compliance team will review all documentation. Once all checks have been completed, 
                we will notify you by email. After approval, your profile will be activated, and you can start receiving payments.
              </p>
              <p className="text-sm font-medium">Thank you for helping us build a trusted platform.</p>
            </div>
            <Button 
              onClick={handleSubmit} 
              disabled={uploading}
              className="w-full"
              size="lg"
            >
              {uploading ? "Submitting..." : "Submit for Verification"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
