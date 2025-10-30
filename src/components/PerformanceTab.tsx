import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Calendar, Users, AlertCircle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BookingStats {
  confirmed: number;
  completed: number;
  cancelled: number;
  noShows: number;
  pending: number;
}

interface Performer {
  hairdresser_id: string;
  hairdresser_name: string;
  salon_name: string | null;
  total_completed_bookings: number;
  total_cancellations: number;
  total_no_shows: number;
  total_bookings: number;
  completion_rate: number;
}

interface OnboardingProfile {
  profile_id: string;
  full_name: string;
  email: string;
  role: string;
  onboarding_stage: string;
  is_verified: boolean;
  created_at: string;
}

export const PerformanceTab = () => {
  const [bookingStats, setBookingStats] = useState<BookingStats>({
    confirmed: 0,
    completed: 0,
    cancelled: 0,
    noShows: 0,
    pending: 0,
  });
  const [topPerformers, setTopPerformers] = useState<Performer[]>([]);
  const [lowPerformers, setLowPerformers] = useState<Performer[]>([]);
  const [incompleteOnboarding, setIncompleteOnboarding] = useState<OnboardingProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchPerformanceData();
  }, []);

  const fetchPerformanceData = async () => {
    try {
      setLoading(true);

      // Fetch booking stats
      const { data: bookings, error: bookingsError } = await supabase
        .from("vw_booking_status")
        .select("status");

      if (bookingsError) throw bookingsError;

      const stats: BookingStats = {
        confirmed: bookings?.filter((b) => b.status === "confirmed").length || 0,
        completed: bookings?.filter((b) => b.status === "completed").length || 0,
        cancelled: bookings?.filter((b) => b.status === "cancelled").length || 0,
        noShows: bookings?.filter((b) => b.status === "no-show").length || 0,
        pending: bookings?.filter((b) => b.status === "pending").length || 0,
      };
      setBookingStats(stats);

      // Fetch performer ratings
      const { data: performers, error: performersError } = await supabase
        .from("vw_performer_ratings")
        .select("*")
        .order("total_completed_bookings", { ascending: false });

      if (performersError) throw performersError;

      // Top performers (highest completion rate and bookings)
      const top = (performers || [])
        .filter((p) => p.total_bookings >= 5)
        .sort((a, b) => {
          const scoreA = a.completion_rate * 0.7 + a.total_completed_bookings * 0.3;
          const scoreB = b.completion_rate * 0.7 + b.total_completed_bookings * 0.3;
          return scoreB - scoreA;
        })
        .slice(0, 5);
      setTopPerformers(top);

      // Low performers (high no-shows or cancellations)
      const low = (performers || [])
        .filter((p) => p.total_bookings >= 5 && (p.total_no_shows >= 3 || p.completion_rate < 50))
        .sort((a, b) => {
          const scoreA = a.total_no_shows * 2 + a.total_cancellations;
          const scoreB = b.total_no_shows * 2 + b.total_cancellations;
          return scoreB - scoreA;
        })
        .slice(0, 5);
      setLowPerformers(low);

      // Fetch incomplete onboarding
      const { data: onboarding, error: onboardingError } = await supabase
        .from("vw_onboarding_status")
        .select("*")
        .eq("onboarding_completed", false)
        .order("created_at", { ascending: false })
        .limit(10);

      if (onboardingError) throw onboardingError;
      setIncompleteOnboarding(onboarding || []);
    } catch (error: any) {
      console.error("Error fetching performance data:", error);
      toast({
        title: "Error",
        description: "Failed to load performance data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading performance data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Booking Status Summary */}
      <div className="grid md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bookingStats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-blue-500" />
              Confirmed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{bookingStats.confirmed}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{bookingStats.completed}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-orange-500" />
              Cancelled
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{bookingStats.cancelled}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              No-Shows
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{bookingStats.noShows}</div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            Top Performers
          </CardTitle>
        </CardHeader>
        <CardContent>
          {topPerformers.length === 0 ? (
            <p className="text-sm text-muted-foreground">No data available</p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Salon</TableHead>
                    <TableHead>Completed</TableHead>
                    <TableHead>Total Bookings</TableHead>
                    <TableHead>Completion Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topPerformers.map((performer) => (
                    <TableRow key={performer.hairdresser_id}>
                      <TableCell className="font-medium">{performer.hairdresser_name}</TableCell>
                      <TableCell>{performer.salon_name || "Independent"}</TableCell>
                      <TableCell>{performer.total_completed_bookings}</TableCell>
                      <TableCell>{performer.total_bookings}</TableCell>
                      <TableCell>
                        <Badge variant="default">{performer.completion_rate}%</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Low Performers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-red-500" />
            Attention Needed
          </CardTitle>
        </CardHeader>
        <CardContent>
          {lowPerformers.length === 0 ? (
            <p className="text-sm text-muted-foreground">No issues detected</p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Salon</TableHead>
                    <TableHead>No-Shows</TableHead>
                    <TableHead>Cancellations</TableHead>
                    <TableHead>Completion Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lowPerformers.map((performer) => (
                    <TableRow key={performer.hairdresser_id}>
                      <TableCell className="font-medium">{performer.hairdresser_name}</TableCell>
                      <TableCell>{performer.salon_name || "Independent"}</TableCell>
                      <TableCell>
                        <Badge variant="destructive">{performer.total_no_shows}</Badge>
                      </TableCell>
                      <TableCell>{performer.total_cancellations}</TableCell>
                      <TableCell>
                        <Badge variant={performer.completion_rate < 50 ? "destructive" : "outline"}>
                          {performer.completion_rate}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Incomplete Onboarding */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Incomplete Onboarding & Verification
          </CardTitle>
        </CardHeader>
        <CardContent>
          {incompleteOnboarding.length === 0 ? (
            <p className="text-sm text-muted-foreground">All users are fully onboarded</p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Stage</TableHead>
                    <TableHead>Verified</TableHead>
                    <TableHead>Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {incompleteOnboarding.map((profile) => (
                    <TableRow key={profile.profile_id}>
                      <TableCell className="font-medium">{profile.full_name || "—"}</TableCell>
                      <TableCell>{profile.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{profile.role}</Badge>
                      </TableCell>
                      <TableCell>{profile.onboarding_stage}</TableCell>
                      <TableCell>
                        {profile.is_verified ? (
                          <Badge variant="default">Yes</Badge>
                        ) : (
                          <Badge variant="destructive">No</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(profile.created_at).toLocaleDateString()}
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
  );
};
