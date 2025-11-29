import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { getUserProfile } from '@/lib/profiles';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Shield, User, AlertTriangle } from 'lucide-react';

const AdminTest = () => {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [debugInfo, setDebugInfo] = useState<any>({});

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['userProfile', user?.id],
    queryFn: () => getUserProfile(user!.id),
    enabled: !!user,
  });

  useEffect(() => {
    setDebugInfo({
      user: user ? {
        id: user.id,
        email: user.email,
        role: profile?.profile?.role,
        isAuthenticated: true
      } : null,
      authLoading,
      profileLoading,
      profileData: profile,
      timestamp: new Date().toISOString()
    });
  }, [user, authLoading, profileLoading, profile]);

  const copyDebugInfo = () => {
    navigator.clipboard.writeText(JSON.stringify(debugInfo, null, 2));
    toast({
      title: 'Debug info copied',
      description: 'Paste this in the console for troubleshooting',
    });
  };

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-background">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary">Admin Access Test</h1>
          <p className="text-muted-foreground mt-2">Debugging admin role detection</p>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="shadow-card bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Authentication</p>
                  <p className="text-2xl font-bold text-foreground">
                    {user ? '✅ Signed In' : '❌ Signed Out'}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-primary/10">
                  <User className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">User Role</p>
                  <p className="text-2xl font-bold text-foreground">
                    {profile?.profile?.role || 'Unknown'}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-cyan/10">
                  <Shield className="h-6 w-6 text-cyan" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Admin Access</p>
                  <p className="text-2xl font-bold text-foreground">
                    {profile?.profile?.role === 'admin' ? '✅ Granted' : '❌ Denied'}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-yellow-500/10">
                  <AlertTriangle className="h-6 w-6 text-yellow-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* User Info */}
        {user && (
          <Card className="shadow-card bg-card border-border">
            <CardHeader>
              <CardTitle>User Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Email:</span>
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">User ID:</span>
                  <span className="text-xs font-mono">{user.id}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Database Role:</span>
                  <Badge variant={profile?.profile?.role === 'admin' ? 'default' : 'secondary'}>
                    {profile?.profile?.role || 'Not found'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Membership Tier:</span>
                  <Badge variant="outline">
                    {profile?.profile?.membership_tier || 'Unknown'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Debug Info */}
        <Card className="shadow-card bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Debug Information</span>
              <Button onClick={copyDebugInfo} size="sm">
                Copy Debug Info
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-lg text-xs overflow-auto max-h-64">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4 justify-center">
          <Button 
            onClick={() => window.location.href = '/admin'}
            disabled={profile?.profile?.role !== 'admin'}
            className="bg-cyan hover:bg-cyan/90"
          >
            Try Admin Dashboard
          </Button>
          <Button 
            onClick={() => window.location.reload()}
            variant="outline"
          >
            Refresh Page
          </Button>
          <Button 
            onClick={() => window.location.href = '/'}
            variant="outline"
          >
            Go Home
          </Button>
        </div>

        {/* Instructions */}
        {profile?.profile?.role !== 'admin' && (
          <Card className="shadow-card bg-card border-border border-yellow-500/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-500">
                <AlertTriangle className="h-5 w-5" />
                Admin Access Required
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Your account does not have admin privileges. Your database role is: <strong>{profile?.profile?.role || 'Unknown'}</strong>
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Contact an administrator or run the restore-admin-role.js script to update your role.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminTest;