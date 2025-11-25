import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AmendmentRequestModal } from "@/components/AmendmentRequestModal";
import { ArrowLeft, Edit, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface ClientProfile {
  id: string;
  profile_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  province: string | null;
  postal_code: string | null;
  notes: string | null;
  last_booking_date: string | null;
  source_type?: 'customer' | 'hairdresser' | 'business';
  bio?: string | null;
  experience_years?: number | null;
  specializations?: string[] | null;
  business_name?: string | null;
}

interface AmendmentModalState {
  isOpen: boolean;
  fieldName: string;
  fieldLabel: string;
  currentValue: string;
}

export default function ClientDetail() {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [client, setClient] = useState<ClientProfile | null>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [amendmentModal, setAmendmentModal] = useState<AmendmentModalState>({
    isOpen: false,
    fieldName: "",
    fieldLabel: "",
    currentValue: "",
  });

  useEffect(() => {
    if (clientId) {
      fetchClientDetails();
      fetchDocuments();
    }
  }, [clientId]);

  const fetchClientDetails = async () => {
    try {
      setLoading(true);
      
      // Try to fetch from client_profiles first
      const { data: clientData, error: clientError } = await supabase
        .from("client_profiles")
        .select("*")
        .eq("id", clientId)
        .maybeSingle();

      if (clientData) {
        setClient({ ...clientData, source_type: 'customer' });
        setLoading(false);
        return;
      }

      // Try hairdressers table
      const { data: hairdresserData, error: hairdresserError } = await supabase
        .from("hairdressers")
        .select(`
          *,
          profiles!hairdressers_profile_id_fkey (
            email,
            full_name,
            phone,
            city,
            province,
            address,
            business_name
          )
        `)
        .eq("id", clientId)
        .maybeSingle();

      if (hairdresserData && hairdresserData.profiles) {
        const profile = hairdresserData.profiles;
        setClient({
          id: hairdresserData.id,
          profile_id: hairdresserData.profile_id,
          full_name: profile.full_name || 'N/A',
          email: profile.email || 'N/A',
          phone: profile.phone,
          address: profile.address,
          city: profile.city,
          province: profile.province,
          postal_code: null,
          notes: hairdresserData.bio,
          last_booking_date: null,
          source_type: 'hairdresser',
          bio: hairdresserData.bio,
          experience_years: hairdresserData.experience_years,
          specializations: hairdresserData.specializations,
          business_name: profile.business_name
        });
        setLoading(false);
        return;
      }

      // Try salons table
      const { data: salonData, error: salonError } = await supabase
        .from("salons")
        .select("*")
        .eq("id", clientId)
        .maybeSingle();

      if (salonData) {
        setClient({
          id: salonData.id,
          profile_id: salonData.owner_id,
          full_name: salonData.name,
          email: salonData.email || 'N/A',
          phone: salonData.phone,
          address: salonData.address,
          city: null,
          province: null,
          postal_code: null,
          notes: salonData.description,
          last_booking_date: null,
          source_type: 'business',
          business_name: salonData.name
        });
        setLoading(false);
        return;
      }

      // If not found in any table
      toast({
        title: "Not Found",
        description: "Client, hairdresser, or business not found",
        variant: "destructive",
      });
    } catch (error: any) {
      console.error("Error fetching details:", error);
      toast({
        title: "Error",
        description: "Failed to load details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase.storage
        .from("client-documents")
        .list(`${clientId}/`, {
          limit: 100,
          offset: 0,
        });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error: any) {
      console.error("Error fetching documents:", error);
    }
  };

  const openAmendmentModal = (fieldName: string, fieldLabel: string, currentValue: string) => {
    setAmendmentModal({
      isOpen: true,
      fieldName,
      fieldLabel,
      currentValue: currentValue || "",
    });
  };

  const closeAmendmentModal = () => {
    setAmendmentModal({
      isOpen: false,
      fieldName: "",
      fieldLabel: "",
      currentValue: "",
    });
  };

  const getDocumentUrl = (fileName: string) => {
    const { data } = supabase.storage
      .from("client-documents")
      .getPublicUrl(`${clientId}/${fileName}`);
    return data.publicUrl;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading client details...</p>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Client not found</p>
          <Button onClick={() => navigate("/employee")}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/employee")}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Clients
        </Button>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Client Details */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>
                  {client.source_type === 'hairdresser' ? 'Business' : client.source_type === 'business' ? 'Business' : 'Client'} Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <div className="flex gap-2">
                      <Input value={client.full_name} disabled className="bg-muted" />
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() =>
                          openAmendmentModal("full_name", "Full Name", client.full_name)
                        }
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Email</Label>
                    <div className="flex gap-2">
                      <Input value={client.email} disabled className="bg-muted" />
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() =>
                          openAmendmentModal("email", "Email", client.email)
                        }
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <div className="flex gap-2">
                      <Input value={client.phone || ""} disabled className="bg-muted" />
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() =>
                          openAmendmentModal("phone", "Phone", client.phone || "")
                        }
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>City</Label>
                    <div className="flex gap-2">
                      <Input value={client.city || ""} disabled className="bg-muted" />
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() =>
                          openAmendmentModal("city", "City", client.city || "")
                        }
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Province</Label>
                    <div className="flex gap-2">
                      <Input value={client.province || ""} disabled className="bg-muted" />
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() =>
                          openAmendmentModal("province", "Province", client.province || "")
                        }
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Postal Code</Label>
                    <div className="flex gap-2">
                      <Input value={client.postal_code || ""} disabled className="bg-muted" />
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() =>
                          openAmendmentModal("postal_code", "Postal Code", client.postal_code || "")
                        }
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Address</Label>
                  <div className="flex gap-2">
                    <Textarea value={client.address || ""} disabled className="bg-muted" rows={2} />
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() =>
                        openAmendmentModal("address", "Address", client.address || "")
                      }
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>{client.source_type === 'hairdresser' ? 'Bio' : client.source_type === 'business' ? 'Description' : 'Notes'}</Label>
                  <div className="flex gap-2">
                    <Textarea value={client.notes || ""} disabled className="bg-muted" rows={3} />
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() =>
                        openAmendmentModal("notes", client.source_type === 'hairdresser' ? 'Bio' : client.source_type === 'business' ? 'Description' : 'Notes', client.notes || "")
                      }
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {client.source_type === 'hairdresser' && (
                  <>
                    {client.experience_years && (
                      <div className="space-y-2">
                        <Label>Experience</Label>
                        <Input value={`${client.experience_years} years`} disabled className="bg-muted" />
                      </div>
                    )}
                    {client.specializations && client.specializations.length > 0 && (
                      <div className="space-y-2">
                        <Label>Specializations</Label>
                        <div className="flex flex-wrap gap-2">
                          {client.specializations.map((spec, idx) => (
                            <Badge key={idx} variant="secondary">{spec}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {client.business_name && (
                  <div className="space-y-2">
                    <Label>Business Name</Label>
                    <Input value={client.business_name} disabled className="bg-muted" />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Documents Sidebar */}
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                {documents.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No documents uploaded</p>
                ) : (
                  <div className="space-y-2">
                    {documents.map((doc) => (
                      <a
                        key={doc.name}
                        href={getDocumentUrl(doc.name)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <p className="text-sm font-medium truncate">{doc.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(doc.created_at).toLocaleDateString()}
                        </p>
                      </a>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Amendment Modal */}
      {client && (
        <AmendmentRequestModal
          isOpen={amendmentModal.isOpen}
          onClose={closeAmendmentModal}
          clientProfileId={client.id}
          clientId={client.profile_id}
          fieldName={amendmentModal.fieldName}
          fieldLabel={amendmentModal.fieldLabel}
          currentValue={amendmentModal.currentValue}
          onSuccess={fetchClientDetails}
        />
      )}
    </div>
  );
}
