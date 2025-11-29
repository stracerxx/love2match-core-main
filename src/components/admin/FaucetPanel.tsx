import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import adminApi from '@/api/admin';
import { Coins, Zap, Users, Loader2 } from 'lucide-react';

const FaucetPanel = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState('');
  const [amount, setAmount] = useState('100');

  // Get all users for selection
  const { data: allUsers, isLoading: usersLoading } = useQuery({
    queryKey: ['admin', 'allUsers'],
    queryFn: adminApi.getAllUsers,
  });

  // Get faucet statistics
  const { data: faucetStats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin', 'faucetStats'],
    queryFn: adminApi.getFaucetStats,
  });

  // Distribute tokens mutation
  const distributeMutation = useMutation({
    mutationFn: ({ userId, amount }: { userId: string; amount: number }) =>
      adminApi.distributeTokens(userId, 'LOVE', amount, `Admin faucet distribution`),
    onSuccess: () => {
      toast({
        title: 'Tokens Distributed!',
        description: `${amount} LOVE tokens sent successfully.`,
      });
      setSelectedUser('');
      setAmount('100');
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['admin', 'allUsers'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'faucetStats'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Distribution Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleDistribute = () => {
    if (!selectedUser) {
      toast({
        title: 'Select a User',
        description: 'Please select a user to distribute tokens to.',
        variant: 'destructive',
      });
      return;
    }

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid positive number.',
        variant: 'destructive',
      });
      return;
    }

    distributeMutation.mutate({
      userId: selectedUser,
      amount: numAmount,
    });
  };

  const quickDistribute = (quickAmount: number) => {
    if (!selectedUser) {
      toast({
        title: 'Select a User',
        description: 'Please select a user first.',
        variant: 'destructive',
      });
      return;
    }
    setAmount(quickAmount.toString());
    distributeMutation.mutate({
      userId: selectedUser,
      amount: quickAmount,
    });
  };

  const isProcessing = distributeMutation.isPending;

  return (
    <Card className="shadow-card bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-yellow-500" />
          Token Faucet
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Faucet Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-4 rounded-lg bg-secondary/30">
            <div className="p-2 rounded-full bg-yellow-500/10">
              <Coins className="h-5 w-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">LOVE Distributed</p>
              <p className="text-xl font-bold text-foreground">
                {statsLoading ? '...' : faucetStats?.totalLOVEDistributed || 0}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-4 rounded-lg bg-secondary/30">
            <div className="p-2 rounded-full bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Distributions</p>
              <p className="text-xl font-bold text-foreground">
                {statsLoading ? '...' : faucetStats?.totalDistributions || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Distribution Form */}
        <div className="space-y-4">
          {/* User Selection */}
          <div className="space-y-2">
            <Label htmlFor="user-select">Select User</Label>
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
                    <SelectItem key={user.id} value={user.auth_user_id}>
                      <div className="flex items-center gap-2">
                        <span>{user.email}</span>
                        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="text-xs">
                          {user.role}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))
                ) : (
                  <div className="p-4 text-center text-muted-foreground">No users found</div>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="1"
              step="1"
            />
          </div>

          {/* Quick Distribution Buttons */}
          <div className="space-y-2">
            <Label>Quick Distribution</Label>
            <div className="flex flex-wrap gap-2">
              {[50, 100, 500, 1000].map((quickAmount) => (
                <Button
                  key={quickAmount}
                  variant="outline"
                  size="sm"
                  onClick={() => quickDistribute(quickAmount)}
                  disabled={isProcessing || !selectedUser}
                  className="border-yellow-500 text-yellow-500 hover:bg-yellow-500/10 hover:text-yellow-500"
                >
                  {quickAmount} LOVE
                </Button>
              ))}
            </div>
          </div>

          {/* Distribution Button */}
          <Button
            onClick={handleDistribute}
            disabled={isProcessing || !selectedUser || !amount}
            className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Distributing...
              </>
            ) : (
              <>
                <Zap className="mr-2 h-4 w-4" />
                Distribute {amount} LOVE Tokens
              </>
            )}
          </Button>
        </div>

        {/* Instructions */}
        <div className="p-4 bg-muted rounded-lg">
          <h4 className="font-medium text-sm mb-2">Faucet Instructions:</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Select a user from the dropdown list</li>
            <li>• Enter amount or use quick distribution buttons</li>
            <li>• Click "Distribute" to send LOVE tokens instantly</li>
            <li>• Transactions are recorded in the token transaction history</li>
            <li>• Note: Only LOVE tokens can be distributed via faucet</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default FaucetPanel;