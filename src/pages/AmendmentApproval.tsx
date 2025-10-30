import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AmendmentRequest {
  id: string;
  field_name: string;
  old_value: string | null;
  new_value: string;
  status: string;
  reason: string | null;
  created_at: string;
  client_profiles: {
    full_name: string;
    email: string;
  };
  profiles: {
    full_name: string | null;
    email: string;
  };
}

export default function AmendmentApproval() {
  const [amendments, setAmendments] = useState<AmendmentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAmendment, setSelectedAmendment] = useState<AmendmentRequest | null>(null);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null);
  const [actionReason, setActionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkSuperUserAccess();
  }, []);

  const checkSuperUserAccess = async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        navigate("/");
        return;
      }

      const { data: roleData, error: roleError } = await supabase
        .from("employee_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "super_user")
        .single();

      if (roleError || !roleData) {
        toast({
          title: "Access Denied",
          description: "Super user access required",
          variant: "destructive",
        });
        navigate("/employee");
        return;
      }

      fetchAmendments();
    } catch (error) {
      console.error("Error checking access:", error);
      navigate("/employee");
    }
  };

  const fetchAmendments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("amendment_requests")
        .select(`
          *,
          client_profiles!amendment_requests_client_profile_id_fkey (
            full_name,
            email
          ),
          profiles!amendment_requests_user_id_client_fkey (
            full_name,
            email
          )
        `)
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAmendments(data || []);
    } catch (error: any) {
      console.error("Error fetching amendments:", error);
      toast({
        title: "Error",
        description: "Failed to load amendment requests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const openActionDialog = (amendment: AmendmentRequest, action: "approve" | "reject") => {
    setSelectedAmendment(amendment);
    setActionType(action);
    setActionReason("");
  };

  const closeActionDialog = () => {
    setSelectedAmendment(null);
    setActionType(null);
    setActionReason("");
  };

  const handleAction = async () => {
    if (!selectedAmendment || !actionType) return;

    try {
      setActionLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) throw new Error("No active session");

      const { data, error } = await supabase.functions.invoke("approve-amendment", {
        body: {
          amendment_id: selectedAmendment.id,
          action: actionType,
          reason: actionReason.trim() || null,
        },
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Amendment ${actionType === "approve" ? "approved" : "rejected"} successfully`,
      });

      closeActionDialog();
      fetchAmendments();
    } catch (error: any) {
      console.error("Error processing amendment:", error);
      toast({
        title: "Error",
        description: error.message || `Failed to ${actionType} amendment`,
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/employee")}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Pending Amendment Requests</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading amendments...
              </div>
            ) : amendments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No pending amendment requests
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Client</TableHead>
                      <TableHead>Field</TableHead>
                      <TableHead>Old Value</TableHead>
                      <TableHead>New Value</TableHead>
                      <TableHead>Requested By</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {amendments.map((amendment) => (
                      <TableRow key={amendment.id}>
                        <TableCell className="font-medium">
                          <div>
                            <p>{amendment.client_profiles.full_name}</p>
                            <p className="text-xs text-muted-foreground">
                              {amendment.client_profiles.email}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {amendment.field_name.replace(/_/g, " ").toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-[150px] truncate">
                          {amendment.old_value || "—"}
                        </TableCell>
                        <TableCell className="max-w-[150px] truncate font-medium">
                          {amendment.new_value}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm">
                              {amendment.profiles.full_name || "Unknown"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {amendment.profiles.email}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(amendment.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => openActionDialog(amendment, "approve")}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => openActionDialog(amendment, "reject")}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
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

      {/* Action Dialog */}
      <Dialog open={!!selectedAmendment && !!actionType} onOpenChange={closeActionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "approve" ? "Approve" : "Reject"} Amendment Request
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {selectedAmendment && (
              <>
                <div>
                  <p className="text-sm text-muted-foreground">Client</p>
                  <p className="font-medium">{selectedAmendment.client_profiles.full_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Field</p>
                  <p className="font-medium">
                    {selectedAmendment.field_name.replace(/_/g, " ").toUpperCase()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Change</p>
                  <p className="text-sm">
                    <span className="line-through text-muted-foreground">
                      {selectedAmendment.old_value || "Empty"}
                    </span>
                    {" → "}
                    <span className="font-medium">{selectedAmendment.new_value}</span>
                  </p>
                </div>
                {selectedAmendment.reason && (
                  <div>
                    <p className="text-sm text-muted-foreground">Reason</p>
                    <p className="text-sm">{selectedAmendment.reason}</p>
                  </div>
                )}
              </>
            )}

            <div className="space-y-2">
              <Label>
                {actionType === "approve" ? "Approval" : "Rejection"} Note (Optional)
              </Label>
              <Textarea
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                placeholder={`Add a note about this ${actionType}...`}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeActionDialog} disabled={actionLoading}>
              Cancel
            </Button>
            <Button
              onClick={handleAction}
              disabled={actionLoading}
              variant={actionType === "approve" ? "default" : "destructive"}
            >
              {actionLoading
                ? "Processing..."
                : actionType === "approve"
                ? "Approve"
                : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
