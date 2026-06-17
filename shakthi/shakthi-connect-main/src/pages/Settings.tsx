import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLanguage, languages } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { 
  Globe, Bell, Shield, Moon, HelpCircle, FileText, 
  LogOut, ChevronRight, Phone, Lock
} from 'lucide-react';
import Navigation from '@/components/Navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import TermsModal from '@/components/TermsModal';

const Settings = () => {
  const navigate = useNavigate();
  const { t, language, setLanguage } = useLanguage();
  const { logout } = useAuth();
  
  const [notifications, setNotifications] = useState(true);
  const [locationSharing, setLocationSharing] = useState(true);
  const [showTerms, setShowTerms] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.success('Logged out successfully');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-2xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="font-display text-3xl font-bold text-foreground mb-8">
            {t('settings')}
          </h1>

          <div className="space-y-4">
            {/* Language */}
            <div className="glass-card rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-light flex items-center justify-center">
                    <Globe className="w-5 h-5 text-rose" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Language</p>
                    <p className="text-sm text-muted-foreground">Choose your preferred language</p>
                  </div>
                </div>
                <Select value={language} onValueChange={(v: any) => setLanguage(v)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.native}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Notifications */}
            <div className="glass-card rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-peach-light flex items-center justify-center">
                    <Bell className="w-5 h-5 text-secondary-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive task alerts and updates</p>
                  </div>
                </div>
                <Switch
                  checked={notifications}
                  onCheckedChange={setNotifications}
                />
              </div>
            </div>

            {/* Location Sharing */}
            <div className="glass-card rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-lavender-light flex items-center justify-center">
                    <Shield className="w-5 h-5 text-accent-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Real-time Location</p>
                    <p className="text-sm text-muted-foreground">Share location during deliveries</p>
                  </div>
                </div>
                <Switch
                  checked={locationSharing}
                  onCheckedChange={setLocationSharing}
                />
              </div>
            </div>

            {/* Change Password */}
            <button className="glass-card rounded-2xl p-4 w-full text-left hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sage/20 flex items-center justify-center">
                    <Lock className="w-5 h-5 text-sage" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Change Password</p>
                    <p className="text-sm text-muted-foreground">Update your security credentials</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </div>
            </button>

            {/* Emergency Contact */}
            <button className="glass-card rounded-2xl p-4 w-full text-left hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-light flex items-center justify-center">
                    <Phone className="w-5 h-5 text-rose" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Emergency Contact</p>
                    <p className="text-sm text-muted-foreground">Set up safety contact</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </div>
            </button>

            {/* Terms & Conditions */}
            <button 
              className="glass-card rounded-2xl p-4 w-full text-left hover:bg-muted/50 transition-colors"
              onClick={() => setShowTerms(true)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                    <FileText className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{t('termsConditions')}</p>
                    <p className="text-sm text-muted-foreground">Read our terms and policies</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </div>
            </button>

            {/* Help & Support */}
            <button className="glass-card rounded-2xl p-4 w-full text-left hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                    <HelpCircle className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Help & Support</p>
                    <p className="text-sm text-muted-foreground">Get help with the app</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </div>
            </button>

            {/* Logout */}
            <Button
              variant="outline"
              className="w-full justify-start h-auto p-4 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5 mr-3" />
              <div className="text-left">
                <p className="font-medium">{t('logout')}</p>
                <p className="text-sm text-muted-foreground">Sign out of your account</p>
              </div>
            </Button>
          </div>
        </motion.div>
      </main>

      <TermsModal open={showTerms} onClose={() => setShowTerms(false)} />
    </div>
  );
};

export default Settings;
