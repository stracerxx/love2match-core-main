/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useToast } from './ui/use-toast';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type NotificationType = Database['public']['Tables']['notifications']['Row'];

interface Notification {
  id: string;
  user_id: string;
  type: 'message' | 'match' | 'event_reminder' | 'event_rsvp' | 'like' | 'gift' | 'token' | 'system';
  title: string;
  body: string;
  action_url?: string | null;
  related_user_id?: string | null;
  related_entity_type?: string | null;
  related_entity_id?: string | null;
  is_read: boolean;
  read_at?: string | null;
  image_url?: string | null;
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
  const [profileId, setProfileId] = useState<number | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  // Get the profile ID (bigint) from the profiles table
  useEffect(() => {
    const getProfileId = async () => {
      if (!user?.id) return;

      const { data } = await supabase
        .from('profiles')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (data?.id) {
        setProfileId(data.id);
      }
    };

    getProfileId();
  }, [user?.id]);

  useEffect(() => {
    if (profileId) {
      fetchNotifications();

      // Set up real-time subscription for new notifications
      const channel = supabase
        .channel('notifications-changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${profileId}`
          },
          (payload) => {
            const newNotification = payload.new as Notification;
            setNotifications(prev => [newNotification, ...prev]);
            toast({
              title: newNotification.title,
              description: newNotification.body,
            });
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [profileId]);

  const fetchNotifications = async () => {
    if (!profileId) return;

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', profileId as any)
        .order('created_at', { ascending: false })
        .limit(maxNotifications);

      if (error) {
        // Table might not exist yet - show empty state gracefully
        if (error.code === '42P01') {
          console.warn('Notifications table does not exist. Run ADD_NOTIFICATIONS_TABLE.sql to create it.');
          setNotifications([]);
          return;
        }
        throw error;
      }

      setNotifications((data as Notification[]) || []);
    } catch (error: any) {
      console.error('Error fetching notifications:', error);
      // Don't show error toast for missing table or type mismatch
      if (error.code !== '42P01' && error.code !== '42883') {
        toast({
          title: 'Error',
          description: 'Failed to load notifications',
          variant: 'destructive'
        });
      }
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    if (!profileId) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('id', notificationId)
        .eq('user_id', profileId as any);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId
            ? { ...notif, is_read: true, read_at: new Date().toISOString() }
            : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast({
        title: 'Error',
        description: 'Failed to mark notification as read',
        variant: 'destructive'
      });
    }
  };

  const markAllAsRead = async () => {
    if (!profileId) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('user_id', profileId as any)
        .eq('is_read', false);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(notif => ({
          ...notif,
          is_read: true,
          read_at: notif.is_read ? notif.read_at : new Date().toISOString()
        }))
      );

      toast({
        title: 'Success',
        description: 'All notifications marked as read',
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast({
        title: 'Error',
        description: 'Failed to mark notifications as read',
        variant: 'destructive'
      });
    }
  };

  const deleteNotification = async (notificationId: string) => {
    if (!profileId) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', profileId as any);

      if (error) throw error;

      setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
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
            className={`cursor-pointer transition-all hover:shadow-md ${!notification.is_read ? 'border-l-4 border-l-primary' : ''
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
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-1">
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

/**
 * Helper function to create a notification (can be used from other components)
 */
export async function createNotification(
  userId: string,
  type: Notification['type'],
  title: string,
  body: string,
  options?: {
    action_url?: string;
    related_user_id?: string;
    related_entity_type?: string;
    related_entity_id?: string;
    image_url?: string;
  }
) {
  const { error } = await supabase
    .from('notifications')
    .insert({
      user_id: userId,
      type,
      title,
      body,
      action_url: options?.action_url,
      related_user_id: options?.related_user_id,
      related_entity_type: options?.related_entity_type,
      related_entity_id: options?.related_entity_id,
      image_url: options?.image_url,
    });

  if (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
}
