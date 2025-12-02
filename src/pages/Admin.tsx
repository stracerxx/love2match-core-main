import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import adminApi from '@/api/admin';
import FaucetPanel from '@/components/admin/FaucetPanel';
import MembershipPanel from '@/components/admin/MembershipPanel';
// import TreasuryPanel from '@/components/admin/TreasuryPanel';
import { getMembershipBadge } from '@/lib/membership';
import { format } from 'date-fns';
import { Loader2, Check, X, Users, Coins, TrendingUp, BarChart3, Shield, UserCog, Zap, Crown, Star } from 'lucide-react';

interface ExchangeRequest {
  id: string;
  user_id: string;
  user_email: string; // Assuming the API provides this for convenience
  from_token: string;
  to_token: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

const Admin = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Platform analytics
  const { data: platformAnalytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['admin', 'analytics'],
    queryFn: adminApi.getPlatformAnalytics,
  });

  // User statistics
  const { data: userStats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin', 'userStats'],
    queryFn: adminApi.getUserStats,
  });

  // All users for management
  const { data: allUsers, isLoading: usersLoading } = useQuery({
    queryKey: ['admin', 'allUsers'],
    queryFn: adminApi.getAllUsers,
  });

  // Pending exchanges
  const { data: pendingExchanges, isLoading: exchangesLoading } = useQuery({
    queryKey: ['admin', 'pendingExchanges'],
    queryFn: adminApi.getPendingExchanges,
  });

  const approveMutation = useMutation({
    mutationFn: (requestId: string) => adminApi.approveExchange(requestId),
    onSuccess: () => {
      toast({ title: 'Success', description: 'Exchange approved.' });
      queryClient.invalidateQueries({ queryKey: ['admin', 'pendingExchanges'] });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (requestId: string) => adminApi.rejectExchange(requestId),
    onSuccess: () => {
      toast({ title: 'Success', description: 'Exchange rejected.' });
      queryClient.invalidateQueries({ queryKey: ['admin', 'pendingExchanges'] });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, newRole }: { userId: string; newRole: string }) =>
      adminApi.updateUserRole(userId, newRole),
    onSuccess: () => {
      toast({ title: 'Success', description: 'User role updated.' });
      queryClient.invalidateQueries({ queryKey: ['admin', 'allUsers'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'userStats'] });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const isProcessing = approveMutation.isPending || rejectMutation.isPending || updateRoleMutation.isPending;

  // Helper to get membership badge color
  const getMembershipColor = (tier: string) => {
    switch (tier) {
      case 'plus':
        return 'bg-blue-500/10 text-blue-500 border-blue-500';
      case 'premium':
        return 'bg-purple-500/10 text-purple-500 border-purple-500';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500';
    }
  };

  return (
    <div className="min-h-screen p-6 md:ml-20 bg-background">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-2">Manage platform users, tokens, and exchanges</p>
          </div>
          <div className="flex items-center gap-2 mt-4 md:mt-0">
            <Shield className="h-6 w-6 text-cyan" />
            <span className="text-sm font-medium text-cyan">Administrator Access</span>
          </div>
        </div>

        {/* Platform Analytics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="shadow-card bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold text-foreground">
                    {analyticsLoading ? '...' : platformAnalytics?.total_users || 0}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-primary/10">
                  <Users className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">LOVE Supply</p>
                  <p className="text-2xl font-bold text-foreground">
                    {analyticsLoading ? '...' : platformAnalytics?.total_love_supply || 0}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-cyan/10">
                  <Coins className="h-6 w-6 text-cyan" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">LOVE2 Supply</p>
                  <p className="text-2xl font-bold text-foreground">
                    {analyticsLoading ? '...' : platformAnalytics?.total_love2_supply || 0}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-gold/10">
                  <TrendingUp className="h-6 w-6 text-gold" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending Exchanges</p>
                  <p className="text-2xl font-bold text-foreground">
                    {analyticsLoading ? '...' : platformAnalytics?.pending_swap_requests || 0}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-primary/10">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Token Faucet & Membership */}
          <div className="lg:col-span-1 space-y-6">
            <FaucetPanel />
            <MembershipPanel />
            {/* <TreasuryPanel /> */}
          </div>

          {/* User Management & Pending Exchanges */}
          <div className="lg:col-span-2 space-y-6">
            {/* User Management */}
            <Card className="shadow-card bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCog className="h-5 w-5 text-primary" />
                User Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              {usersLoading ? (
                <div className="flex justify-center items-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : !allUsers || allUsers.length === 0 ? (
                <p className="text-muted-foreground text-center p-8">No users found.</p>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {allUsers.slice(0, 10).map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-foreground">{user.email}</span>
                          <Badge
                            className={user.role === 'admin' ? 'badge-cyan' : 'badge-gold'}
                          >
                            {user.role}
                          </Badge>
                          {user.membership_tier && user.membership_tier !== 'standard' && (
                            <Badge className={getMembershipColor(user.membership_tier)}>
                              {user.membership_tier === 'plus' ? (
                                <Star className="h-3 w-3 mr-1" />
                              ) : (
                                <Crown className="h-3 w-3 mr-1" />
                              )}
                              {user.membership_tier.charAt(0).toUpperCase() + user.membership_tier.slice(1)}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Joined {format(new Date(user.created_date), 'MMM d, yyyy')}
                          {user.membership_expires_at && (
                            <> • Expires {format(new Date(user.membership_expires_at), 'MMM d, yyyy')}</>
                          )}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-cyan text-cyan hover:bg-cyan/10 hover:text-cyan"
                          onClick={() => updateRoleMutation.mutate({ userId: user.auth_user_id, newRole: 'admin' })}
                          disabled={isProcessing || user.role === 'admin'}
                        >
                          Make Admin
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-gold text-gold hover:bg-gold/10 hover:text-gold"
                          onClick={() => updateRoleMutation.mutate({ userId: user.auth_user_id, newRole: 'member' })}
                          disabled={isProcessing || user.role === 'member'}
                        >
                          Make Member
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            </Card>

            {/* Pending Exchanges */}
            <Card className="shadow-card bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Coins className="h-5 w-5 text-primary" />
                Pending Token Exchanges
              </CardTitle>
            </CardHeader>
            <CardContent>
              {exchangesLoading ? (
                <div className="flex justify-center items-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : !pendingExchanges || pendingExchanges.length === 0 ? (
                <p className="text-muted-foreground text-center p-8">No pending exchange requests.</p>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {pendingExchanges.map((req) => (
                    <div key={req.id} className="p-4 rounded-lg bg-secondary/30">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <div className="font-medium text-foreground">{req.user_email}</div>
                          <div className="text-xs text-muted-foreground">{req.user_id}</div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {format(new Date(req.created_at), 'PP p')}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium text-foreground">
                          {req.amount} {req.from_token.toUpperCase()} → {req.to_token.toUpperCase()}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-green-500 text-green-500 hover:bg-green-500/10 hover:text-green-500"
                            onClick={() => approveMutation.mutate(req.id.toString())}
                            disabled={isProcessing}
                          >
                            <Check className="h-4 w-4 mr-2" /> Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => rejectMutation.mutate(req.id.toString())}
                            disabled={isProcessing}
                          >
                            <X className="h-4 w-4 mr-2" /> Reject
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;