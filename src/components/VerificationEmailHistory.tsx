import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Mail, CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

interface EmailLog {
  id: string;
  status: string;
  email_subject: string;
  email_body: string;
  sent_to: string;
  sent_at: string;
  success: boolean;
  error_message: string | null;
}

interface VerificationEmailHistoryProps {
  profileId: string;
}

export const VerificationEmailHistory = ({ profileId }: VerificationEmailHistoryProps) => {
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmailLogs();
  }, [profileId]);

  const fetchEmailLogs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('verification_email_logs')
        .select('*')
        .eq('profile_id', profileId)
        .order('sent_at', { ascending: false });

      if (error) throw error;

      setEmailLogs(data || []);
    } catch (error) {
      console.error('Error fetching email logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20';
      case 'rejected':
        return 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20';
      case 'in_review':
        return 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20';
      case 'pending':
        return 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20';
      default:
        return 'bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      case 'in_review':
        return <Clock className="h-4 w-4" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Mail className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-4">
            <Clock className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (emailLogs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Notification History
          </CardTitle>
          <CardDescription>
            No verification emails have been sent yet
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Email Notification History
        </CardTitle>
        <CardDescription>
          Track all verification status emails sent to this business
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {emailLogs.map((log, index) => (
              <div key={log.id}>
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        {log.success ? (
                          <Badge variant="outline" className="gap-1 bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20">
                            <CheckCircle2 className="h-3 w-3" />
                            Sent
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="gap-1 bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20">
                            <XCircle className="h-3 w-3" />
                            Failed
                          </Badge>
                        )}
                        <Badge variant="outline" className={`gap-1 ${getStatusColor(log.status)}`}>
                          {getStatusIcon(log.status)}
                          {log.status.replace('_', ' ').charAt(0).toUpperCase() + log.status.replace('_', ' ').slice(1)}
                        </Badge>
                      </div>
                      
                      <div>
                        <p className="font-medium text-sm">{log.email_subject}</p>
                        <p className="text-xs text-muted-foreground">To: {log.sent_to}</p>
                      </div>

                      {log.error_message && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded p-2">
                          <p className="text-xs text-red-700 dark:text-red-400">
                            <strong>Error:</strong> {log.error_message}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(log.sent_at), 'MMM d, yyyy')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(log.sent_at), 'h:mm a')}
                      </p>
                    </div>
                  </div>
                </div>
                
                {index < emailLogs.length - 1 && (
                  <Separator className="mt-4" />
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
