import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import walletApi from '@/api/wallet';
import { Trophy, Check } from 'lucide-react';

interface Challenge {
    id: string;
    title: string;
    description: string;
    reward: number;
    target: number;
    progress: number;
    completed: boolean;
}

const DAILY_CHALLENGES: Omit<Challenge, 'progress' | 'completed'>[] = [
    {
        id: 'send_likes',
        title: 'Spread the Love',
        description: 'Send 3 likes to other users',
        reward: 15,
        target: 3,
    },
    {
        id: 'start_conversations',
        title: 'Break the Ice',
        description: 'Start 2 new conversations',
        reward: 20,
        target: 2,
    },
    {
        id: 'update_profile',
        title: 'Profile Polish',
        description: 'Update your profile information',
        reward: 10,
        target: 1,
    },
    {
        id: 'send_gift',
        title: 'Generous Heart',
        description: 'Send a virtual gift to someone',
        reward: 25,
        target: 1,
    },
    {
        id: 'play_games',
        title: 'Game On',
        description: 'Play 3 different games',
        reward: 15,
        target: 3,
    },
];

export const DailyChallenge = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [challenges, setChallenges] = useState<Challenge[]>([]);
    const [totalEarned, setTotalEarned] = useState(0);

    useEffect(() => {
        loadChallenges();
    }, []);

    const loadChallenges = () => {
        const today = new Date().toDateString();
        const savedData = localStorage.getItem('dailyChallenges');

        if (savedData) {
            const { date, challenges: savedChallenges, earned } = JSON.parse(savedData);

            if (date === today) {
                setChallenges(savedChallenges);
                setTotalEarned(earned);
                return;
            }
        }

        // Reset for new day
        const newChallenges = DAILY_CHALLENGES.map(c => ({
            ...c,
            progress: 0,
            completed: false,
        }));

        setChallenges(newChallenges);
        setTotalEarned(0);
        saveChallenges(newChallenges, 0);
    };

    const saveChallenges = (updatedChallenges: Challenge[], earned: number) => {
        const today = new Date().toDateString();
        localStorage.setItem('dailyChallenges', JSON.stringify({
            date: today,
            challenges: updatedChallenges,
            earned,
        }));
    };

    const completeChallenge = async (challengeId: string) => {
        if (!user) return;

        const challenge = challenges.find(c => c.id === challengeId);
        if (!challenge || challenge.completed) return;

        const updatedChallenges = challenges.map(c => {
            if (c.id === challengeId) {
                return { ...c, progress: c.target, completed: true };
            }
            return c;
        });

        setChallenges(updatedChallenges);

        try {
            await walletApi.earnTokens(user.id, challenge.reward);
            const newTotal = totalEarned + challenge.reward;
            setTotalEarned(newTotal);
            saveChallenges(updatedChallenges, newTotal);

            toast({
                title: '✅ Challenge Complete!',
                description: `You earned ${challenge.reward} LOVE tokens!`,
            });
        } catch (error) {
            console.error('Failed to award tokens:', error);
        }
    };

    const allCompleted = challenges.every(c => c.completed);
    const completedCount = challenges.filter(c => c.completed).length;

    return (
        <Card className="shadow-card-hover">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-primary" />
                    Daily Challenges
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="bg-muted p-3 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium">Today's Progress</span>
                            <span className="text-sm text-muted-foreground">
                                {completedCount}/{challenges.length}
                            </span>
                        </div>
                        <Progress value={(completedCount / challenges.length) * 100} />
                        {totalEarned > 0 && (
                            <p className="text-xs text-muted-foreground mt-2">
                                Earned {totalEarned} tokens today
                            </p>
                        )}
                    </div>

                    {allCompleted && (
                        <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-lg text-center">
                            <div className="text-2xl mb-2">🎉</div>
                            <p className="font-semibold text-green-600 dark:text-green-400">
                                All challenges completed!
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Come back tomorrow for new challenges
                            </p>
                        </div>
                    )}

                    <div className="space-y-3">
                        {challenges.map((challenge) => (
                            <div
                                key={challenge.id}
                                className={`border rounded-lg p-4 ${challenge.completed ? 'bg-green-500/5 border-green-500/20' : 'bg-card'
                                    }`}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-semibold">{challenge.title}</h4>
                                            {challenge.completed && (
                                                <Check className="h-4 w-4 text-green-500" />
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground mb-2">
                                            {challenge.description}
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <Progress
                                                value={(challenge.progress / challenge.target) * 100}
                                                className="flex-1 h-2"
                                            />
                                            <span className="text-xs text-muted-foreground">
                                                {challenge.progress}/{challenge.target}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-lg font-bold text-primary">
                                            +{challenge.reward}
                                        </div>
                                        <div className="text-xs text-muted-foreground">tokens</div>
                                    </div>
                                </div>

                                {!challenge.completed && (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => completeChallenge(challenge.id)}
                                        disabled={!user}
                                        className="w-full mt-3"
                                    >
                                        Mark Complete (Demo)
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>

                    <p className="text-xs text-center text-muted-foreground">
                        Challenges reset daily at midnight
                    </p>
                </div>
            </CardContent>
        </Card>
    );
};
