import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, UserCircle, FileText, CheckCircle, XCircle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface ClientProfile {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  city: string | null;
  province: string | null;
  address: string | null;
  last_booking_date: string | null;
  profile_id: string;
  verification_status?: string;
  role?: string;
  contact_number?: string;
  business_name?: string;
  documents_count?: number;
  source_type: 'customer' | 'hairdresser' | 'business';
  bio?: string;
  experience_years?: number;
  specializations?: string[];
}

export const ClientSearch = () => {
  const [clients, setClients] = useState<ClientProfile[]>([]);
  const [filteredClients, setFilteredClients] = useState<ClientProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredClients(clients);
    } else {
      const filtered = clients.filter(
        (client) =>
          client.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          client.business_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          client.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          client.source_type.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredClients(filtered);
    }
  }, [searchTerm, clients]);

  const fetchClients = async () => {
    try {
      setLoading(true);
      
      // Fetch customer profiles
      const { data: clientData, error: clientError } = await supabase
        .from("client_profiles")
        .select(`
          *,
          profiles!client_profiles_profile_id_fkey (
            verification_status,
            role,
            contact_number,
            business_name
          )
        `)
        .order("created_at", { ascending: false });

      if (clientError) throw clientError;

      // Fetch hairdressers
      const { data: hairdresserData, error: hairdresserError } = await supabase
        .from("hairdressers")
        .select(`
          *,
          profiles!hairdressers_profile_id_fkey (
            user_id,
            email,
            full_name,
            phone,
            city,
            province,
            address,
            verification_status,
            contact_number,
            business_name
          )
        `)
        .order("created_at", { ascending: false });

      if (hairdresserError) throw hairdresserError;

      // Fetch salons/businesses
      const { data: salonData, error: salonError } = await supabase
        .from("salons")
        .select(`
          *,
          profiles!salons_owner_id_fkey (
            user_id,
            verification_status,
            contact_number
          )
        `)
        .order("created_at", { ascending: false });

      if (salonError) throw salonError;

      // Collect all profile IDs for document count
      const allProfileIds = [
        ...(clientData?.map(c => c.profile_id) || []),
        ...(hairdresserData?.map(h => h.profiles?.user_id).filter(Boolean) || []),
        ...(salonData?.map(s => s.profiles?.user_id).filter(Boolean) || [])
      ];

      const { data: docsData } = await supabase
        .from("verification_documents")
        .select("profile_id")
        .in("profile_id", allProfileIds);

      const docCounts = (docsData || []).reduce((acc: Record<string, number>, doc) => {
        acc[doc.profile_id] = (acc[doc.profile_id] || 0) + 1;
        return acc;
      }, {});

      // Map customer data
      const customers = clientData?.map(client => ({
        id: client.id,
        profile_id: client.profile_id,
        full_name: client.full_name,
        email: client.email,
        phone: client.phone,
        city: client.city,
        province: client.province,
        address: client.address,
        last_booking_date: client.last_booking_date,
        verification_status: client.profiles?.verification_status,
        role: client.profiles?.role,
        contact_number: client.profiles?.contact_number,
        business_name: client.profiles?.business_name,
        documents_count: docCounts[client.profile_id] || 0,
        source_type: 'customer' as const
      })) || [];

      // Map hairdresser data
      const hairdressers = hairdresserData?.map(hairdresser => ({
        id: hairdresser.id,
        profile_id: hairdresser.profile_id,
        full_name: hairdresser.profiles?.full_name || 'N/A',
        email: hairdresser.profiles?.email || 'N/A',
        phone: hairdresser.profiles?.phone,
        city: hairdresser.profiles?.city,
        province: hairdresser.profiles?.province,
        address: hairdresser.profiles?.address,
        last_booking_date: null,
        verification_status: hairdresser.profiles?.verification_status,
        role: 'hairdresser',
        contact_number: hairdresser.profiles?.contact_number,
        business_name: hairdresser.profiles?.business_name,
        documents_count: docCounts[hairdresser.profile_id] || 0,
        source_type: 'hairdresser' as const,
        bio: hairdresser.bio,
        experience_years: hairdresser.experience_years,
        specializations: hairdresser.specializations
      })) || [];

      // Map salon/business data
      const businesses = salonData?.map(salon => ({
        id: salon.id,
        profile_id: salon.owner_id,
        full_name: salon.name,
        email: salon.email || 'N/A',
        phone: salon.phone,
        city: null,
        province: null,
        address: salon.address,
        last_booking_date: null,
        verification_status: salon.profiles?.verification_status,
        role: 'business_owner',
        contact_number: salon.profiles?.contact_number || salon.phone,
        business_name: salon.name,
        documents_count: docCounts[salon.owner_id] || 0,
        source_type: 'business' as const
      })) || [];

      // Combine all data
      const allData = [...customers, ...hairdressers, ...businesses];
      
      setClients(allData);
      setFilteredClients(allData);
    } catch (error: any) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to load profiles",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClientClick = (clientId: string) => {
    navigate(`/employee/client/${clientId}`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCircle className="h-5 w-5" />
          Client Profiles
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, business, city, or type (customer/hairdresser/business)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading clients...</div>
        ) : filteredClients.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {searchTerm ? "No clients found matching your search" : "No clients found"}
          </div>
        ) : (
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Verification</TableHead>
                  <TableHead>Documents</TableHead>
                  <TableHead>Contract Details</TableHead>
                  <TableHead>Last Booking</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.map((client) => (
                  <TableRow
                    key={`${client.source_type}-${client.id}`}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleClientClick(client.id)}
                  >
                    <TableCell>
                      <Badge 
                        variant={
                          client.source_type === 'customer' ? 'default' : 
                          client.source_type === 'hairdresser' ? 'secondary' : 
                          'outline'
                        }
                        className="capitalize"
                      >
                        {client.source_type}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{client.full_name}</TableCell>
                    <TableCell>{client.email}</TableCell>
                    <TableCell>{client.phone || "—"}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {client.role || "customer"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {client.city && client.province 
                          ? `${client.city}, ${client.province}`
                          : client.city || client.province || "—"}
                      </div>
                      {client.address && (
                        <div className="text-xs text-muted-foreground truncate max-w-[150px]">
                          {client.address}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {client.verification_status === "approved" ? (
                        <div className="flex items-center gap-1 text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          <span className="text-xs">Verified</span>
                        </div>
                      ) : client.verification_status === "pending" ? (
                        <div className="flex items-center gap-1 text-yellow-600">
                          <Clock className="h-4 w-4" />
                          <span className="text-xs">Pending</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <XCircle className="h-4 w-4" />
                          <span className="text-xs">Not Verified</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{client.documents_count || 0}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {client.contact_number || "—"}
                      </div>
                      {client.business_name && (
                        <div className="text-xs text-muted-foreground truncate max-w-[150px]">
                          {client.business_name}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {client.last_booking_date
                        ? new Date(client.last_booking_date).toLocaleDateString()
                        : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
