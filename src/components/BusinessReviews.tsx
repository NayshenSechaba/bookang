import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Star, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  customer_id: string;
  profiles: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

interface BusinessReviewsProps {
  hairdresserId: string;
  businessName: string;
}

export function BusinessReviews({ hairdresserId, businessName }: BusinessReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    },
  });

  useEffect(() => {
    fetchReviews();
  }, [hairdresserId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);

      // Fetch reviews with customer info
      const { data: reviewsData, error } = await supabase
        .from("reviews")
        .select(`
          id,
          rating,
          comment,
          created_at,
          customer_id,
          profiles:customer_id (
            full_name,
            avatar_url
          )
        `)
        .eq("hairdresser_id", hairdresserId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (reviewsData) {
        setReviews(reviewsData as Review[]);

        // Calculate statistics
        const totalReviews = reviewsData.length;
        const sumRatings = reviewsData.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = totalReviews > 0 ? sumRatings / totalReviews : 0;

        const distribution = {
          5: reviewsData.filter((r) => r.rating === 5).length,
          4: reviewsData.filter((r) => r.rating === 4).length,
          3: reviewsData.filter((r) => r.rating === 3).length,
          2: reviewsData.filter((r) => r.rating === 2).length,
          1: reviewsData.filter((r) => r.rating === 1).length,
        };

        setStats({
          averageRating,
          totalReviews,
          ratingDistribution: distribution,
        });
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  const renderRatingBar = (stars: number) => {
    const count = stats.ratingDistribution[stars as keyof typeof stats.ratingDistribution];
    const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;

    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 w-12">
          <span className="text-sm font-medium">{stars}</span>
          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
        </div>
        <Progress value={percentage} className="h-2 flex-1" />
        <span className="text-sm text-muted-foreground w-8 text-right">{count}</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="text-muted-foreground mt-2">Loading reviews...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Rating Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Reviews</CardTitle>
          <CardDescription>
            What customers are saying about {businessName}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {stats.totalReviews === 0 ? (
            <div className="text-center py-8">
              <Star className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <p className="text-muted-foreground">No reviews yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Be the first to review this business!
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-8">
              {/* Average Rating */}
              <div className="flex flex-col items-center justify-center border-r">
                <div className="text-5xl font-bold mb-2">
                  {stats.averageRating.toFixed(1)}
                </div>
                <div className="mb-2">{renderStars(Math.round(stats.averageRating))}</div>
                <p className="text-sm text-muted-foreground">
                  Based on {stats.totalReviews} {stats.totalReviews === 1 ? "review" : "reviews"}
                </p>
              </div>

              {/* Rating Distribution */}
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((stars) => (
                  <div key={stars}>{renderRatingBar(stars)}</div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Individual Reviews */}
      {reviews.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Recent Reviews</h3>
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  {/* Customer Avatar */}
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={review.profiles?.avatar_url || undefined} />
                    <AvatarFallback>
                      <User className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>

                  {/* Review Content */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">
                          {review.profiles?.full_name || "Anonymous Customer"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(review.created_at), "MMMM d, yyyy")}
                        </p>
                      </div>
                      <Badge
                        variant={
                          review.rating >= 4
                            ? "default"
                            : review.rating >= 3
                            ? "secondary"
                            : "destructive"
                        }
                        className="gap-1"
                      >
                        <Star className="h-3 w-3 fill-current" />
                        {review.rating}.0
                      </Badge>
                    </div>

                    {/* Star Rating */}
                    <div>{renderStars(review.rating)}</div>

                    {/* Comment */}
                    {review.comment && (
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {review.comment}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
