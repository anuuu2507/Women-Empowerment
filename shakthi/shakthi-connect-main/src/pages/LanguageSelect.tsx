import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLanguage, languages } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

const LanguageSelect = () => {
  const navigate = useNavigate();
  const { setLanguage, t } = useLanguage();
  const { logout } = useAuth();

  const handleSelectLanguage = (code: typeof languages[number]['code']) => {
    setLanguage(code);
    logout(); // Clear any existing session to ensure we show Login page
    navigate('/login');
  };

  return (
    <div className="min-h-screen gradient-hero flex flex-col items-center justify-center p-6">
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-rose/20 rounded-full blur-3xl animate-float" />
        <div className="absolute top-40 right-20 w-40 h-40 bg-lavender/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-40 left-1/4 w-36 h-36 bg-peach/30 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 text-center mb-10"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        >
          <div className="flex flex-col items-center gap-6 mb-12">
            {/* Logo removed as requested */}

            <div className="text-center">
              <h2 className="text-xl font-medium text-rose-dark/80 mb-2">Women Empowerment Platform</h2>
              <h1 className="font-display text-4xl md:text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-purple-800">
                SheRise
              </h1>
              <p className="text-lg md:text-xl font-medium italic text-black mt-2 drop-shadow-sm animate-pulse-soft">
                of the women, for the women, by the women
              </p>
            </div>
          </div>
        </motion.div>

        <p className="text-muted-foreground text-lg max-w-md mx-auto mb-8">
          {t('selectLanguage')}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="relative z-10 w-full max-w-2xl"
      >
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {languages.map((lang, index) => (
            <motion.div
              key={lang.code}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 * index, duration: 0.3 }}
            >
              <Button
                variant="glass"
                onClick={() => handleSelectLanguage(lang.code)}
                className="w-full h-auto py-4 px-3 flex flex-col items-center gap-1 hover:bg-rose-light/50 hover:border-rose/30 transition-all duration-300"
              >
                <span className="text-lg font-semibold">{lang.native}</span>
                <span className="text-xs text-muted-foreground">{lang.name}</span>
              </Button>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="relative z-10 mt-12 text-sm text-muted-foreground text-center"
      >
        {t('womenOnly')}
      </motion.p>
    </div>
  );
};

export default LanguageSelect;
