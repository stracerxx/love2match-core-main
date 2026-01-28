/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Coins, Gift, Loader2, Sparkles } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

interface FaucetResult {
  success: boolean;
  amount?: number;
  new_balance?: number;
  error?: string;
  hours_remaining?: number;
  next_claim_at?: string;
}

/**
 * TokenFaucet Component
 * 
 * Allows users to claim free LOVE tokens daily.
 * This prevents users from getting stuck with "Insufficient tokens" errors.
 */
export const TokenFaucet = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [claiming, setClaiming] = useState(false);
  const [lastClaim, setLastClaim] = useState<Date | null>(null);

  const handleClaimTokens = async () => {
    if (!user) {
      toast({
        title: 'Not logged in',
        description: 'Please log in to claim tokens.',
        variant: 'destructive',
      });
      return;
    }

    setClaiming(true);

    try {
      // Call the claim_daily_faucet RPC function
      // Using type assertion to bypass strict typing (types not generated for custom RPCs)
      const { data, error } = await (supabase as any).rpc('claim_daily_faucet');

      if (error) {
        throw error;
      }

      const result = data as FaucetResult;

      if (result.success) {
        setLastClaim(new Date());
        toast({
          title: '🎉 Tokens Claimed!',
          description: `You received ${result.amount} LOVE tokens! New balance: ${result.new_balance}`,
        });

        // Invalidate wallet queries to refresh balance
        queryClient.invalidateQueries({ queryKey: ['wallet'] });
        queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      } else {
        // Handle rate limiting response
        let errorMessage = result.error || 'Unable to claim tokens. Please try again later.';
        if (result.hours_remaining !== undefined) {
          const hours = Math.floor(result.hours_remaining);
          const minutes = Math.round((result.hours_remaining - hours) * 60);
          errorMessage = `You can claim again in ${hours}h ${minutes}m`;
        }

        toast({
          title: 'Claim Failed',
          description: errorMessage,
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('Faucet claim error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to claim tokens. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setClaiming(false);
    }
  };

  // Check if user can claim (simple client-side check - server enforces actual limit)
  const canClaim = !lastClaim || (new Date().getTime() - lastClaim.getTime()) > 24 * 60 * 60 * 1000;

  return (
    <Card className="shadow-card border-primary/20 bg-gradient-to-br from-card to-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="h-5 w-5 text-primary" />
          Daily Token Faucet
        </CardTitle>
        <CardDescription>
          Claim free LOVE tokens every day to use for messaging and gifts!
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
            <div className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-primary" />
              <span className="font-medium">Daily Reward</span>
            </div>
            <span className="text-lg font-bold text-primary">50 LOVE</span>
          </div>

          <Button
            onClick={handleClaimTokens}
            disabled={claiming || !user}
            className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white font-semibold"
            size="lg"
          >
            {claiming ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Claiming...
              </>
            ) : (
              <>
                <Gift className="mr-2 h-5 w-5" />
                Claim Daily Tokens
              </>
            )}
          </Button>

          {lastClaim && (
            <p className="text-xs text-center text-muted-foreground">
              Last claimed: {lastClaim.toLocaleString()}
            </p>
          )}

          <div className="text-xs text-muted-foreground space-y-1">
            <p>💡 <strong>Tip:</strong> Use LOVE tokens to:</p>
            <ul className="list-disc list-inside ml-2 space-y-0.5">
              <li>Send first messages (10 LOVE)</li>
              <li>Send virtual gifts</li>
              <li>Unlock premium features</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TokenFaucet;
