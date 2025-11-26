import React from 'react';
import { ContentMarketplace } from '@/components/ContentMarketplace';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Store, Zap, TrendingUp, Users } from 'lucide-react';

const Content = () => {
  return (
    <div className="min-h-screen flex flex-col md:ml-20 bg-background">
      {/* Header */}
      <div className="gradient-hero h-32 md:h-40 relative">
        <div className="absolute inset-0 flex items-center justify-between p-4 md:p-8">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 md:h-20 md:w-20 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
              <Store className="h-8 w-8 md:h-10 md:w-10 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">Content Marketplace</h1>
              <p className="text-white/80 text-sm md:text-base">Discover premium content from creators</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
              <Zap className="w-3 h-3 mr-1" />
              Premium
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-8">
        <div className="mx-auto max-w-6xl space-y-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-0">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Store className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">100+</div>
                    <p className="text-sm text-purple-600">Content Items</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-0">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">50+</div>
                    <p className="text-sm text-blue-600">Creators</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-0">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">1.2K</div>
                    <p className="text-sm text-green-600">Purchases</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-0">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Zap className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-orange-600">85%</div>
                    <p className="text-sm text-orange-600">Satisfaction</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Content Marketplace Component */}
          <Card className="shadow-card animate-fade-in border-0">
            <CardHeader className="border-b border-border/50">
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5 text-primary" />
                Premium Content Marketplace
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ContentMarketplace />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Content;