import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Home, User, Settings, LogOut, Bell, Menu, X,
  Sparkles, Globe, Wallet, CheckCircle, Info, Briefcase, PlusCircle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);

  // Notification State
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = () => {
    if (!user) return;
    fetch(`/api/notifications?userId=${user.id}`)
      .then(res => res.json())
      .then(data => {
        // Handle both array and error response
        if (Array.isArray(data)) {
          setNotifications(data);
          setUnreadCount(data.filter((n: any) => !n.read).length);
        } else {
          console.error('Invalid notifications response:', data);
          setNotifications([]);
          setUnreadCount(0);
        }
      })
      .catch(err => {
        console.error('Error fetching notifications:', err);
        setNotifications([]);
        setUnreadCount(0);
      });
  };

  const markRead = (id: string) => {
    fetch(`/api/notifications/${id}/read`, { method: 'POST' })
      .then(res => {
        if (res.ok) fetchNotifications(); // Refresh
      })
      .catch(console.error);
  };

  const markAllAsRead = () => {
    if (!user) return;
    fetch('/api/notifications/mark-all-read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id })
    })
      .then(res => {
        if (res.ok) fetchNotifications();
      })
      .catch(console.error);
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', label: t('dashboard'), icon: Home },
    { path: '/settings', label: t('settings'), icon: Settings },
    { path: '/take-work', label: t('takeWork') || 'Take Work', icon: Briefcase },
    { path: '/give-work', label: t('giveWork') || 'Give Work', icon: PlusCircle },
  ];

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-2">
          <h1 className="font-display text-xl font-bold text-rose-dark">SheRise</h1>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${isActive
                  ? 'bg-rose-light text-rose-dark'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          {/* Credits */}
          {user && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-peach-light rounded-full">
              <Wallet className="w-4 h-4 text-foreground" />
              <span className="text-sm font-semibold text-foreground">₹{user.credits}</span>
            </div>
          )}

          {/* Notifications Popover */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative"
            onClick={() => setShowNotificationsModal(true)}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-background animate-pulse" />
            )}
          </Button>

          {/* Profile Dropdown - Desktop */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild className="hidden md:flex">
              <Button variant="ghost" className="gap-2">
                <div className="w-8 h-8 rounded-full bg-rose-light flex items-center justify-center">
                  <User className="w-4 h-4 text-rose" />
                </div>
                <span className="font-medium">{user?.name?.split(' ')[0]}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => navigate('/profile')}>
                <User className="w-4 h-4 mr-2" />
                {t('profile')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/settings')}>
                <Settings className="w-4 h-4 mr-2" />
                {t('settings')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/')}>
                <Globe className="w-4 h-4 mr-2" />
                Change Language
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                <LogOut className="w-4 h-4 mr-2" />
                {t('logout')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile Menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <div className="flex flex-col h-full">
                <div className="flex items-center gap-3 mb-8 pt-4">
                  <div className="w-12 h-12 rounded-full bg-rose-light flex items-center justify-center">
                    <User className="w-6 h-6 text-rose" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{user?.name}</p>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                  </div>
                </div>

                <nav className="flex-1 space-y-1">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${isActive
                          ? 'bg-rose-light text-rose-dark'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                          }`}
                      >
                        <Icon className="w-5 h-5" />
                        {item.label}
                      </Link>
                    );
                  })}

                  <Link
                    to="/"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    <Globe className="w-5 h-5" />
                    Change Language
                  </Link>
                </nav>

                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="mt-auto mb-4"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  {t('logout')}
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div >
      </div >

      {/* Notifications Modal Dialog */}
      <Dialog open={showNotificationsModal} onOpenChange={setShowNotificationsModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader className="border-b pb-4">
            <div className="flex items-center justify-between w-full">
              <DialogTitle className="text-2xl">All Notifications</DialogTitle>
              {unreadCount > 0 && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={markAllAsRead}
                >
                  Mark all as read
                </Button>
              )}
            </div>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-12 text-center">
                <Bell className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
                <p className="text-muted-foreground text-lg">No notifications yet</p>
                <p className="text-sm text-muted-foreground mt-2">
                  When workers request your tasks or customers accept your requests, you'll see them here
                </p>
              </div>
            ) : (
              <div className="space-y-2 p-4">
                {notifications.map(n => (
                  <div
                    key={n.id}
                    className={`p-4 rounded-lg border transition-all cursor-pointer hover:shadow-md ${
                      !n.read 
                        ? 'bg-rose-50/50 border-rose-200 shadow-sm' 
                        : 'bg-muted/30 border-border'
                    }`}
                    onClick={() => {
                      markRead(n.id);
                      if (n.type === 'request' && n.relatedId) {
                        setShowNotificationsModal(false);
                        navigate('/my-postings', { state: { openJobId: n.relatedId } });
                      } else if (n.type === 'message' && n.relatedId) {
                        setShowNotificationsModal(false);
                        navigate(`/chat/${n.relatedId}`);
                      }
                    }}
                  >
                    <div className="flex gap-4 items-start">
                      <div className={`mt-1 w-3 h-3 rounded-full flex-shrink-0 ${!n.read ? 'bg-rose-500' : 'bg-muted-foreground/30'}`} />
                      <div className="flex-1 min-w-0">
                        <p className={`${!n.read ? 'font-semibold text-foreground' : 'text-muted-foreground'} text-sm leading-relaxed`}>
                          {n.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2 flex items-center justify-between">
                          <span>{n.timestamp}</span>
                          {!n.read && (
                            <span className="inline-block px-2 py-0.5 bg-rose-500 text-white text-xs rounded-full">
                              New
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </header >
  );
};

export default Navigation;
