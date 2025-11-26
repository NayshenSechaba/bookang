import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, CheckCircle, AlertCircle, Clock, TrendingUp } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface PaymentStats {
  totalBusinesses: number;
  configured: number;
  pending: number;
  percentageConfigured: number;
}

interface RecentChange {
  id: string;
  business_name: string;
  avatar_url: string | null;
  paystack_subaccount_code: string | null;
  verified_at: string | null;
  verified_by_name: string | null;
}

export const PaymentStatisticsWidget = () => {
  const [stats, setStats] = useState<PaymentStats>({
    totalBusinesses: 0,
    configured: 0,
    pending: 0,
    percentageConfigured: 0
  });
  const [recentChanges, setRecentChanges] = useState<RecentChange[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    setLoading(true);
    try {
      // Fetch all verified businesses
      const { data: businesses, error: businessError } = await supabase
        .from('profiles')
        .select('id, business_name, avatar_url')
        .eq('role', 'salon_owner')
        .eq('verification_status', 'approved');

      if (businessError) throw businessError;

      const totalBusinesses = businesses?.length || 0;

      // Fetch payment settings
      const { data: settings, error: settingsError } = await supabase
        .from('business_payment_settings')
        .select(`
          id,
          profile_id,
          paystack_subaccount_code,
          verified_at,
          profiles!business_payment_settings_profile_id_fkey(business_name, avatar_url),
          verified_by_profile:profiles!business_payment_settings_verified_by_fkey(full_name)
        `)
        .order('verified_at', { ascending: false })
        .limit(5);

      if (settingsError) throw settingsError;

      // Count configured businesses (those with subaccount codes)
      const configured = settings?.filter(s => s.paystack_subaccount_code)?.length || 0;
      const pending = totalBusinesses - configured;
      const percentageConfigured = totalBusinesses > 0 
        ? Math.round((configured / totalBusinesses) * 100) 
        : 0;

      setStats({
        totalBusinesses,
        configured,
        pending,
        percentageConfigured
      });

      // Format recent changes
      const formattedChanges: RecentChange[] = (settings || [])
        .filter(s => s.verified_at)
        .map(s => ({
          id: s.id,
          business_name: (s.profiles as any)?.business_name || 'Unknown',
          avatar_url: (s.profiles as any)?.avatar_url || null,
          paystack_subaccount_code: s.paystack_subaccount_code,
          verified_at: s.verified_at,
          verified_by_name: (s.verified_by_profile as any)?.full_name || 'Unknown'
        }));

      setRecentChanges(formattedChanges);
    } catch (error) {
      console.error('Error fetching payment statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Payment Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">Loading statistics...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Payment Configuration
        </CardTitle>
        <CardDescription>
          Paystack subaccount setup progress
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Businesses</span>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold">{stats.totalBusinesses}</div>
          </div>

          <div className="bg-green-500/10 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-green-700 dark:text-green-400">Configured</span>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-green-700 dark:text-green-400">
              {stats.configured}
            </div>
            <div className="text-xs text-muted-foreground">
              {stats.percentageConfigured}% of total
            </div>
          </div>

          <div className="bg-orange-500/10 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-orange-700 dark:text-orange-400">Pending Setup</span>
              <AlertCircle className="h-4 w-4 text-orange-600" />
            </div>
            <div className="text-2xl font-bold text-orange-700 dark:text-orange-400">
              {stats.pending}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Setup Progress</span>
            <span className="font-medium">{stats.percentageConfigured}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-green-600 transition-all duration-500"
              style={{ width: `${stats.percentageConfigured}%` }}
            />
          </div>
        </div>

        {/* Recent Changes */}
        {recentChanges.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Recent Changes
            </h4>
            <div className="space-y-2">
              {recentChanges.map((change) => (
                <div 
                  key={change.id} 
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={change.avatar_url || undefined} />
                      <AvatarFallback>
                        {change.business_name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">
                        {change.business_name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        by {change.verified_by_name}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {change.paystack_subaccount_code ? (
                      <Badge variant="default" className="text-xs">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Added
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs">
                        Updated
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {getTimeAgo(change.verified_at!)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};