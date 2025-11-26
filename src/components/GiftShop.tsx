import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { useToast } from './ui/use-toast';
import { useAuth } from '../hooks/useAuth';

interface Gift {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  image_url: string;
  price_love: number;
  redemption_value: number;
  is_active: boolean;
}

interface GiftShopProps {
  onGiftSent?: (giftId: string, receiverEmail: string, message?: string) => void;
  receiverEmail?: string;
}

export const GiftShop: React.FC<GiftShopProps> = ({ onGiftSent, receiverEmail }) => {
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [selectedGift, setSelectedGift] = useState<Gift | null>(null);
  const [personalMessage, setPersonalMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const { user } = useAuth();
  const { toast } = useToast();

  const categories = ['all', 'flowers', 'candy', 'drinks', 'jewelry', 'romantic', 'fun', 'luxury'];

  useEffect(() => {
    fetchGifts();
  }, []);

  const fetchGifts = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API call
      const mockGifts: Gift[] = [
        {
          id: '1',
          name: 'Virtual Rose',
          description: 'Send a beautiful virtual rose',
          category: 'flowers',
          icon: '🌹',
          image_url: '/gifts/rose.png',
          price_love: 10,
          redemption_value: 5,
          is_active: true
        },
        {
          id: '2',
          name: 'Chocolate Box',
          description: 'Sweet virtual chocolates',
          category: 'candy',
          icon: '🍫',
          image_url: '/gifts/chocolate.png',
          price_love: 25,
          redemption_value: 15,
          is_active: true
        },
        {
          id: '3',
          name: 'Champagne',
          description: 'Celebrate with virtual champagne',
          category: 'drinks',
          icon: '🍾',
          image_url: '/gifts/champagne.png',
          price_love: 50,
          redemption_value: 30,
          is_active: true
        },
        {
          id: '4',
          name: 'Diamond Ring',
          description: 'Sparkling virtual diamond ring',
          category: 'jewelry',
          icon: '💍',
          image_url: '/gifts/diamond.png',
          price_love: 100,
          redemption_value: 60,
          is_active: true
        }
      ];
      setGifts(mockGifts);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load gifts',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredGifts = filter === 'all' 
    ? gifts 
    : gifts.filter(gift => gift.category === filter);

  const handleSendGift = async (gift: Gift) => {
    if (!user?.email) {
      toast({
        title: 'Error',
        description: 'You must be logged in to send gifts',
        variant: 'destructive'
      });
      return;
    }

    if (!receiverEmail) {
      toast({
        title: 'Error',
        description: 'No recipient selected',
        variant: 'destructive'
      });
      return;
    }

    try {
      setLoading(true);
      // Mock API call - replace with actual implementation
      console.log('Sending gift:', {
        giftId: gift.id,
        senderEmail: user.email,
        receiverEmail,
        message: personalMessage,
        tokensSpent: gift.price_love
      });

      toast({
        title: 'Gift Sent!',
        description: `You sent ${gift.name} to ${receiverEmail}`,
      });

      onGiftSent?.(gift.id, receiverEmail, personalMessage);
      setPersonalMessage('');
      setSelectedGift(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send gift',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map(category => (
          <Button
            key={category}
            variant={filter === category ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(category)}
            className="capitalize"
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Gifts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredGifts.map(gift => (
          <Card 
            key={gift.id} 
            className={`cursor-pointer transition-all hover:shadow-lg ${
              selectedGift?.id === gift.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => setSelectedGift(gift)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{gift.name}</CardTitle>
                <span className="text-2xl">{gift.icon}</span>
              </div>
              <Badge variant="secondary" className="capitalize">
                {gift.category}
              </Badge>
            </CardHeader>
            <CardContent className="pb-2">
              <p className="text-sm text-muted-foreground">{gift.description}</p>
              <div className="mt-2 flex items-center justify-between">
                <span className="font-semibold text-primary">{gift.price_love} LOVE</span>
                <span className="text-xs text-muted-foreground">
                  Redeem: {gift.redemption_value} LOVE
                </span>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedGift(gift);
                }}
                disabled={!gift.is_active}
              >
                {gift.is_active ? 'Select Gift' : 'Unavailable'}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Gift Sending Modal */}
      {selectedGift && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">{selectedGift.icon}</span>
                Send {selectedGift.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">To:</label>
                <Input 
                  value={receiverEmail || ''} 
                  disabled 
                  placeholder="Select a user to send gift to"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Personal Message (Optional):</label>
                <Input 
                  value={personalMessage}
                  onChange={(e) => setPersonalMessage(e.target.value)}
                  placeholder="Add a personal message..."
                />
              </div>
              <div className="bg-muted p-3 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span>Gift Price:</span>
                  <span className="font-semibold">{selectedGift.price_love} LOVE</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Redemption Value:</span>
                  <span>{selectedGift.redemption_value} LOVE</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setSelectedGift(null)}
              >
                Cancel
              </Button>
              <Button 
                className="flex-1"
                onClick={() => handleSendGift(selectedGift)}
                disabled={loading || !receiverEmail}
              >
                {loading ? 'Sending...' : 'Send Gift'}
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}

      {loading && gifts.length === 0 && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading gifts...</p>
        </div>
      )}
    </div>
  );
};