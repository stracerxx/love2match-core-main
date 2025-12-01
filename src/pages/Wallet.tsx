import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import walletApi from '@/api/wallet';
import blockchainApi, { LOVE_TOKEN_MINT } from '@/api/blockchain';
import { format } from 'date-fns';
import { AlertCircle, Copy, CheckCircle, ArrowRightLeft, Loader2, Heart, Coins, Wallet as WalletIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ConversionHistory } from '@/components/wallet/ConversionHistory';

const Wallet = () => {
  const { user } = useAuth();
  const { publicKey, connected } = useWallet();
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState(false);
  const [onChainData, setOnChainData] = useState<{ solBalance: number; loveBalance: number } | null>(null);
  const { toast } = useToast();

  const { data: balances } = useQuery<{ love_balance: number; love2_balance: number; sol_balance?: number } | null>({
    queryKey: ['wallet', user?.id],
    queryFn: async () => {
      if (!user) return { love_balance: 0, love2_balance: 0 };
      return walletApi.getBalances(user.id);
    },
    enabled: !!user,
  });

  const { data: txs } = useQuery({
    queryKey: ['wallet', 'txs', user?.id],
    queryFn: async () => {
      if (!user) return [];
      return walletApi.listTransactions(user.id, 20);
    },
    enabled: !!user,
  });

  const earnMutation = useMutation<{ before: number; after: number }, Error, number>({
    mutationFn: (amt: number) => walletApi.earnTokens(user!.id, amt),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['wallet', user?.id] }),
  });

  const spendMutation = useMutation<{ before: number; after: number }, Error, number>({
    mutationFn: (amt: number) => walletApi.spendTokens(user!.id, amt),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['wallet', user?.id] }),
  });

  const exchangeMutation = useMutation<void, Error, { from: 'love'; to: 'love2'; amount: number }>({
    mutationFn: async (variables) => {
      if (!user) throw new Error('User not authenticated');
      return walletApi.exchangeTokens(user.id, variables.from, variables.to, variables.amount);
    },
    onSuccess: (_, variables) => {
      toast({
        title: 'Exchange Successful',
        description: `You have exchanged ${variables.amount} LOVE for ${variables.amount} LOVE2.`,
      });
      queryClient.invalidateQueries({ queryKey: ['wallet', user?.id] });
    },
    onError: (error) => {
      toast({ title: 'Exchange Failed', description: error.message, variant: 'destructive' });
    },
  });

  useEffect(() => {
    // refresh balances on mount
    if (user) queryClient.invalidateQueries({ queryKey: ['wallet', user?.id] });
  }, [user, queryClient]);

  useEffect(() => {
    // Fetch on-chain balances when wallet connects
    const fetchOnChainData = async () => {
      if (!connected || !publicKey) {
        setOnChainData(null);
        return;
      }

      try {
        const solBalance = await blockchainApi.getSolBalance(publicKey.toString());
        const loveBalance = await blockchainApi.getOnChainBalance(publicKey.toString());
        setOnChainData({ solBalance, loveBalance });
      } catch (error) {
        console.error('Failed to fetch on-chain data:', error);
        setOnChainData(null);
      }
    };

    fetchOnChainData();
  }, [connected, publicKey]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen p-6 md:ml-20 bg-background">
      <div className="max-w-3xl mx-auto space-y-6">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Three‑Wallet System</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* LOVE Wallet */}
             <div className="rounded-lg border border-pink-300 bg-gradient-to-br from-pink-50 to-pink-100 p-4">
               <div className="flex items-center justify-between mb-2">
                 <h3 className="text-lg font-bold text-pink-800 flex items-center gap-2">
                   <Heart className="h-10 w-10 text-primary fill-primary/30" />
                   <span>LOVE</span>
                 </h3>
                 <div className="h-8 w-8 rounded-full bg-pink-200 flex items-center justify-center border border-pink-300">
                   <span className="text-xs text-pink-700">icon</span>
                 </div>
               </div>
                <p className="text-3xl font-bold text-pink-900">{balances ? balances.love_balance.toFixed(2) : '0.00'}</p>
                <p className="text-sm text-pink-700 mt-1">In‑app tokens for likes, gifts, subscriptions</p>
                <div className="mt-4 flex gap-2">
                  <Button size="sm" onClick={() => earnMutation.mutate(10)} disabled={!user || earnMutation.status === 'pending'}>Earn</Button>
                  <Button size="sm" variant="outline" onClick={() => spendMutation.mutate(5)} disabled={!user || spendMutation.status === 'pending'}>Spend</Button>
                </div>
              </div>

              {/* LOVE2 Wallet */}
              <div className="rounded-lg border border-purple-300 bg-gradient-to-br from-purple-50 to-purple-100 p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-purple-800 flex items-center gap-2">
                    <Coins className="h-5 w-5" />
                    LOVE2
                  </h3>
                  <div className="h-8 w-8 rounded-full bg-purple-200 flex items-center justify-center border-2 border-purple-300">
                    <Coins className="h-4 w-4 text-purple-700" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-purple-900">{balances ? balances.love2_balance.toFixed(2) : '0.00'}</p>
                <p className="text-sm text-purple-700 mt-1">Solana‑based token for on‑chain transfers</p>
                <div className="mt-4 flex gap-2">
                  <ExchangeDialog balances={balances} />
                  <Button size="sm" variant="outline" disabled>Bridge</Button>
                </div>
              </div>

              {/* Solana Wallet */}
              <div className="rounded-lg border border-cyan-300 bg-gradient-to-br from-cyan-50 to-cyan-100 p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-cyan-800 flex items-center gap-2">
                    <WalletIcon className="h-5 w-5" />
                    Solana
                  </h3>
                  <div className="h-8 w-8 rounded-full bg-cyan-200 flex items-center justify-center border-2 border-cyan-300">
                    <WalletIcon className="h-4 w-4 text-cyan-700" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-cyan-900">
                  {onChainData ? onChainData.solBalance.toFixed(4) : '0.0000'} SOL
                </p>
                <p className="text-sm text-cyan-700 mt-1">Gas fees & on‑chain transactions</p>
                <div className="mt-4 flex gap-2">
                  <Button size="sm" variant="outline" disabled={!connected}>Deposit</Button>
                  <Button size="sm" variant="outline" disabled={!connected}>Withdraw</Button>
                </div>
              </div>
            </div>

            <div className="mt-6 text-xs text-muted-foreground">
              <p><strong>LOVE</strong> – In‑app currency for daily interactions. <strong>LOVE2</strong> – Bridgeable to Solana blockchain. <strong>Solana</strong> – Pays for gas and external transfers.</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {txs && txs.length === 0 && <p className="text-muted-foreground">No transactions yet</p>}
            <ul className="space-y-3">
              {txs && txs.map((t) => (
                <li key={t.id} className="rounded-md p-3 bg-secondary/10">
                  <div className="flex justify-between">
                    <div>
                      <div className="font-semibold">{t.token_type} — {t.type}</div>
                      <div className="text-sm text-muted-foreground">{t.description}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{t.amount}</div>
                      <div className="text-xs text-muted-foreground">{format(new Date(t.created_at), 'PP p')}</div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {user && <ConversionHistory userId={user.id} />}

        <Card className="shadow-card border-cyan-500/30">

          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>Solana Integration</span>
              {connected ? <span className="text-xs font-normal text-green-600">Connected</span> : <span className="text-xs font-normal text-muted-foreground">Connect Now</span>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Wallet Connection Button */}
              <div className="flex justify-center">
                <WalletMultiButton />
              </div>

              {/* On-Chain Balances (shown when connected) */}
              {connected && onChainData && (
                <div className="space-y-3 mt-4 pt-4 border-t border-border">
                  <h4 className="font-semibold text-sm">On-Chain Balances</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-md p-3 bg-secondary/30">
                      <p className="text-xs text-muted-foreground">SOL Balance</p>
                      <p className="text-lg font-bold">{onChainData.solBalance.toFixed(4)} SOL</p>
                    </div>
                    <div className="rounded-md p-3 bg-secondary/30">
                      <p className="text-xs text-muted-foreground">LOVE Balance</p>
                      <p className="text-lg font-bold">{onChainData.loveBalance.toFixed(2)} LOVE</p>
                    </div>
                  </div>

                  {/* Wallet Address */}
                  {publicKey && (
                    <div className="rounded-md p-3 bg-secondary/10 mt-4">
                      <p className="text-xs text-muted-foreground mb-2">Wallet Address</p>
                      <div className="flex items-center gap-2">
                        <code className="text-xs font-mono break-all">{publicKey.toString()}</code>
                        <button
                          onClick={() => copyToClipboard(publicKey.toString())}
                          className="ml-auto flex-shrink-0 p-1 hover:bg-secondary rounded transition-colors"
                        >
                          {copied ? <CheckCircle className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4 text-muted-foreground" />}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Bridge Controls (placeholder) */}
                  <div className="space-y-2 pt-4 border-t border-border">
                    <h4 className="font-semibold text-sm">Bridge Tokens</h4>
                    <Button disabled className="w-full">Bridge LOVE to Blockchain (Coming Soon)</Button>
                    <Button disabled variant="outline" className="w-full">Bridge LOVE from Blockchain (Coming Soon)</Button>
                  </div>
                </div>
              )}

              {/* Info section */}
              {!connected && (
                <div className="rounded-md p-3 bg-blue-500/10 border border-blue-500/20 flex gap-2">
                  <AlertCircle className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-700">
                    <p className="font-medium mb-1">Connect Solana Wallet</p>
                    <p>Click the button above to connect your Phantom or other Solana wallet to view on-chain balances and bridge tokens.</p>
                  </div>
                </div>
              )}

              <div className="text-xs text-muted-foreground space-y-1">
                <p><strong>LOVE Token Contract:</strong></p>
                <p className="font-mono">{LOVE_TOKEN_MINT}</p>
                <p className="mt-2"><strong>Network:</strong> Solana {import.meta.env.VITE_SOLANA_CLUSTER || 'mainnet-beta'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const ExchangeDialog = ({ balances }: { balances: { love_balance: number; love2_balance: number } | null }) => {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const EXCHANGE_RATE = 1; // 1 LOVE = 1 LOVE2

  const exchangeMutation = useMutation<void, Error, { from: 'love'; to: 'love2'; amount: number }>({
    mutationFn: async (variables) => {
      if (!user) throw new Error('User not authenticated');
      // Use existing exchangeTokens function
      return walletApi.exchangeTokens(user.id, variables.from, variables.to, variables.amount);
    },
    onSuccess: (_, variables) => {
      toast({
        title: 'Exchange Request Submitted',
        description: `Your request to exchange ${variables.amount} LOVE for ${variables.amount * EXCHANGE_RATE} LOVE2 is pending admin approval.`,
      });
      // Invalidate wallet and transactions to show the deducted LOVE and the new pending transaction.
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      setOpen(false);
      setAmount('');
    },
    onError: (error) => {
      toast({ title: 'Exchange Failed', description: error.message, variant: 'destructive' });
    },
  });

  const handleExchange = () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast({ title: 'Invalid Amount', description: 'Please enter a positive number.', variant: 'destructive' });
      return;
    }
    if (!balances || balances.love_balance < numAmount) {
      toast({ title: 'Insufficient Balance', description: 'You do not have enough LOVE tokens.', variant: 'destructive' });
      return;
    }
    exchangeMutation.mutate({ from: 'love', to: 'love2', amount: numAmount });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" disabled={!user}><ArrowRightLeft className="mr-2 h-4 w-4" /> Exchange</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Exchange LOVE for LOVE2</DialogTitle></DialogHeader>
        <DialogDescription>
          Current Rate: 1 LOVE = {EXCHANGE_RATE} LOVE2. All exchange requests are subject to admin approval and may take some time to process.
        </DialogDescription>
        <div className="space-y-4 py-4">
          <p>Your LOVE balance: <span className="font-bold">{balances?.love_balance.toFixed(2) ?? '0.00'}</span></p>
          <Label htmlFor="amount">Amount to Exchange</Label>
          <Input id="amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="e.g., 100" />
          <p className="text-sm text-muted-foreground">You will receive: {amount ? (parseFloat(amount) * EXCHANGE_RATE).toFixed(2) : '0.00'} LOVE2</p>
        </div>
        <DialogFooter>
          <Button onClick={handleExchange} disabled={exchangeMutation.isPending}>
            {exchangeMutation.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</> : 'Request Exchange'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default Wallet;
