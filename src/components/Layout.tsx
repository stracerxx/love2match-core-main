import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Compass, MessageCircle, User, Image, Calendar, Wallet, Settings, LogOut, Shield, Gift, Video, Crown, Store, GamepadIcon, Users, BarChart3, Bell, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { signOut } from '@/lib/auth';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { getUserProfile } from '@/lib/profiles';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

const navItems = [
  { id: 'discover', to: '/', icon: Compass, label: 'Discover' },
  { id: 'chat', to: '/messages', icon: MessageCircle, label: 'Chat' },
  { id: 'matches', to: '/matches', icon: Image, label: 'Matches' },
  { id: 'events', to: '/events', icon: Calendar, label: 'Events' },
  { id: 'games', to: '/games', icon: GamepadIcon, label: 'Games' },
  { id: 'wallet', to: '/wallet', icon: Wallet, label: 'Wallet' },
  { id: 'gifts', to: '/gifts', icon: Gift, label: 'Gifts' },
  { id: 'content', to: '/content', icon: Store, label: 'Content' },
  { id: 'notifications', to: '/notifications', icon: Bell, label: 'Notifications' },
  { id: 'profile', to: '/profile', icon: User, label: 'Profile' },
];

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const { data: profileData } = useQuery({
    queryKey: ['userProfile', user?.id],
    queryFn: () => getUserProfile(user!.id),
    enabled: !!user,
    retry: false,
  });
  const isAdmin = profileData && typeof profileData === 'object' && 'profile' in profileData
    ? (profileData as { profile?: { role?: string } })?.profile?.role === 'admin'
    : false;

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: 'Signed out',
      description: 'You have been signed out successfully.',
    });
    navigate('/auth');
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className="flex-1 pb-24 md:pb-0">{children}</main>
      
      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/50 bg-card/95 backdrop-blur-lg md:hidden">
        <div className="flex items-center justify-around px-2 py-3">
          {navItems.slice(0, isAdmin ? 5 : 6).map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.id}
                to={item.to}
                className={cn(
                  'flex flex-col items-center gap-0.5 px-2 py-1 transition-smooth',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
          
          {isAdmin && (
            <Link
              to="/admin"
              className={cn(
                'flex flex-col items-center gap-0.5 px-2 py-1 transition-smooth',
                location.pathname === '/admin' ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <Shield className="h-5 w-5" />
              <span className="text-xs font-medium">Admin</span>
            </Link>
          )}

          {/* Settings Menu on Mobile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex flex-col items-center gap-0.5 px-2 py-1 transition-smooth text-muted-foreground hover:text-foreground">
                <Settings className="h-5 w-5" />
                <span className="text-xs font-medium">More</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                <Link to="/profile" className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/wallet" className="cursor-pointer">
                  <Wallet className="mr-2 h-4 w-4" />
                  <span>Wallet</span>
                </Link>
              </DropdownMenuItem>
              {!isAdmin && (
                <DropdownMenuItem asChild>
                  <Link to="/admin-login" className="cursor-pointer">
                    <Shield className="mr-2 h-4 w-4" />
                    <span>Admin Access</span>
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-destructive cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>

      {/* Desktop Sidebar */}
      <nav className="hidden md:fixed md:left-0 md:top-0 md:flex md:h-screen md:w-20 md:flex-col md:items-center md:border-r md:border-border md:bg-card/95 md:py-8 md:backdrop-blur-lg">
        <div className="mb-8">
          <img
            src="/logo.png"
            alt="Love2Match Logo"
            className="h-8 w-8 object-contain"
          />
        </div>
        <div className="flex flex-col gap-6">
          {navItems.slice(0, 6).map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.id}
                to={item.to}
                className={cn(
                  'flex flex-col items-center gap-1 transition-smooth',
                  isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <item.icon className="h-6 w-6" />
              </Link>
            );
          })}
        </div>

        {/* Settings Menu on Desktop - Bottom of Sidebar */}
        <div className="mt-auto flex flex-col gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex flex-col items-center gap-1 transition-smooth text-muted-foreground hover:text-foreground p-2 rounded-lg hover:bg-white/5">
                <Settings className="h-6 w-6" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" align="end" className="w-48">
              <DropdownMenuItem asChild>
                <Link to="/profile" className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile & Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/wallet" className="cursor-pointer">
                  <Wallet className="mr-2 h-4 w-4" />
                  <span>Wallet</span>
                </Link>
              </DropdownMenuItem>
              {!isAdmin && (
                <DropdownMenuItem asChild>
                  <Link to="/admin-login" className="cursor-pointer">
                    <Shield className="mr-2 h-4 w-4" />
                    <span>Admin Access</span>
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-destructive cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {isAdmin && (
            <Link
              to="/admin"
              className={cn(
                'flex flex-col items-center gap-1 transition-smooth',
                location.pathname === '/admin' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Shield className="h-6 w-6" />
            </Link>
          )}
        </div>
      </nav>
    </div>
  );
};
