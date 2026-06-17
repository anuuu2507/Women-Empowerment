import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import {
  Briefcase, HandHelping, User, Star, Wallet, MapPin,
  Settings, LogOut, Bell, History, Award, Sparkles
} from 'lucide-react';
import Navigation from '../components/Navigation';

const Dashboard = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user, logout } = useAuth();

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="glass-card rounded-3xl p-6 lg:p-8 gradient-peach">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div>
                <p className="text-muted-foreground mb-1">Welcome back,</p>
                <h1 className="font-display text-3xl lg:text-4xl font-bold text-foreground">
                  {user.name} 👋
                </h1>
                <p className="text-muted-foreground mt-2">Talent has no boundaries - only opportunities do</p>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">{user.credits}</p>
                  <p className="text-sm text-muted-foreground">{t('credits')}</p>
                </div>
                <div className="w-px h-12 bg-border" />
                <div className="text-center">
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 text-gold fill-gold" />
                    <span className="text-2xl font-bold text-foreground">{user.rating}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{user.reviewCount} {t('reviews')}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
        >
          <button
            onClick={() => navigate('/take-work')}
            className="group glass-card rounded-3xl p-8 text-left transition-all duration-300 hover:shadow-elevated hover:scale-[1.02] border-2 border-transparent hover:border-rose/30"
          >
            <div className="w-16 h-16 rounded-2xl bg-rose-light flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <HandHelping className="w-8 h-8 text-rose" />
            </div>
            <h2 className="font-display text-2xl font-bold text-foreground mb-2">
              {t('takeWork')}
            </h2>
            <p className="text-muted-foreground">
              Browse available tasks near you and earn from your skills
            </p>
          </button>

          <button
            onClick={() => navigate('/give-work')}
            className="group glass-card rounded-3xl p-8 text-left transition-all duration-300 hover:shadow-elevated hover:scale-[1.02] border-2 border-transparent hover:border-lavender/50"
          >
            <div className="w-16 h-16 rounded-2xl bg-lavender-light flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Briefcase className="w-8 h-8 text-accent-foreground" />
            </div>
            <h2 className="font-display text-2xl font-bold text-foreground mb-2">
              {t('giveWork')}
            </h2>
            <p className="text-muted-foreground">
              Post tasks and find skilled women in your area
            </p>
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-8 flex flex-col md:flex-row gap-4"
        >
          <Button
            className="flex-1 py-6 text-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200"
            variant="outline"
            onClick={() => navigate('/my-postings')}
          >
            <Briefcase className="w-5 h-5 mr-2" />
            Manage My Posted Jobs
          </Button>

          <Button
            className="flex-1 py-6 text-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
            variant="outline"
            onClick={() => navigate('/my-tasks')}
          >
            <Briefcase className="w-5 h-5 mr-2" />
            My Tasks (Worker)
          </Button>
        </motion.div>

        {/* Quick Actions Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <QuickAction
            icon={<User className="w-5 h-5" />}
            label={t('profile')}
            onClick={() => navigate('/profile')}
            color="rose"
          />
          <QuickAction
            icon={<Award className="w-5 h-5" />}
            label={t('skills')}
            onClick={() => navigate('/skills')}
            color="peach"
          />
          <QuickAction
            icon={<History className="w-5 h-5" />}
            label={t('history')}
            onClick={() => navigate('/history')}
            color="lavender"
          />
          <QuickAction
            icon={<MapPin className="w-5 h-5" />}
            label={t('nearMe')}
            onClick={() => navigate('/near-me')}
            color="sage"
          />
        </motion.div>

        {/* Recent Work History */}
        {user.workHistory.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-bold text-foreground">
                Recent Work
              </h2>
              <Button variant="ghost" onClick={() => navigate('/history')}>
                View All
              </Button>
            </div>

            <div className="space-y-3">
              {user.workHistory.slice(0, 3).map((work: any, index: number) => (
                <motion.div
                  key={work.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="glass-card rounded-2xl p-4 flex items-center gap-4"
                >
                  <div className="w-12 h-12 rounded-xl bg-rose-light flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-rose" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate">{work.title}</h3>
                    <p className="text-sm text-muted-foreground">{work.customerName} • {work.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">₹{work.amount}</p>
                    {work.rating && (
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="w-3 h-3 text-gold fill-gold" />
                        <span>{work.rating}</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
};

const QuickAction = ({
  icon,
  label,
  onClick,
  color
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  color: 'rose' | 'peach' | 'lavender' | 'sage';
}) => {
  const colorClasses = {
    rose: 'bg-rose-light hover:bg-rose/20',
    peach: 'bg-peach-light hover:bg-peach/40',
    lavender: 'bg-lavender-light hover:bg-lavender/30',
    sage: 'bg-sage/20 hover:bg-sage/30',
  };

  return (
    <button
      onClick={onClick}
      className={`${colorClasses[color]} rounded-2xl p-4 flex flex-col items-center gap-2 transition-all duration-300 hover:scale-105`}
    >
      <div className="text-foreground">{icon}</div>
      <span className="text-sm font-medium text-foreground">{label}</span>
    </button>
  );
};

export default Dashboard;
