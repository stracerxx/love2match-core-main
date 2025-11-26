import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { getUserProfile } from '@/lib/profiles';

const AdminLogin = () => {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const { data: profileData } = useQuery({
    queryKey: ['userProfile', user?.id],
    queryFn: () => getUserProfile(user!.id),
    enabled: !!user,
  });

  const isAdmin = profileData?.profile?.role === 'admin';

  // If user is already an admin, redirect to admin dashboard
  if (isAdmin) {
    navigate('/admin');
    return null;
  }

  // Simple password-based admin authentication (fallback for development)
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Simple password check - you can change this password
      if (password === 'admin123') {
        toast({
          title: 'Admin Access Granted',
          description: 'Welcome to the admin dashboard.',
        });
        
        navigate('/admin');
      } else {
        toast({
          title: 'Access Denied',
          description: 'Invalid admin password.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to authenticate.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Admin Login</CardTitle>
          <CardDescription>
            {user ?
              "You don't have admin privileges. Contact an administrator to get access." :
              "Enter the admin password to access the dashboard"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {user ? (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Your current account ({user.email}) does not have admin privileges.
                  <br /><br />
                  To get admin access:
                  <br />
                  1. Contact an existing administrator
                  <br />
                  2. Ask them to update your role to 'admin' in the database
                  <br />
                  3. Refresh this page after the role change
                </p>
              </div>
              <Button
                onClick={() => navigate('/')}
                className="w-full"
              >
                Return to App
              </Button>
            </div>
          ) : (
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="Enter admin password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full"
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Authenticating...' : 'Access Admin Dashboard'}
              </Button>
            </form>
          )}
          
          {!user && (
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Default Password:</strong> admin123
                <br />
                <em>Change this password in the AdminLogin.tsx file for production.</em>
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;