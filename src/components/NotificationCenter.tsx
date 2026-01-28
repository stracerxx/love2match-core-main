import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useToast } from './ui/use-toast';
import { useAuth } from '../hooks/useAuth';

interface Notification {
  id: string;
  user_email: string;
  type: 'message' | 'match' | 'event_reminder' | 'event_rsvp' | 'like' | 'gift' | 'token' | 'system';
  title: string;
  body: string;
  action_url?: string;
  related_user_email?: string;
  related_entity_type?: string;
  related_entity_id?: string;
  is_read: boolean;
  read_at?: string;
  image_url?: string;
  created_at: string;
}

interface NotificationCenterProps {
  onNotificationClick?: (notification: Notification) => void;
  showUnreadOnly?: boolean;
  maxNotifications?: number;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  onNotificationClick,
  showUnreadOnly = false,
  maxNotifications = 50
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user?.email) {
      fetchNotifications();
    }
  }, [user?.email]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call to fetch notifications from database
      // For now, show empty state - notifications will be populated by real events
      // Example API call:
      // const { data, error } = await supabase
      //   .from('notifications')
      //   .select('*')
      //   .eq('user_email', user?.email)
      //   .order('created_at', { ascending: false })
      //   .limit(maxNotifications);
      
      // No mock data - show empty state until real notifications are available
      setNotifications([]);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load notifications',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, is_read: true, read_at: new Date().toISOString() }
            : notif
        )
      );

      // Mock API call
      console.log('Marking notification as read:', notificationId);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to mark notification as read',
        variant: 'destructive'
      });
    }
  };

  const markAllAsRead = async () => {
    try {
      setNotifications(prev => 
        prev.map(notif => ({
          ...notif,
          is_read: true,
          read_at: notif.is_read ? notif.read_at : new Date().toISOString()
        }))
      );

      // Mock API call
      console.log('Marking all notifications as read');
      
      toast({
        title: 'Success',
        description: 'All notifications marked as read',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to mark notifications as read',
        variant: 'destructive'
      });
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      setNotifications(prev => prev.filter(notif => notif.id !== notificationId));

      // Mock API call
      console.log('Deleting notification:', notificationId);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete notification',
        variant: 'destructive'
      });
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message': return '💬';
      case 'match': return '💕';
      case 'like': return '❤️';
      case 'gift': return '🎁';
      case 'event_reminder': return '📅';
      case 'event_rsvp': return '✅';
      case 'token': return '💰';
      case 'system': return '⚙️';
      default: return '🔔';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'match': return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'like': return 'bg-red-100 text-red-800 border-red-200';
      case 'gift': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'message': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'token': return 'bg-green-100 text-green-800 border-green-200';
      case 'event_reminder': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
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

  const filteredNotifications = notifications
    .filter(notif => filter === 'all' || !notif.is_read)
    .slice(0, maxNotifications);

  const unreadCount = notifications.filter(notif => !notif.is_read).length;

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
    onNotificationClick?.(notification);
  };

  return (
    <div className="space-y-4">
      {/* Header with Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold">Notifications</h2>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="px-2 py-1">
              {unreadCount} unread
            </Badge>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All
          </Button>
          <Button
            variant={filter === 'unread' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('unread')}
          >
            Unread
          </Button>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              Mark All Read
            </Button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredNotifications.map(notification => (
          <Card 
            key={notification.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              !notification.is_read ? 'border-l-4 border-l-primary' : ''
            }`}
            onClick={() => handleNotificationClick(notification)}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                {/* Notification Icon */}
                <div className={`text-2xl ${!notification.is_read ? 'animate-pulse' : ''}`}>
                  {getNotificationIcon(notification.type)}
                </div>

                {/* Notification Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className={`font-medium ${!notification.is_read ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {notification.title}
                    </h3>
                    <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                      {formatTimeAgo(notification.created_at)}
                    </span>
                  </div>
                  
                  <p className={`text-sm ${!notification.is_read ? 'text-foreground' : 'text-muted-foreground'} mb-2`}>
                    {notification.body}
                  </p>

                  {/* Notification Metadata */}
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="secondary" 
                      className={`text-xs capitalize ${getNotificationColor(notification.type)}`}
                    >
                      {notification.type.replace('_', ' ')}
                    </Badge>
                    
                    {notification.related_user_email && (
                      <span className="text-xs text-muted-foreground">
                        From: {notification.related_user_email}
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {!notification.is_read && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsRead(notification.id);
                      }}
                      className="h-8 w-8 p-0"
                    >
                      ✓
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notification.id);
                    }}
                    className="h-8 w-8 p-0 text-destructive"
                  >
                    ×
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredNotifications.length === 0 && !loading && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-4xl mb-4">🔔</div>
            <h3 className="text-lg font-medium mb-2">No notifications</h3>
            <p className="text-muted-foreground">
              {filter === 'unread' 
                ? "You're all caught up! No unread notifications."
                : "You don't have any notifications yet."
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
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-muted rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-full"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};