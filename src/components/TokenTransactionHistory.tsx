import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { useToast } from './ui/use-toast';
import { useAuth } from '../hooks/useAuth';

interface TokenTransaction {
  id: string;
  user_email: string;
  transaction_type: 'earn' | 'spend' | 'swap' | 'transfer' | 'purchase' | 'refund';
  token_type: 'LOVE' | 'LOVE2';
  amount: number;
  balance_before: number;
  balance_after: number;
  description: string;
  related_entity_type?: string;
  related_entity_id?: string;
  solana_signature?: string;
  created_at: string;
}

interface TokenTransactionHistoryProps {
  showUserFilter?: boolean;
  onTransactionClick?: (transaction: TokenTransaction) => void;
  maxTransactions?: number;
}

export const TokenTransactionHistory: React.FC<TokenTransactionHistoryProps> = ({
  showUserFilter = false,
  onTransactionClick,
  maxTransactions = 100
}) => {
  const [transactions, setTransactions] = useState<TokenTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'earn' | 'spend' | 'swap'>('all');
  const [tokenType, setTokenType] = useState<'all' | 'LOVE' | 'LOVE2'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user?.email) {
      fetchTransactions();
    }
  }, [user?.email]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API call
      const mockTransactions: TokenTransaction[] = [
        {
          id: '1',
          user_email: user?.email || '',
          transaction_type: 'earn',
          token_type: 'LOVE',
          amount: 50,
          balance_before: 100,
          balance_after: 150,
          description: 'Profile completion bonus',
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          user_email: user?.email || '',
          transaction_type: 'spend',
          token_type: 'LOVE',
          amount: 25,
          balance_before: 150,
          balance_after: 125,
          description: 'Gift purchase - Virtual Rose',
          related_entity_type: 'Gift',
          related_entity_id: 'gift123',
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '3',
          user_email: user?.email || '',
          transaction_type: 'earn',
          token_type: 'LOVE',
          amount: 10,
          balance_before: 125,
          balance_after: 135,
          description: 'Daily login reward',
          created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '4',
          user_email: user?.email || '',
          transaction_type: 'purchase',
          token_type: 'LOVE',
          amount: 50,
          balance_before: 135,
          balance_after: 85,
          description: 'Premium content purchase',
          related_entity_type: 'Content',
          related_entity_id: 'content456',
          created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '5',
          user_email: user?.email || '',
          transaction_type: 'swap',
          token_type: 'LOVE2',
          amount: 100,
          balance_before: 0,
          balance_after: 100,
          description: 'Token swap from LOVE to LOVE2',
          solana_signature: '5J3b...8h2k',
          created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '6',
          user_email: user?.email || '',
          transaction_type: 'refund',
          token_type: 'LOVE',
          amount: 25,
          balance_before: 85,
          balance_after: 110,
          description: 'Gift refund - User not found',
          related_entity_type: 'GiftTransaction',
          related_entity_id: 'gift789',
          created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
      setTransactions(mockTransactions);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load transaction history',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'earn': return '💰';
      case 'spend': return '💸';
      case 'swap': return '🔄';
      case 'transfer': return '📤';
      case 'purchase': return '🛒';
      case 'refund': return '↩️';
      default: return '📊';
    }
  };

  const getTransactionColor = (type: string, amount: number) => {
    const isPositive = ['earn', 'refund'].includes(type) || amount > 0;
    
    if (isPositive) {
      return 'text-green-600';
    } else {
      return 'text-red-600';
    }
  };

  const getAmountPrefix = (type: string, amount: number) => {
    const isPositive = ['earn', 'refund'].includes(type) || amount > 0;
    return isPositive ? '+' : '-';
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const formatAmount = (amount: number) => {
    return Math.abs(amount).toLocaleString();
  };

  const filteredTransactions = transactions
    .filter(transaction => {
      const matchesType = filter === 'all' || transaction.transaction_type === filter;
      const matchesToken = tokenType === 'all' || transaction.token_type === tokenType;
      const matchesSearch = transaction.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesType && matchesToken && matchesSearch;
    })
    .slice(0, maxTransactions);

  const totalEarned = transactions
    .filter(t => ['earn', 'refund'].includes(t.transaction_type))
    .reduce((sum, t) => sum + t.amount, 0);

  const totalSpent = transactions
    .filter(t => ['spend', 'purchase'].includes(t.transaction_type))
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const currentBalance = transactions.length > 0 
    ? transactions[0].balance_after 
    : 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Current Balance</p>
                <p className="text-2xl font-bold text-green-600">{currentBalance} LOVE</p>
              </div>
              <div className="text-3xl">💰</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Earned</p>
                <p className="text-2xl font-bold text-green-600">+{totalEarned} LOVE</p>
              </div>
              <div className="text-3xl">📈</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Spent</p>
                <p className="text-2xl font-bold text-red-600">-{totalSpent} LOVE</p>
              </div>
              <div className="text-3xl">📉</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
              >
                All
              </Button>
              <Button
                variant={filter === 'earn' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('earn')}
              >
                Earn
              </Button>
              <Button
                variant={filter === 'spend' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('spend')}
              >
                Spend
              </Button>
              <Button
                variant={filter === 'swap' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('swap')}
              >
                Swap
              </Button>
            </div>

            <div className="flex gap-2">
              <Button
                variant={tokenType === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTokenType('all')}
              >
                All Tokens
              </Button>
              <Button
                variant={tokenType === 'LOVE' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTokenType('LOVE')}
              >
                LOVE
              </Button>
              <Button
                variant={tokenType === 'LOVE2' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTokenType('LOVE2')}
              >
                LOVE2
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions List */}
      <div className="space-y-3">
        {filteredTransactions.map(transaction => (
          <Card 
            key={transaction.id}
            className="cursor-pointer hover:shadow-md transition-all"
            onClick={() => onTransactionClick?.(transaction)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {/* Transaction Icon */}
                  <div className="text-2xl">
                    {getTransactionIcon(transaction.transaction_type)}
                  </div>

                  {/* Transaction Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium truncate">
                        {transaction.description}
                      </h3>
                      <Badge variant="secondary" className="text-xs capitalize">
                        {transaction.transaction_type}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {transaction.token_type}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{formatTimeAgo(transaction.created_at)}</span>
                      {transaction.related_entity_type && (
                        <span>• {transaction.related_entity_type}</span>
                      )}
                      {transaction.solana_signature && (
                        <span className="font-mono text-xs">
                          {transaction.solana_signature.slice(0, 8)}...
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Amount and Balance */}
                  <div className="text-right whitespace-nowrap">
                    <div className={`text-lg font-semibold ${getTransactionColor(transaction.transaction_type, transaction.amount)}`}>
                      {getAmountPrefix(transaction.transaction_type, transaction.amount)}
                      {formatAmount(transaction.amount)} {transaction.token_type}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Balance: {transaction.balance_after} {transaction.token_type}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredTransactions.length === 0 && !loading && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-4xl mb-4">💸</div>
            <h3 className="text-lg font-medium mb-2">No transactions found</h3>
            <p className="text-muted-foreground">
              {searchQuery || filter !== 'all' || tokenType !== 'all'
                ? "No transactions match your filters."
                : "You don't have any transactions yet."
              }
            </p>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-muted rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                  <div className="w-16 h-6 bg-muted rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};