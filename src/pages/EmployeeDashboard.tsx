import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ClientSearch } from "@/components/ClientSearch";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, Users, FileText, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function EmployeeDashboard() {
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkEmployeeAccess();
  }, []);

  const checkEmployeeAccess = async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        navigate("/");
        return;
      }

      // Check employee role
      const { data: roleData, error: roleError } = await supabase
        .from("employee_roles")
        .select("role")
        .eq("user_id", user.id)
        .single();

      if (roleError || !roleData) {
        toast({
          title: "Access Denied",
          description: "You don't have employee access to this dashboard",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      setUserRole(roleData.role);
    } catch (error) {
      console.error("Error checking access:", error);
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Employee Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            {userRole === "super_user" && (
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                Super User
              </span>
            )}
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {/* Sidebar Navigation */}
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Navigation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => navigate("/employee")}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Client Profiles
                </Button>
                
                {userRole === "super_user" && (
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => navigate("/employee/amendments")}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Amendment Requests
                  </Button>
                )}
                
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => navigate("/employee/profile")}
                >
                  <User className="h-4 w-4 mr-2" />
                  My Profile
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="md:col-span-3">
            <ClientSearch />
          </div>
        </div>
      </div>
    </div>
  );
}
