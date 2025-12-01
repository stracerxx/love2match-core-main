import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import adminApi from '@/api/admin';
import { Coins, Wallet, RefreshCw, TrendingUp, Shield, Loader2, Edit, X, Save } from 'lucide-react';
import { format } from 'date-fns';
import { useState, useEffect } from 'react';

const TreasuryPanel = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [feeValues, setFeeValues] = useState({
    swap_fee_percent: '',
    bridge_fee_fixed: '',
    withdrawal_fee_percent: ''
  });

  const { data: treasuryBalances, isLoading, error, refetch } = useQuery({
    queryKey: ['admin', 'treasury'],
    queryFn: adminApi.getTreasuryBalances,
  });

  const { data: feeConfig, isLoading: feeLoading } = useQuery({
    queryKey: ['admin', 'feeConfig'],
    queryFn: adminApi.getFeeConfig,
  });

  useEffect(() => {
    if (feeConfig && feeConfig.length > 0) {
      const newValues: any = {};
      feeConfig.forEach((item: any) => {
        newValues[item.key] = item.value;
      });
      setFeeValues({
        swap_fee_percent: newValues.swap_fee_percent || '1',
        bridge_fee_fixed: newValues.bridge_fee_fixed || '0.1',
        withdrawal_fee_percent: newValues.withdrawal_fee_percent || '0.5'
      });
    }
  }, [feeConfig]);

  const updateFeeMutation = useMutation({
    mutationFn: ({ key, value }: { key: string; value: string }) =>
      adminApi.updateFeeConfig(key, value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'feeConfig'] });
      toast({
        title: 'Success',
        description: 'Fee configuration updated.',
      });
      setIsEditModalOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  const adjustBalanceMutation = useMutation({
    mutationFn: ({ tokenType, amount, description }: { tokenType: string; amount: number; description?: string }) =>
      adminApi.adjustTreasuryBalance(tokenType, amount, description),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'treasury'] });
      toast({
        title: 'Success',
        description: 'Treasury balance adjusted.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  const handleRefresh = () => {
    refetch();
    toast({
      title: 'Refreshed',
      description: 'Treasury balances updated.',
    });
  };

  const handleEditFees = () => {
    setIsEditModalOpen(true);
  };

  const handleSaveFees = () => {
    Object.entries(feeValues).forEach(([key, value]) => {
      if (value.trim() !== '') {
        updateFeeMutation.mutate({ key, value });
      }
    });
  };

  const handleAdjustBalance = () => {
    // For simplicity, we'll just show a toast with instructions
    toast({
      title: 'Adjust Balances',
      description: 'Use the admin API to adjust treasury balances. This feature will be implemented soon.',
    });
  };

  const handleViewTransactions = () => {
    toast({
      title: 'View Transactions',
      description: 'Treasury transaction history will be displayed here soon.',
    });
  };

  const tokenColors: Record<string, string> = {
    LOVE: 'text-pink-500',
    LOVE2: 'text-cyan',
    SOL: 'text-purple-500',
  };

  const tokenIcons: Record<string, React.ReactNode> = {
    LOVE: <Coins className="h-5 w-5 text-pink-500" />,
    LOVE2: <TrendingUp className="h-5 w-5 text-cyan" />,
    SOL: <Wallet className="h-5 w-5 text-purple-500" />,
  };

  const tokenDescriptions: Record<string, string> = {
    LOVE: 'Platform LOVE token treasury',
    LOVE2: 'Platform LOVE2 token treasury (Solana-based)',
    SOL: 'Platform SOL treasury for gas fees',
  };

  const feeLabels: Record<string, string> = {
    swap_fee_percent: 'Swap Fee (%)',
    bridge_fee_fixed: 'Bridge Fee (LOVE2)',
    withdrawal_fee_percent: 'Withdrawal Fee (%)'
  };

  return (
    <Card className="shadow-card bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-gold" />
          Treasury Master Wallets
        </CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isLoading}
          className="border-gold text-gold hover:bg-gold/10 hover:text-gold"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Refresh
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Info Banner */}
        <div className="p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">
            Treasury wallets hold platform-owned tokens for fee collection, swaps, and gas subsidies.
            Balances are updated automatically when fees are collected or swaps are processed.
          </p>
        </div>

        {/* Treasury Balances */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {isLoading ? (
            <div className="col-span-3 flex justify-center items-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="col-span-3 p-4 rounded-lg bg-destructive/10 text-destructive text-center">
              <p className="font-medium">Failed to load treasury balances</p>
              <p className="text-sm">The treasury table may not be migrated yet.</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => refetch()}
              >
                Retry
              </Button>
            </div>
          ) : treasuryBalances && treasuryBalances.length > 0 ? (
            treasuryBalances.map((item: any) => (
              <div
                key={item.token_type}
                className="p-6 rounded-lg bg-secondary/30 border border-border"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-full ${tokenColors[item.token_type]}/10`}>
                      {tokenIcons[item.token_type]}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{item.token_type}</h3>
                      <p className="text-xs text-muted-foreground">
                        {tokenDescriptions[item.token_type]}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="border-gold text-gold">
                    Treasury
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-foreground">
                      {item.balance.toLocaleString()}
                    </span>
                    <span className="text-sm text-muted-foreground">{item.token_type}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Updated {format(new Date(item.updated_at), 'MMM d, yyyy HH:mm')}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 p-8 text-center">
              <div className="p-4 rounded-full bg-muted inline-flex mb-4">
                <Shield className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-medium text-lg">No Treasury Data</h3>
              <p className="text-muted-foreground text-sm mt-2">
                Treasury wallets have not been initialized. Run the treasury migration to create master wallets.
              </p>
            </div>
          )}
        </div>

        {/* Fee Configuration */}
        <div className="pt-4 border-t border-border">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-lg">Fee Configuration</h4>
            <Button
              variant="outline"
              size="sm"
              className="border-pink-500 text-pink-500 hover:bg-pink-500/10 hover:text-pink-500"
              onClick={handleEditFees}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Fees
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-secondary/30">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Swap Fee</span>
                <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500">
                  {feeLoading ? '...' : (feeValues.swap_fee_percent || '1')}%
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Percentage fee for LOVE to LOVE2 swaps
              </p>
            </div>
            <div className="p-4 rounded-lg bg-secondary/30">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Bridge Fee</span>
                <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500">
                  {feeLoading ? '...' : (feeValues.bridge_fee_fixed || '0.1')} LOVE2
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Fixed LOVE2 fee for bridging to Solana
              </p>
            </div>
            <div className="p-4 rounded-lg bg-secondary/30">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Withdrawal Fee</span>
                <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500">
                  {feeLoading ? '...' : (feeValues.withdrawal_fee_percent || '0.5')}%
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Percentage fee for LOVE2 withdrawals to external wallets
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 pt-4">
          <Button
            variant="outline"
            className="border-cyan text-cyan hover:bg-cyan/10 hover:text-cyan"
            onClick={handleAdjustBalance}
            disabled={adjustBalanceMutation.isPending}
          >
            {adjustBalanceMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            Adjust Balances
          </Button>
          <Button
            variant="outline"
            className="border-gold text-gold hover:bg-gold/10 hover:text-gold"
            onClick={handleViewTransactions}
          >
            View Transactions
          </Button>
          <Button
            variant="outline"
            className="border-pink-500 text-pink-500 hover:bg-pink-500/10 hover:text-pink-500"
            onClick={handleEditFees}
          >
            Edit Fees
          </Button>
        </div>
      </CardContent>

      {/* Edit Fees Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">Edit Fee Configuration</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditModalOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-4">
              {Object.entries(feeValues).map(([key, value]) => (
                <div key={key}>
                  <Label htmlFor={key}>{feeLabels[key]}</Label>
                  <Input
                    id={key}
                    value={value}
                    onChange={(e) =>
                      setFeeValues((prev) => ({ ...prev, [key]: e.target.value }))
                    }
                    placeholder="Enter value"
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setIsEditModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveFees}
                disabled={updateFeeMutation.isPending}
              >
                {updateFeeMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default TreasuryPanel;