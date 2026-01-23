import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import walletApi from '@/api/wallet';
import { Coins, Gamepad2 } from 'lucide-react';
import { TriviaQuiz } from '@/components/games/TriviaQuiz';
import { MemoryMatch } from '@/components/games/MemoryMatch';
import { SpinWheel } from '@/components/games/SpinWheel';
import { IcebreakerGenerator } from '@/components/games/IcebreakerGenerator';
import { DailyChallenge } from '@/components/games/DailyChallenge';

const COIN_REWARD = 10;

const CoinFlip = () => {
  const { user } = useAuth();
  const [result, setResult] = useState<string | null>(null);
  const [isFlipping, setIsFlipping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [winCount, setWinCount] = useState(0);

  const handleFlip = async () => {
    setIsFlipping(true);
    setError(null);
    setResult(null);

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
    <Card className="shadow-card-hover">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coins className="h-5 w-5 text-primary" />
          Coin Flip
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-muted-foreground text-sm">
            Flip a coin. Win to earn {COIN_REWARD} LOVE tokens!
          </p>
          <Button onClick={handleFlip} disabled={isFlipping || !user} className="w-full">
            {isFlipping ? 'Flipping...' : 'Flip Coin'}
          </Button>
          {result && <div className="text-center font-bold text-lg">{result}</div>}
          {error && <div className="text-destructive text-sm">{error}</div>}
          {winCount > 0 && (
            <p className="text-xs text-center text-muted-foreground">
              Wins this session: {winCount}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const Games = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  if (!user) {
    return (
      <div className="min-h-screen p-6 md:ml-20 bg-background flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <Gamepad2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2">Sign in to Play</h2>
            <p className="text-muted-foreground">
              Sign in to access games and earn LOVE tokens!
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6 md:ml-20 bg-background">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2">
            Games & Challenges
          </h1>
          <p className="text-muted-foreground">
            Play games, complete challenges, and earn LOVE tokens!
          </p>
        </div>

        {/* Daily Challenge - Full Width */}
        <div className="w-full">
          <DailyChallenge />
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SpinWheel />
          <TriviaQuiz />
          <MemoryMatch />
          <IcebreakerGenerator />
          <CoinFlip />
        </div>

        {/* Info Card */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Gamepad2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-1">How to Earn Tokens</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Complete daily challenges for bonus rewards</li>
                  <li>• Spin the wheel once per day for prizes up to 200 tokens</li>
                  <li>• Test your knowledge with the trivia quiz</li>
                  <li>• Challenge your memory with the matching game</li>
                  <li>• Generate icebreakers to start conversations</li>
                  <li>• Try your luck with the coin flip</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Games;
