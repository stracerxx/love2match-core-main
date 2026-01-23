import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import walletApi from '@/api/wallet';
import { MessageCircle, Copy, RefreshCw } from 'lucide-react';

const REWARD_PER_GENERATION = 2;

const ICEBREAKERS = {
    fun: [
        "If you could have dinner with any fictional character, who would it be?",
        "What's the most spontaneous thing you've ever done?",
        "If you could instantly become an expert in something, what would it be?",
        "What's your go-to karaoke song?",
        "If you could live in any TV show universe, which would you choose?",
        "What's the weirdest food combination you actually enjoy?",
        "If you had a time machine, would you go to the past or future?",
        "What's your most embarrassing moment that you can laugh about now?",
        "If you could have any superpower for a day, what would it be?",
        "What's the best concert or live event you've ever been to?",
    ],
    deep: [
        "What's something you're passionate about that most people don't know?",
        "What life lesson did you learn the hard way?",
        "What does your perfect day look like?",
        "What's a belief you had as a child that you've since changed?",
        "What's the best advice you've ever received?",
        "What motivates you to get out of bed in the morning?",
        "If you could change one thing about the world, what would it be?",
        "What's something you're working on improving about yourself?",
        "What do you think is the key to a happy life?",
        "What's a fear you've overcome?",
    ],
    flirty: [
        "What's your idea of a perfect date?",
        "What's the most romantic thing someone has done for you?",
        "Do you believe in love at first sight?",
        "What's your love language?",
        "What's the most attractive quality in a person?",
        "What's your favorite way to be shown affection?",
        "What's something that always makes you smile?",
        "What's your idea of the perfect kiss?",
        "What's the sweetest compliment you've ever received?",
        "What makes you feel most connected to someone?",
    ],
    random: [
        "Coffee or tea?",
        "Beach vacation or mountain retreat?",
        "Early bird or night owl?",
        "Cats or dogs?",
        "Sweet or savory?",
        "Books or movies?",
        "Summer or winter?",
        "Texting or calling?",
        "Cooking at home or dining out?",
        "Adventure or relaxation?",
        "City life or countryside?",
        "Planned or spontaneous?",
    ],
};

type Category = keyof typeof ICEBREAKERS;

export const IcebreakerGenerator = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [category, setCategory] = useState<Category>('fun');
    const [currentIcebreaker, setCurrentIcebreaker] = useState<string>('');
    const [generationCount, setGenerationCount] = useState(0);

    const generateIcebreaker = async () => {
        const icebreakers = ICEBREAKERS[category];
        const randomIndex = Math.floor(Math.random() * icebreakers.length);
        setCurrentIcebreaker(icebreakers[randomIndex]);
        setGenerationCount(generationCount + 1);

        if (user) {
            try {
                await walletApi.earnTokens(user.id, REWARD_PER_GENERATION);
            } catch (error) {
                console.error('Failed to award tokens:', error);
            }
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(currentIcebreaker);
        toast({
            title: 'Copied!',
            description: 'Icebreaker copied to clipboard',
        });
    };

    return (
        <Card className="shadow-card-hover">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5 text-primary" />
                    Icebreaker Generator
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <p className="text-muted-foreground text-sm">
                        Generate conversation starters and earn {REWARD_PER_GENERATION} LOVE tokens each time!
                    </p>

                    {/* Category Selection */}
                    <div className="flex flex-wrap gap-2">
                        {(Object.keys(ICEBREAKERS) as Category[]).map((cat) => (
                            <Button
                                key={cat}
                                variant={category === cat ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setCategory(cat)}
                                className="capitalize"
                            >
                                {cat}
                            </Button>
                        ))}
                    </div>

                    {/* Generated Icebreaker */}
                    {currentIcebreaker && (
                        <div className="bg-muted p-4 rounded-lg space-y-3">
                            <p className="text-foreground font-medium">{currentIcebreaker}</p>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={copyToClipboard}
                                className="w-full"
                            >
                                <Copy className="h-4 w-4 mr-2" />
                                Copy to Clipboard
                            </Button>
                        </div>
                    )}

                    {/* Generate Button */}
                    <Button
                        onClick={generateIcebreaker}
                        disabled={!user}
                        className="w-full"
                    >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        {currentIcebreaker ? 'Generate Another' : 'Generate Icebreaker'}
                    </Button>

                    {generationCount > 0 && (
                        <p className="text-xs text-center text-muted-foreground">
                            Generated {generationCount} icebreaker{generationCount !== 1 ? 's' : ''} • Earned {generationCount * REWARD_PER_GENERATION} tokens
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
