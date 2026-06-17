import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Star, Clock, IndianRupee, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import Navigation from '@/components/Navigation';

const WorkHistory = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user } = useAuth();

  if (!user) {
    navigate('/login');
    return null;
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-sage" />;
      case 'in-progress':
        return <Loader2 className="w-5 h-5 text-gold animate-spin" />;
      case 'pending':
        return <AlertCircle className="w-5 h-5 text-muted-foreground" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-sage/20 text-sage';
      case 'in-progress':
        return 'bg-gold/20 text-gold';
      case 'pending':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">
            {t('history')}
          </h1>
          <p className="text-muted-foreground mb-8">
            View all your completed and ongoing work
          </p>

          {/* Stats Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="glass-card rounded-2xl p-4 text-center">
              <p className="text-2xl font-bold text-foreground">
                {user.workHistory.filter(w => w.status === 'completed').length}
              </p>
              <p className="text-sm text-muted-foreground">Completed</p>
            </div>
            <div className="glass-card rounded-2xl p-4 text-center">
              <p className="text-2xl font-bold text-foreground">
                {user.workHistory.filter(w => w.status === 'in-progress').length}
              </p>
              <p className="text-sm text-muted-foreground">In Progress</p>
            </div>
            <div className="glass-card rounded-2xl p-4 text-center">
              <p className="text-2xl font-bold text-foreground">
                ₹{user.workHistory.reduce((sum, w) => sum + (w.status === 'completed' ? w.amount : 0), 0)}
              </p>
              <p className="text-sm text-muted-foreground">Total Earned</p>
            </div>
            <div className="glass-card rounded-2xl p-4 text-center">
              <div className="flex items-center justify-center gap-1">
                <Star className="w-5 h-5 text-gold fill-gold" />
                <p className="text-2xl font-bold text-foreground">{user.rating}</p>
              </div>
              <p className="text-sm text-muted-foreground">Avg Rating</p>
            </div>
          </div>

          {/* Work History List */}
          {user.workHistory.length > 0 ? (
            <div className="space-y-4">
              {user.workHistory.map((work, index) => (
                <motion.div
                  key={work.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-card rounded-2xl p-5"
                >
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusIcon(work.status)}
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(work.status)}`}>
                          {work.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      </div>
                      
                      <h3 className="font-semibold text-lg text-foreground">{work.title}</h3>
                      <p className="text-muted-foreground text-sm mt-1">{work.description}</p>

                      <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {work.date}
                        </span>
                        <span>Customer: {work.customerName}</span>
                      </div>

                      {work.review && (
                        <div className="mt-3 p-3 bg-muted/50 rounded-xl">
                          <div className="flex items-center gap-1 mb-1">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`w-3 h-3 ${i < (work.rating || 0) ? 'text-gold fill-gold' : 'text-muted'}`} 
                              />
                            ))}
                          </div>
                          <p className="text-sm text-muted-foreground">"{work.review}"</p>
                        </div>
                      )}
                    </div>

                    <div className="text-right">
                      <div className="flex items-center gap-1 justify-end">
                        <IndianRupee className="w-5 h-5 text-foreground" />
                        <span className="text-2xl font-bold text-foreground">{work.amount}</span>
                      </div>
                      {work.rating && (
                        <div className="flex items-center gap-1 justify-end mt-1">
                          <Star className="w-4 h-4 text-gold fill-gold" />
                          <span className="font-medium">{work.rating}/5</span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-muted-foreground mb-4">No work history yet</p>
              <Button variant="feminine" onClick={() => navigate('/take-work')}>
                Find Work
              </Button>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default WorkHistory;
