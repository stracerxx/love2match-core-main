import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import walletApi from '@/api/wallet';

const COIN_REWARD = 10;

const Games = () => {
  const { user } = useAuth();
  const [result, setResult] = useState<string | null>(null);
  const [isFlipping, setIsFlipping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [winCount, setWinCount] = useState(0);

  const handleFlip = async () => {
    setIsFlipping(true);
    setError(null);
    setResult(null);
    // Simulate coin flip
    setTimeout(async () => {
      const win = Math.random() < 0.5;
      setResult(win ? 'You win!' : 'You lose!');
      if (win && user) {
        try {
          await walletApi.earnTokens(user.id, COIN_REWARD);
          setWinCount((c) => c + 1);
        } catch (e: unknown) {
          setError('Failed to award tokens.');
        }
      }
      setIsFlipping(false);
    }, 700);
  };

  return (
    <div className="min-h-screen p-6 md:ml-20 bg-background">
      <div className="max-w-xl mx-auto space-y-6">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Coin Flip Game</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-2">Flip a coin. Win to earn {COIN_REWARD} LOVE tokens!</p>
            <Button onClick={handleFlip} disabled={isFlipping || !user} className="mb-2">{isFlipping ? 'Flipping...' : 'Flip Coin'}</Button>
            {result && <div className="mt-2 font-bold">{result}</div>}
            {error && <div className="mt-2 text-destructive">{error}</div>}
            <div className="mt-4 text-sm text-muted-foreground">Wins this session: {winCount}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Games;
