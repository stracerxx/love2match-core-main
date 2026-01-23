import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import walletApi from '@/api/wallet';
import { Grid3x3 } from 'lucide-react';

const EMOJIS = ['❤️', '💕', '💖', '💗', '💝', '💘', '💓', '💞'];

interface CardType {
    id: number;
    emoji: string;
    isFlipped: boolean;
    isMatched: boolean;
}

export const MemoryMatch = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [cards, setCards] = useState<CardType[]>([]);
    const [flippedCards, setFlippedCards] = useState<number[]>([]);
    const [moves, setMoves] = useState(0);
    const [matches, setMatches] = useState(0);
    const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
    const [isChecking, setIsChecking] = useState(false);

    const initializeGame = () => {
        const shuffledEmojis = [...EMOJIS, ...EMOJIS]
            .sort(() => Math.random() - 0.5)
            .map((emoji, index) => ({
                id: index,
                emoji,
                isFlipped: false,
                isMatched: false,
            }));

        setCards(shuffledEmojis);
        setFlippedCards([]);
        setMoves(0);
        setMatches(0);
        setGameState('playing');
        setIsChecking(false);
    };

    const handleCardClick = (id: number) => {
        if (isChecking || flippedCards.length === 2 || cards[id].isFlipped || cards[id].isMatched) {
            return;
        }

        const newFlippedCards = [...flippedCards, id];
        setFlippedCards(newFlippedCards);

        const newCards = [...cards];
        newCards[id].isFlipped = true;
        setCards(newCards);

        if (newFlippedCards.length === 2) {
            setMoves(moves + 1);
            setIsChecking(true);

            const [first, second] = newFlippedCards;
            if (cards[first].emoji === cards[second].emoji) {
                // Match found!
                setTimeout(() => {
                    const updatedCards = [...cards];
                    updatedCards[first].isMatched = true;
                    updatedCards[second].isMatched = true;
                    setCards(updatedCards);
                    setMatches(matches + 1);
                    setFlippedCards([]);
                    setIsChecking(false);

                    // Check if game is complete
                    if (matches + 1 === EMOJIS.length) {
                        finishGame(moves + 1);
                    }
                }, 600);
            } else {
                // No match
                setTimeout(() => {
                    const updatedCards = [...cards];
                    updatedCards[first].isFlipped = false;
                    updatedCards[second].isFlipped = false;
                    setCards(updatedCards);
                    setFlippedCards([]);
                    setIsChecking(false);
                }, 1000);
            }
        }
    };

    const finishGame = async (finalMoves: number) => {
        setGameState('finished');

        let reward = 10;
        if (finalMoves < 20) reward = 30;
        else if (finalMoves <= 30) reward = 20;

        if (user) {
            try {
                await walletApi.earnTokens(user.id, reward);
                toast({
                    title: '🎉 Game Complete!',
                    description: `You completed the game in ${finalMoves} moves and earned ${reward} LOVE tokens!`,
                });
            } catch (error) {
                console.error('Failed to award tokens:', error);
            }
        }
    };

    return (
        <Card className="shadow-card-hover">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Grid3x3 className="h-5 w-5 text-primary" />
                    Memory Match
                </CardTitle>
            </CardHeader>
            <CardContent>
                {gameState === 'idle' && (
                    <div className="space-y-4">
                        <p className="text-muted-foreground">
                            Match all the emoji pairs! Earn tokens based on your performance:
                        </p>
                        <ul className="text-sm text-muted-foreground space-y-1">
                            <li>• &lt;20 moves: 30 tokens</li>
                            <li>• 20-30 moves: 20 tokens</li>
                            <li>• &gt;30 moves: 10 tokens</li>
                        </ul>
                        <Button onClick={initializeGame} disabled={!user} className="w-full">
                            Start Game
                        </Button>
                    </div>
                )}

                {gameState === 'playing' && (
                    <div className="space-y-4">
                        <div className="flex justify-between text-sm text-muted-foreground">
                            <span>Moves: {moves}</span>
                            <span>Matches: {matches}/{EMOJIS.length}</span>
                        </div>

                        <div className="grid grid-cols-4 gap-2">
                            {cards.map((card) => (
                                <button
                                    key={card.id}
                                    onClick={() => handleCardClick(card.id)}
                                    disabled={card.isMatched || card.isFlipped}
                                    className={`aspect-square rounded-lg text-3xl flex items-center justify-center transition-all ${card.isMatched
                                            ? 'bg-green-500/20 cursor-default'
                                            : card.isFlipped
                                                ? 'bg-primary/20'
                                                : 'bg-muted hover:bg-muted/70'
                                        }`}
                                >
                                    {card.isFlipped || card.isMatched ? card.emoji : '?'}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {gameState === 'finished' && (
                    <div className="space-y-4 text-center">
                        <div className="text-4xl">🎉</div>
                        <div>
                            <div className="text-2xl font-bold text-primary">Complete!</div>
                            <p className="text-muted-foreground">You finished in {moves} moves</p>
                        </div>
                        <Button onClick={initializeGame} className="w-full">
                            Play Again
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
