import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { useToast } from './ui/use-toast';
import { useAuth } from '../hooks/useAuth';

interface Content {
  id: string;
  creator_email: string;
  title: string;
  description: string;
  content_type: 'image' | 'video';
  thumbnail_url: string;
  content_url: string;
  price_love: number;
  status: 'pending' | 'approved' | 'rejected' | 'paused' | 'deleted';
  total_sales: number;
  total_earnings: number;
  is_nsfw: boolean;
  creator_display_name?: string;
}

interface ContentMarketplaceProps {
  onContentPurchase?: (contentId: string) => void;
  showCreatorContent?: boolean;
}

export const ContentMarketplace: React.FC<ContentMarketplaceProps> = ({ 
  onContentPurchase, 
  showCreatorContent = false 
}) => {
  const [content, setContent] = useState<Content[]>([]);
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();
  const { toast } = useToast();

  const contentTypes = ['all', 'image', 'video'];
  const statuses = ['all', 'approved', 'pending'];

  useEffect(() => {
    fetchContent();
  }, [showCreatorContent]);

  const fetchContent = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API call
      const mockContent: Content[] = [
        {
          id: '1',
          creator_email: 'creator1@example.com',
          creator_display_name: 'Emma Creative',
          title: 'Sunset Photography Collection',
          description: 'Beautiful sunset photos from around the world',
          content_type: 'image',
          thumbnail_url: '/content/sunset-thumb.jpg',
          content_url: '/content/sunset-full.jpg',
          price_love: 25,
          status: 'approved',
          total_sales: 42,
          total_earnings: 1050,
          is_nsfw: false
        },
        {
          id: '2',
          creator_email: 'creator2@example.com',
          creator_display_name: 'Alex Visuals',
          title: 'Urban Exploration Video',
          description: 'Exploring abandoned places in 4K video',
          content_type: 'video',
          thumbnail_url: '/content/urban-thumb.jpg',
          content_url: '/content/urban-video.mp4',
          price_love: 50,
          status: 'approved',
          total_sales: 18,
          total_earnings: 900,
          is_nsfw: false
        },
        {
          id: '3',
          creator_email: 'creator3@example.com',
          creator_display_name: 'Sophia Art',
          title: 'Digital Art Portfolio',
          description: 'Collection of digital paintings and illustrations',
          content_type: 'image',
          thumbnail_url: '/content/art-thumb.jpg',
          content_url: '/content/art-collection.zip',
          price_love: 75,
          status: 'approved',
          total_sales: 31,
          total_earnings: 2325,
          is_nsfw: false
        }
      ];

      // Filter by creator if showCreatorContent is true
      const filteredContent = showCreatorContent && user?.email
        ? mockContent.filter(item => item.creator_email === user.email)
        : mockContent.filter(item => item.status === 'approved');

      setContent(filteredContent);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load content',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredContent = content.filter(item => {
    const matchesType = filter === 'all' || item.content_type === filter;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const handlePurchase = async (contentItem: Content) => {
    if (!user?.email) {
      toast({
        title: 'Error',
        description: 'You must be logged in to purchase content',
        variant: 'destructive'
      });
      return;
    }

    try {
      setLoading(true);
      // Mock API call - replace with actual implementation
      console.log('Purchasing content:', {
        contentId: contentItem.id,
        buyerEmail: user.email,
        price: contentItem.price_love
      });

      toast({
        title: 'Purchase Successful!',
        description: `You purchased "${contentItem.title}" for ${contentItem.price_love} LOVE`,
      });

      onContentPurchase?.(contentItem.id);
      setSelectedContent(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to purchase content',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'image': return '🖼️';
      case 'video': return '🎥';
      default: return '📄';
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Search content..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
        />
        <div className="flex gap-2">
          {contentTypes.map(type => (
            <Button
              key={type}
              variant={filter === type ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(type)}
              className="capitalize"
            >
              {type}
            </Button>
          ))}
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredContent.map(contentItem => (
          <Card 
            key={contentItem.id}
            className="group hover:shadow-lg transition-all cursor-pointer"
            onClick={() => setSelectedContent(contentItem)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg line-clamp-2">{contentItem.title}</CardTitle>
                <span className="text-xl">{getContentTypeIcon(contentItem.content_type)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={contentItem.content_type === 'image' ? 'secondary' : 'default'}>
                  {contentItem.content_type}
                </Badge>
                {contentItem.is_nsfw && (
                  <Badge variant="destructive">NSFW</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="pb-2">
              {/* Thumbnail */}
              <div className="aspect-video bg-muted rounded-lg mb-3 flex items-center justify-center">
                <span className="text-4xl">{getContentTypeIcon(contentItem.content_type)}</span>
              </div>
              
              <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                {contentItem.description}
              </p>
              
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{contentItem.creator_display_name}</span>
                <span className="text-primary font-semibold">{contentItem.price_love} LOVE</span>
              </div>
              
              {!showCreatorContent && (
                <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                  <span>{contentItem.total_sales} sales</span>
                  <span>{contentItem.total_earnings} LOVE earned</span>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedContent(contentItem);
                }}
              >
                {showCreatorContent ? 'View Details' : 'Purchase'}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Content Detail Modal */}
      {selectedContent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getContentTypeIcon(selectedContent.content_type)}
                {selectedContent.title}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant={selectedContent.content_type === 'image' ? 'secondary' : 'default'}>
                  {selectedContent.content_type}
                </Badge>
                {selectedContent.is_nsfw && (
                  <Badge variant="destructive">NSFW</Badge>
                )}
                <span className="text-sm text-muted-foreground">
                  by {selectedContent.creator_display_name}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Content Preview */}
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                <span className="text-6xl">{getContentTypeIcon(selectedContent.content_type)}</span>
              </div>
              
              <p className="text-muted-foreground">{selectedContent.description}</p>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>Price:</span>
                    <span className="font-semibold text-primary">{selectedContent.price_love} LOVE</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Type:</span>
                    <span className="capitalize">{selectedContent.content_type}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>Total Sales:</span>
                    <span>{selectedContent.total_sales}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Creator Earnings:</span>
                    <span>{selectedContent.total_earnings} LOVE</span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setSelectedContent(null)}
              >
                Close
              </Button>
              {!showCreatorContent && (
                <Button 
                  className="flex-1"
                  onClick={() => handlePurchase(selectedContent)}
                  disabled={loading}
                >
                  {loading ? 'Processing...' : `Purchase for ${selectedContent.price_love} LOVE`}
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
      )}

      {loading && content.length === 0 && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading content...</p>
        </div>
      )}

      {filteredContent.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No content found</p>
        </div>
      )}
    </div>
  );
};