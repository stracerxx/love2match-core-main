import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import adminApi from '@/api/admin';
import { Crown, Users, Star, Loader2, Calendar } from 'lucide-react';
import { format } from 'date-fns';

const MembershipPanel = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedTier, setSelectedTier] = useState<'standard' | 'plus' | 'premium'>('plus');

  // Get all users for selection
  const { data: allUsers, isLoading: usersLoading } = useQuery({
    queryKey: ['admin', 'allUsers'],
    queryFn: adminApi.getAllUsers,
  });

  // Get membership statistics
  const { data: membershipStats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin', 'membershipStats'],
    queryFn: adminApi.getMembershipStats,
  });

  // Update membership mutation
  const updateMembershipMutation = useMutation({
    mutationFn: ({ userId, tier }: { userId: string; tier: 'standard' | 'plus' | 'premium' }) =>
      adminApi.updateUserMembership(userId, tier),
    onSuccess: (data, variables) => {
      const tierName = variables.tier === 'plus' ? 'Plus' : variables.tier === 'premium' ? 'Premium' : 'Standard';
      toast({
        title: 'Membership Updated!',
        description: `User membership set to ${tierName} tier.`,
      });
      setSelectedUser('');
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['admin', 'allUsers'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'membershipStats'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Update Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleUpdateMembership = () => {
    if (!selectedUser) {
      toast({
        title: 'Select a User',
        description: 'Please select a user to update membership.',
        variant: 'destructive',
      });
      return;
    }

    updateMembershipMutation.mutate({
      userId: selectedUser,
      tier: selectedTier,
    });
  };

  const quickUpdate = (tier: 'standard' | 'plus' | 'premium') => {
    if (!selectedUser) {
      toast({
        title: 'Select a User',
        description: 'Please select a user first.',
        variant: 'destructive',
      });
      return;
    }
    setSelectedTier(tier);
    updateMembershipMutation.mutate({
      userId: selectedUser,
      tier,
    });
  };

  const isProcessing = updateMembershipMutation.isPending;

  const getTierBadge = (tier?: string) => {
    switch (tier) {
      case 'plus':
        return <Badge className="bg-blue-500 text-white">Plus</Badge>;
      case 'premium':
        return <Badge className="bg-purple-500 text-white">Premium</Badge>;
      default:
        return <Badge variant="outline">Standard</Badge>;
    }
  };

  return (
    <Card className="shadow-card bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-yellow-500" />
          Membership Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Membership Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-4 rounded-lg bg-secondary/30">
            <div className="p-2 rounded-full bg-gray-500/10">
              <Users className="h-5 w-5 text-gray-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Standard</p>
              <p className="text-xl font-bold text-foreground">
                {statsLoading ? '...' : membershipStats?.standardUsers || 0}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-4 rounded-lg bg-secondary/30">
            <div className="p-2 rounded-full bg-blue-500/10">
              <Star className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Plus</p>
              <p className="text-xl font-bold text-foreground">
                {statsLoading ? '...' : membershipStats?.plusUsers || 0}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-4 rounded-lg bg-secondary/30">
            <div className="p-2 rounded-full bg-purple-500/10">
              <Crown className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Premium</p>
              <p className="text-xl font-bold text-foreground">
                {statsLoading ? '...' : membershipStats?.premiumUsers || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Membership Update Form */}
        <div className="space-y-4">
          {/* User Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Select User</label>
            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a user..." />
              </SelectTrigger>
              <SelectContent>
                {usersLoading ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                ) : allUsers && allUsers.length > 0 ? (
                  allUsers.map((user) => (
                    <SelectItem key={user.auth_user_id} value={user.auth_user_id}>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span>{user.email}</span>
                          {getTierBadge(user.membership_tier)}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(user.created_date), 'MMM d, yyyy')}
                        </span>
                      </div>
                    </SelectItem>
                  ))
                ) : (
                  <div className="p-4 text-center text-muted-foreground">No users found</div>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Tier Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Membership Tier</label>
            <Select value={selectedTier} onValueChange={(value: 'standard' | 'plus' | 'premium') => setSelectedTier(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span>Standard</span>
                  </div>
                </SelectItem>
                <SelectItem value="plus">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-blue-500" />
                    <span>Plus</span>
                  </div>
                </SelectItem>
                <SelectItem value="premium">
                  <div className="flex items-center gap-2">
                    <Crown className="h-4 w-4 text-purple-500" />
                    <span>Premium</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Quick Update Buttons */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Quick Actions</label>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => quickUpdate('standard')}
                disabled={isProcessing || !selectedUser}
                className="border-gray-500 text-gray-500 hover:bg-gray-500/10 hover:text-gray-500"
              >
                Set Standard
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => quickUpdate('plus')}
                disabled={isProcessing || !selectedUser}
                className="border-blue-500 text-blue-500 hover:bg-blue-500/10 hover:text-blue-500"
              >
                Set Plus
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => quickUpdate('premium')}
                disabled={isProcessing || !selectedUser}
                className="border-purple-500 text-purple-500 hover:bg-purple-500/10 hover:text-purple-500"
              >
                Set Premium
              </Button>
            </div>
          </div>

          {/* Update Button */}
          <Button
            onClick={handleUpdateMembership}
            disabled={isProcessing || !selectedUser}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Crown className="mr-2 h-4 w-4" />
                Update to {selectedTier === 'plus' ? 'Plus' : selectedTier === 'premium' ? 'Premium' : 'Standard'}
              </>
            )}
          </Button>
        </div>

        {/* Instructions */}
        <div className="p-4 bg-muted rounded-lg">
          <h4 className="font-medium text-sm mb-2">Membership Instructions:</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• <strong>Standard</strong>: Basic free tier with limited features</li>
            <li>• <strong>Plus</strong>: Enhanced features and exclusive content access</li>
            <li>• <strong>Premium</strong>: Full access to all platform features</li>
            <li>• Select a user and choose their membership tier</li>
            <li>• Click "Update" to apply changes immediately</li>
            <li>• Memberships auto-expire after 30 days unless renewed</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default MembershipPanel;