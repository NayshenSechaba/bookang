import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface AmendmentRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientProfileId: string;
  clientId: string;
  fieldName: string;
  fieldLabel: string;
  currentValue: string;
  onSuccess: () => void;
}

export const AmendmentRequestModal = ({
  isOpen,
  onClose,
  clientProfileId,
  clientId,
  fieldName,
  fieldLabel,
  currentValue,
  onSuccess,
}: AmendmentRequestModalProps) => {
  const [newValue, setNewValue] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!newValue.trim()) {
      toast({
        title: "Error",
        description: "Please enter a new value",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase.from("amendment_requests").insert({
        user_id_employee: user.id,
        user_id_client: clientId,
        client_profile_id: clientProfileId,
        field_name: fieldName,
        old_value: currentValue,
        new_value: newValue.trim(),
        reason: reason.trim() || null,
        status: "pending",
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Amendment request submitted successfully",
      });

      setNewValue("");
      setReason("");
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error submitting amendment:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit amendment request",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request Amendment: {fieldLabel}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Current Value</Label>
            <Input value={currentValue} disabled className="bg-muted" />
          </div>

          <div className="space-y-2">
            <Label>New Value *</Label>
            <Input
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              placeholder="Enter new value"
            />
          </div>

          <div className="space-y-2">
            <Label>Reason (Optional)</Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why this change is needed..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Submitting..." : "Submit Request"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
