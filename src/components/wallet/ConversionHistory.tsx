import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { Clock, CheckCircle, XCircle, ArrowRight } from 'lucide-react';

interface ConversionRequest {
  id: string;
  from_token: string;
  to_token: string;
  amount: number;
  status: string;
  requested_at: string;
  reviewed_at?: string;
  admin_notes?: string;
}

interface ConversionHistoryProps {
  userId: string;
}

export const ConversionHistory = ({ userId }: ConversionHistoryProps) => {
  const { data: requests, isLoading } = useQuery<ConversionRequest[]>({
    queryKey: ['conversion-requests', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('conversion_requests')
        .select('*')
        .eq('user_id', userId)
        .order('requested_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data || [];
    },
  });

  if (isLoading) {
    return (
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Conversion Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  if (!requests || requests.length === 0) {
    return (
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Conversion Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No conversion requests yet</p>
        </CardContent>
      </Card>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Pending</Badge>;
      case 'approved':
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle>Conversion Requests</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {requests.map((request) => (
            <div key={request.id} className="rounded-md p-4 bg-secondary/10 border border-border">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getStatusIcon(request.status)}
                  <span className="font-medium">
                    {request.amount} {request.from_token}
                  </span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">
                    {request.amount} {request.to_token}
                  </span>
                </div>
                {getStatusBadge(request.status)}
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                <div>Requested: {format(new Date(request.requested_at), 'PPp')}</div>
                {request.reviewed_at && (
                  <div>Reviewed: {format(new Date(request.reviewed_at), 'PPp')}</div>
                )}
                {request.admin_notes && (
                  <div className="mt-2 text-sm">
                    <span className="font-medium">Note:</span> {request.admin_notes}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
