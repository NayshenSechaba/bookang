import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ClientSearch } from "@/components/ClientSearch";
import { PerformanceTab } from "@/components/PerformanceTab";
import { FinancialTab } from "@/components/FinancialTab";
import { RankingsTab } from "@/components/RankingsTab";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, Users, FileText, User, TrendingUp, DollarSign, Bell, Award } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function EmployeeDashboard() {
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [pendingDocsCount, setPendingDocsCount] = useState(0);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkEmployeeAccess();
  }, []);

  useEffect(() => {
    if (userRole === "super_user") {
      fetchPendingDocsCount();
      
      // Set up real-time subscription
      const channel = supabase
        .channel('verification-docs-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'verification_documents'
          },
          () => {
            fetchPendingDocsCount();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [userRole]);

  const fetchPendingDocsCount = async () => {
    try {
      const { count } = await supabase
        .from("verification_documents")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");
      
      setPendingDocsCount(count || 0);
    } catch (error) {
      console.error("Error fetching pending docs count:", error);
    }
  };

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
            {userRole === "super_user" && pendingDocsCount > 0 && (
              <div className="relative">
                <Button
                  variant="outline"
                  size="icon"
                  className="relative"
                  onClick={() => navigate("/employee")}
                >
                  <Bell className="h-4 w-4" />
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  >
                    {pendingDocsCount}
                  </Badge>
                </Button>
              </div>
            )}
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
        <Tabs defaultValue="clients" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="clients">
              <Users className="h-4 w-4 mr-2" />
              Clients
            </TabsTrigger>
            <TabsTrigger value="rankings">
              <Award className="h-4 w-4 mr-2" />
              Rankings
            </TabsTrigger>
            <TabsTrigger value="performance">
              <TrendingUp className="h-4 w-4 mr-2" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="financial">
              <DollarSign className="h-4 w-4 mr-2" />
              Financial
            </TabsTrigger>
            {userRole === "super_user" && (
              <TabsTrigger value="amendments">
                <FileText className="h-4 w-4 mr-2" />
                Amendments
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="clients">
            <ClientSearch />
          </TabsContent>

          <TabsContent value="rankings">
            <RankingsTab />
          </TabsContent>

          <TabsContent value="rankings">
            <RankingsTab />
          </TabsContent>

          <TabsContent value="performance">
            <PerformanceTab />
          </TabsContent>

          <TabsContent value="financial">
            <FinancialTab />
          </TabsContent>

          {userRole === "super_user" && (
            <TabsContent value="amendments">
              <Card>
                <CardHeader>
                  <CardTitle>Amendment Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => navigate("/employee/amendments")}>
                    View All Amendment Requests
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}
