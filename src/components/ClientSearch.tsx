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
          client.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredClients(filtered);
    }
  }, [searchTerm, clients]);

  const fetchClients = async () => {
    try {
      setLoading(true);
      
      // Fetch client profiles with related profile data
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

      // Fetch document counts for each client
      const profileIds = clientData?.map(c => c.profile_id) || [];
      const { data: docsData } = await supabase
        .from("verification_documents")
        .select("profile_id")
        .in("profile_id", profileIds);

      // Count documents per profile
      const docCounts = (docsData || []).reduce((acc: Record<string, number>, doc) => {
        acc[doc.profile_id] = (acc[doc.profile_id] || 0) + 1;
        return acc;
      }, {});

      // Combine data
      const enrichedClients = clientData?.map(client => ({
        ...client,
        verification_status: client.profiles?.verification_status,
        role: client.profiles?.role,
        contact_number: client.profiles?.contact_number,
        business_name: client.profiles?.business_name,
        documents_count: docCounts[client.profile_id] || 0,
      })) || [];

      setClients(enrichedClients);
      setFilteredClients(enrichedClients);
    } catch (error: any) {
      console.error("Error fetching clients:", error);
      toast({
        title: "Error",
        description: "Failed to load client profiles",
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
            placeholder="Search by name or email..."
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
                    key={client.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleClientClick(client.id)}
                  >
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
