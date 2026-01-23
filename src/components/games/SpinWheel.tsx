import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import walletApi from '@/api/wallet';
import { Disc3 } from 'lucide-react';

const PRIZES = [5, 10, 15, 20, 25, 50, 100, 200];
const PRIZE_COLORS = [
    'bg-red-500',
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-orange-500',
    'bg-cyan-500',
];

export const SpinWheel = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [isSpinning, setIsSpinning] = useState(false);
    const [rotation, setRotation] = useState(0);
    const [canSpin, setCanSpin] = useState(true);
    const [prize, setPrize] = useState<number | null>(null);
    const [timeUntilNextSpin, setTimeUntilNextSpin] = useState<string>('');

    useEffect(() => {
        checkSpinAvailability();
        const interval = setInterval(checkSpinAvailability, 1000);
        return () => clearInterval(interval);
    }, []);

    const checkSpinAvailability = () => {
        const lastSpin = localStorage.getItem('lastSpinTime');
        if (!lastSpin) {
            setCanSpin(true);
            setTimeUntilNextSpin('');
            return;
        }

        const lastSpinDate = new Date(lastSpin);
        const now = new Date();
        const tomorrow = new Date(lastSpinDate);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);

        if (now >= tomorrow) {
            setCanSpin(true);
            setTimeUntilNextSpin('');
        } else {
            setCanSpin(false);
            const diff = tomorrow.getTime() - now.getTime();
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);
            setTimeUntilNextSpin(`${hours}h ${minutes}m ${seconds}s`);
        }
    };

    const spinWheel = async () => {
        if (!user || !canSpin || isSpinning) return;

        setIsSpinning(true);
        setPrize(null);

        // Random prize index
        const prizeIndex = Math.floor(Math.random() * PRIZES.length);
        const prizeValue = PRIZES[prizeIndex];

        // Calculate rotation (multiple full spins + landing position)
        const degreesPerSegment = 360 / PRIZES.length;
        const targetRotation = 360 * 5 + (prizeIndex * degreesPerSegment) + degreesPerSegment / 2;

        setRotation(rotation + targetRotation);

        // Wait for animation to complete
        setTimeout(async () => {
            setPrize(prizeValue);
            setIsSpinning(false);

            // Award tokens
            try {
                await walletApi.earnTokens(user.id, prizeValue);
                toast({
                    title: '🎉 You Won!',
                    description: `You earned ${prizeValue} LOVE tokens!`,
                });
            } catch (error) {
                console.error('Failed to award tokens:', error);
            }

            // Save spin time
            localStorage.setItem('lastSpinTime', new Date().toISOString());
            setCanSpin(false);
            checkSpinAvailability();
        }, 4000);
    };

    return (
        <Card className="shadow-card-hover">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Disc3 className="h-5 w-5 text-primary" />
                    Spin the Wheel
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <p className="text-muted-foreground text-sm">
                        Spin once per day for a chance to win 5-200 LOVE tokens!
                    </p>

                    {/* Wheel */}
                    <div className="relative w-64 h-64 mx-auto">
                        <div
                            className="absolute inset-0 rounded-full overflow-hidden transition-transform duration-[4000ms] ease-out"
                            style={{ transform: `rotate(${rotation}deg)` }}
                        >
                            {PRIZES.map((prizeValue, index) => {
                                const angle = (360 / PRIZES.length) * index;
                                return (
                                    <div
                                        key={index}
                                        className={`absolute w-full h-full ${PRIZE_COLORS[index]}`}
                                        style={{
                                            clipPath: `polygon(50% 50%, ${50 + 50 * Math.cos((angle - 90) * Math.PI / 180)}% ${50 + 50 * Math.sin((angle - 90) * Math.PI / 180)}%, ${50 + 50 * Math.cos((angle + 360 / PRIZES.length - 90) * Math.PI / 180)}% ${50 + 50 * Math.sin((angle + 360 / PRIZES.length - 90) * Math.PI / 180)}%)`,
                                        }}
                                    >
                                        <div
                                            className="absolute top-8 left-1/2 -translate-x-1/2 text-white font-bold text-lg"
                                            style={{
                                                transform: `rotate(${angle + 360 / PRIZES.length / 2}deg)`,
                                            }}
                                        >
                                            {prizeValue}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Center circle */}
                        <div className="absolute inset-0 m-auto w-16 h-16 bg-background rounded-full border-4 border-primary flex items-center justify-center">
                            <Disc3 className="h-8 w-8 text-primary" />
                        </div>

                        {/* Pointer */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2">
                            <div className="w-0 h-0 border-l-8 border-r-8 border-t-12 border-l-transparent border-r-transparent border-t-primary" />
                        </div>
                    </div>

                    {prize !== null && (
                        <div className="text-center">
                            <div className="text-3xl font-bold text-primary">{prize} Tokens!</div>
                        </div>
                    )}

                    <Button
                        onClick={spinWheel}
                        disabled={!user || !canSpin || isSpinning}
                        className="w-full"
                    >
                        {isSpinning ? 'Spinning...' : canSpin ? 'Spin Now!' : `Next spin in ${timeUntilNextSpin}`}
                    </Button>

                    {!canSpin && !isSpinning && (
                        <p className="text-xs text-center text-muted-foreground">
                            Come back tomorrow for another spin!
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
