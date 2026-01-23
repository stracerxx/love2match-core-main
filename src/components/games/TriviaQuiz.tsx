import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import walletApi from '@/api/wallet';
import { Brain, Check, X } from 'lucide-react';

const REWARD_PER_CORRECT = 5;

interface Question {
    question: string;
    options: string[];
    correctIndex: number;
}

const QUESTIONS: Question[] = [
    {
        question: "What percentage of couples meet online according to recent studies?",
        options: ["20%", "30%", "40%", "50%"],
        correctIndex: 2
    },
    {
        question: "What is considered the most important factor in a lasting relationship?",
        options: ["Physical attraction", "Communication", "Shared interests", "Financial stability"],
        correctIndex: 1
    },
    {
        question: "On average, how long do couples date before getting engaged?",
        options: ["6 months", "1 year", "2 years", "3 years"],
        correctIndex: 2
    },
    {
        question: "What is the most popular day for first dates?",
        options: ["Friday", "Saturday", "Sunday", "Wednesday"],
        correctIndex: 1
    },
    {
        question: "Which activity is scientifically proven to increase bonding between couples?",
        options: ["Watching movies", "Trying new experiences together", "Eating at restaurants", "Shopping"],
        correctIndex: 1
    },
    {
        question: "What percentage of people believe in love at first sight?",
        options: ["25%", "40%", "55%", "70%"],
        correctIndex: 2
    },
    {
        question: "How many dates does it typically take to know if there's chemistry?",
        options: ["1-2", "3-5", "6-8", "9-10"],
        correctIndex: 1
    },
    {
        question: "What is the average length of a first date?",
        options: ["30 minutes", "1 hour", "2 hours", "3 hours"],
        correctIndex: 2
    },
    {
        question: "Which sense is most important in initial attraction?",
        options: ["Sight", "Smell", "Touch", "Hearing"],
        correctIndex: 0
    },
    {
        question: "What is the best time to send a follow-up text after a first date?",
        options: ["Immediately", "Within 24 hours", "After 3 days", "After a week"],
        correctIndex: 1
    }
];

export const TriviaQuiz = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [score, setScore] = useState(0);
    const [answered, setAnswered] = useState(false);
    const [gameQuestions, setGameQuestions] = useState<Question[]>([]);

    const startGame = () => {
        // Select 5 random questions
        const shuffled = [...QUESTIONS].sort(() => Math.random() - 0.5);
        setGameQuestions(shuffled.slice(0, 5));
        setGameState('playing');
        setCurrentQuestionIndex(0);
        setScore(0);
        setSelectedAnswer(null);
        setAnswered(false);
    };

    const handleAnswer = async (index: number) => {
        if (answered) return;

        setSelectedAnswer(index);
        setAnswered(true);

        const isCorrect = index === gameQuestions[currentQuestionIndex].correctIndex;

        if (isCorrect) {
            setScore(score + 1);
            if (user) {
                try {
                    await walletApi.earnTokens(user.id, REWARD_PER_CORRECT);
                } catch (error) {
                    console.error('Failed to award tokens:', error);
                }
            }
        }

        // Move to next question after 1.5 seconds
        setTimeout(() => {
            if (currentQuestionIndex < gameQuestions.length - 1) {
                setCurrentQuestionIndex(currentQuestionIndex + 1);
                setSelectedAnswer(null);
                setAnswered(false);
            } else {
                setGameState('finished');
                toast({
                    title: '🎉 Quiz Complete!',
                    description: `You scored ${score + (isCorrect ? 1 : 0)}/5 and earned ${(score + (isCorrect ? 1 : 0)) * REWARD_PER_CORRECT} LOVE tokens!`,
                });
            }
        }, 1500);
    };

    const currentQuestion = gameQuestions[currentQuestionIndex];

    return (
        <Card className="shadow-card-hover">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-primary" />
                    Trivia Quiz
                </CardTitle>
            </CardHeader>
            <CardContent>
                {gameState === 'idle' && (
                    <div className="space-y-4">
                        <p className="text-muted-foreground">
                            Test your dating knowledge! Answer 5 questions and earn {REWARD_PER_CORRECT} LOVE tokens for each correct answer.
                        </p>
                        <Button onClick={startGame} disabled={!user} className="w-full">
                            Start Quiz
                        </Button>
                    </div>
                )}

                {gameState === 'playing' && currentQuestion && (
                    <div className="space-y-4">
                        <div className="flex justify-between text-sm text-muted-foreground">
                            <span>Question {currentQuestionIndex + 1}/5</span>
                            <span>Score: {score}</span>
                        </div>

                        <h3 className="text-lg font-semibold">{currentQuestion.question}</h3>

                        <div className="space-y-2">
                            {currentQuestion.options.map((option, index) => {
                                const isSelected = selectedAnswer === index;
                                const isCorrect = index === currentQuestion.correctIndex;
                                const showResult = answered;

                                return (
                                    <Button
                                        key={index}
                                        onClick={() => handleAnswer(index)}
                                        disabled={answered}
                                        variant={isSelected ? 'default' : 'outline'}
                                        className={`w-full justify-start ${showResult && isCorrect ? 'bg-green-500 hover:bg-green-600 text-white' :
                                                showResult && isSelected && !isCorrect ? 'bg-red-500 hover:bg-red-600 text-white' :
                                                    ''
                                            }`}
                                    >
                                        <span className="flex-1 text-left">{option}</span>
                                        {showResult && isCorrect && <Check className="h-4 w-4" />}
                                        {showResult && isSelected && !isCorrect && <X className="h-4 w-4" />}
                                    </Button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {gameState === 'finished' && (
                    <div className="space-y-4 text-center">
                        <div className="text-4xl font-bold text-primary">{score}/5</div>
                        <p className="text-muted-foreground">
                            You earned {score * REWARD_PER_CORRECT} LOVE tokens!
                        </p>
                        <Button onClick={startGame} className="w-full">
                            Play Again
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
