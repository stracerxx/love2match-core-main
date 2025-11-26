import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { getUserProfile } from '@/lib/profiles';
import { Loader2 } from 'lucide-react';

export const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading: authLoading } = useAuth();

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['userProfile', user?.id],
    queryFn: () => getUserProfile(user!.id),
    enabled: !!user,
  });

  const isLoading = authLoading || profileLoading;

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || profile?.profile?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};