import React from 'react';
import { NotificationCenter } from '@/components/NotificationCenter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, Zap, MessageCircle, Heart } from 'lucide-react';

const Notifications = () => {
  return (
    <div className="min-h-screen flex flex-col md:ml-20 bg-background">
      {/* Header */}
      <div className="gradient-hero h-32 md:h-40 relative">
        <div className="absolute inset-0 flex items-center justify-between p-4 md:p-8">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 md:h-20 md:w-20 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
              <Bell className="h-8 w-8 md:h-10 md:w-10 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">Notifications</h1>
              <p className="text-white/80 text-sm md:text-base">Stay updated with your activity</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
              <Zap className="w-3 h-3 mr-1" />
              Live
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-8">
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-br from-pink-50 to-purple-50 border-0">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-pink-100 rounded-lg">
                    <Heart className="w-6 h-6 text-pink-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-pink-600">12</div>
                    <p className="text-sm text-pink-600">New Likes</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-0">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <MessageCircle className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">8</div>
                    <p className="text-sm text-blue-600">New Messages</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-0">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Bell className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">5</div>
                    <p className="text-sm text-green-600">System Alerts</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Notification Center Component */}
          <Card className="shadow-card animate-fade-in border-0">
            <CardHeader className="border-b border-border/50">
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                Notification Center
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <NotificationCenter />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Notifications;