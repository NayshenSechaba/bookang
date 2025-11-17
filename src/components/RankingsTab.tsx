import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Star, TrendingUp, TrendingDown, Award, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface BusinessRanking {
  hairdresser_id: string;
  business_name: string;
  total_reviews: number;
  average_rating: number;
  five_star_count: number;
  one_star_count: number;
  flagged_reviews: number;
  last_review_date: string;
  total_completed_bookings: number;
  review_response_rate: number;
}

interface CustomerRanking {
  customer_id: string;
  customer_name: string;
  email: string;
  total_reviews_given: number;
  average_rating_given: number;
  low_ratings_given: number;
  flagged_reviews_given: number;
  total_bookings: number;
  completed_bookings: number;
  cancelled_bookings: number;
  no_show_count: number;
  last_review_date: string;
  completion_rate: number;
}

export function RankingsTab() {
  const [businessRankings, setBusinessRankings] = useState<BusinessRanking[]>([]);
  const [customerRankings, setCustomerRankings] = useState<CustomerRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchRankings();
  }, []);

  const fetchRankings = async () => {
    try {
      setLoading(true);

      // Fetch business rankings
      const { data: businessData, error: businessError } = await supabase
        .from("vw_business_rankings")
        .select("*")
        .order("average_rating", { ascending: false });

      if (businessError) throw businessError;

      // Fetch customer rankings
      const { data: customerData, error: customerError } = await supabase
        .from("vw_customer_rankings")
        .select("*")
        .order("completion_rate", { ascending: false });

      if (customerError) throw customerError;

      setBusinessRankings(businessData || []);
      setCustomerRankings(customerData || []);
    } catch (error: any) {
      console.error("Error fetching rankings:", error);
      toast({
        title: "Error",
        description: "Failed to load rankings data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return "text-green-600";
    if (rating >= 3.5) return "text-yellow-600";
    return "text-red-600";
  };

  const getRatingBadge = (rating: number) => {
    if (rating >= 4.5) return <Badge className="bg-green-100 text-green-800">Excellent</Badge>;
    if (rating >= 3.5) return <Badge className="bg-yellow-100 text-yellow-800">Good</Badge>;
    if (rating >= 2.5) return <Badge className="bg-orange-100 text-orange-800">Fair</Badge>;
    return <Badge className="bg-red-100 text-red-800">Poor</Badge>;
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= Math.round(rating)
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
        <span className={`ml-2 font-semibold ${getRatingColor(rating)}`}>
          {rating?.toFixed(2) || "N/A"}
        </span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading rankings...</p>
        </div>
      </div>
    );
  }

  return (
    <Tabs defaultValue="businesses" className="space-y-4">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="businesses">
          <Award className="h-4 w-4 mr-2" />
          Business Rankings
        </TabsTrigger>
        <TabsTrigger value="customers">
          <TrendingUp className="h-4 w-4 mr-2" />
          Customer Rankings
        </TabsTrigger>
      </TabsList>

      <TabsContent value="businesses" className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Top Performer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {businessRankings[0]?.business_name || "N/A"}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {businessRankings[0] && renderStars(businessRankings[0].average_rating)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Businesses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{businessRankings.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                With reviews
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Needs Attention</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {businessRankings.filter(b => b.average_rating < 3).length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Below 3 stars
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Business Performance Rankings</CardTitle>
            <CardDescription>
              Ranked by average rating and total reviews
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Rank</TableHead>
                    <TableHead>Business Name</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Total Reviews</TableHead>
                    <TableHead>5 Stars</TableHead>
                    <TableHead>1 Star</TableHead>
                    <TableHead>Flagged</TableHead>
                    <TableHead>Response Rate</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {businessRankings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        No business rankings available yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    businessRankings.map((business, index) => (
                      <TableRow key={business.hairdresser_id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {index === 0 && <Award className="h-4 w-4 text-yellow-500" />}
                            <span className="font-medium">#{index + 1}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {business.business_name}
                        </TableCell>
                        <TableCell>{renderStars(business.average_rating)}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{business.total_reviews}</Badge>
                        </TableCell>
                        <TableCell className="text-green-600">
                          {business.five_star_count}
                        </TableCell>
                        <TableCell className="text-red-600">
                          {business.one_star_count}
                        </TableCell>
                        <TableCell>
                          {business.flagged_reviews > 0 ? (
                            <Badge variant="destructive" className="gap-1">
                              <AlertTriangle className="h-3 w-3" />
                              {business.flagged_reviews}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {business.review_response_rate?.toFixed(0)}%
                        </TableCell>
                        <TableCell>{getRatingBadge(business.average_rating)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Poor Performers */}
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <TrendingDown className="h-5 w-5" />
              Poor Performers (Below 3.0 Rating)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Business Name</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Total Reviews</TableHead>
                    <TableHead>1 Star Reviews</TableHead>
                    <TableHead>Flagged Issues</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {businessRankings.filter(b => b.average_rating < 3).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No poor performers - great job! 🎉
                      </TableCell>
                    </TableRow>
                  ) : (
                    businessRankings
                      .filter(b => b.average_rating < 3)
                      .map((business) => (
                        <TableRow key={business.hairdresser_id}>
                          <TableCell className="font-medium">
                            {business.business_name}
                          </TableCell>
                          <TableCell>{renderStars(business.average_rating)}</TableCell>
                          <TableCell>{business.total_reviews}</TableCell>
                          <TableCell className="text-red-600">
                            {business.one_star_count}
                          </TableCell>
                          <TableCell>
                            {business.flagged_reviews > 0 ? (
                              <Badge variant="destructive">{business.flagged_reviews}</Badge>
                            ) : (
                              "None"
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="customers" className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Top Customer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {customerRankings[0]?.customer_name || "N/A"}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {customerRankings[0]?.completion_rate?.toFixed(0)}% completion rate
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{customerRankings.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                With bookings
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Problem Customers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {customerRankings.filter(c => c.no_show_count > 2 || c.completion_rate < 50).length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Multiple no-shows
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Customer Behavior Rankings</CardTitle>
            <CardDescription>
              Ranked by completion rate and engagement
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Rank</TableHead>
                    <TableHead>Customer Name</TableHead>
                    <TableHead>Total Bookings</TableHead>
                    <TableHead>Completed</TableHead>
                    <TableHead>Completion Rate</TableHead>
                    <TableHead>Reviews Given</TableHead>
                    <TableHead>Avg Rating</TableHead>
                    <TableHead>No-Shows</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customerRankings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        No customer rankings available yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    customerRankings.map((customer, index) => (
                      <TableRow key={customer.customer_id}>
                        <TableCell>
                          <span className="font-medium">#{index + 1}</span>
                        </TableCell>
                        <TableCell className="font-medium">
                          {customer.customer_name}
                        </TableCell>
                        <TableCell>{customer.total_bookings}</TableCell>
                        <TableCell className="text-green-600">
                          {customer.completed_bookings}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              customer.completion_rate >= 80
                                ? "default"
                                : customer.completion_rate >= 50
                                ? "secondary"
                                : "destructive"
                            }
                          >
                            {customer.completion_rate?.toFixed(0)}%
                          </Badge>
                        </TableCell>
                        <TableCell>{customer.total_reviews_given}</TableCell>
                        <TableCell>
                          {customer.average_rating_given ? (
                            <span className={getRatingColor(customer.average_rating_given)}>
                              {customer.average_rating_given.toFixed(1)}
                            </span>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                        <TableCell>
                          {customer.no_show_count > 0 ? (
                            <Badge variant="destructive">{customer.no_show_count}</Badge>
                          ) : (
                            <span className="text-muted-foreground">0</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {customer.completion_rate >= 80 ? (
                            <Badge className="bg-green-100 text-green-800">Excellent</Badge>
                          ) : customer.completion_rate >= 50 ? (
                            <Badge className="bg-yellow-100 text-yellow-800">Average</Badge>
                          ) : (
                            <Badge className="bg-red-100 text-red-800">Needs Review</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Problem Customers */}
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Problem Customers (Multiple No-Shows or Low Completion)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Total Bookings</TableHead>
                    <TableHead>Completion Rate</TableHead>
                    <TableHead>No-Shows</TableHead>
                    <TableHead>Cancellations</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customerRankings.filter(c => c.no_show_count > 2 || c.completion_rate < 50).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No problem customers - excellent! 🎉
                      </TableCell>
                    </TableRow>
                  ) : (
                    customerRankings
                      .filter(c => c.no_show_count > 2 || c.completion_rate < 50)
                      .map((customer) => (
                        <TableRow key={customer.customer_id}>
                          <TableCell className="font-medium">
                            {customer.customer_name}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {customer.email}
                          </TableCell>
                          <TableCell>{customer.total_bookings}</TableCell>
                          <TableCell>
                            <Badge variant="destructive">
                              {customer.completion_rate?.toFixed(0)}%
                            </Badge>
                          </TableCell>
                          <TableCell className="text-red-600 font-medium">
                            {customer.no_show_count}
                          </TableCell>
                          <TableCell className="text-orange-600">
                            {customer.cancelled_bookings}
                          </TableCell>
                        </TableRow>
                      ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
