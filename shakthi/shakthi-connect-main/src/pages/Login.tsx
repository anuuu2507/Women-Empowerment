import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Checkbox } from '../components/ui/checkbox';
import { toast } from 'sonner';
import {
  User, Mail, Phone, MapPin, CreditCard, Lock, Eye, EyeOff,
  Shield, CheckCircle2, ArrowRight, Sparkles, Globe
} from 'lucide-react';
import TermsModal from '../components/TermsModal';

const Login = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    password: '',
    otp: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendOtp = async () => {
    if (!formData.phone) {
      toast.error('Please enter phone number');
      return;
    }
    setIsLoading(true);
    // Simulating OTP send for requested bypass
    setTimeout(() => {
      setOtpSent(true);
      toast.success('OTP sent! (Use 123456)');
      setIsLoading(false);
    }, 500);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // If OTP flow
    if (formData.phone && formData.otp) {
      try {
        const loginRes = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: formData.phone })
        });
        const data = await loginRes.json();

        if (data.success && data.user) {
          localStorage.setItem('feminine-shakthi-user', JSON.stringify(data.user));
          toast.success('Welcome back!');
          window.location.href = '/dashboard';
          return;
        } else {
          // Account not found
          toast.error('Account not found. Please register first.');
          setTimeout(() => {
            navigate('/register');
          }, 2000);
          setIsLoading(false);
          return;
        }
      } catch (e) {
        console.error('Login error:', e);
        toast.error('Account not found. Please register first.');
        setTimeout(() => {
          navigate('/register');
        }, 2000);
        setIsLoading(false);
        return;
      }
    } else if (formData.email && formData.password) {
      // Email/Password flow
      const success = await login(formData.email, formData.password);
      if (success) {
        toast.success('Welcome back!');
        navigate('/dashboard');
      } else {
        // Check if it's a "not found" vs "wrong password" issue
        // For now, show account not found message
        toast.error('Account not found. Please register first.');
        setTimeout(() => {
          navigate('/register');
        }, 2000);
      }
    } else {
      toast.error('Please enter your login credentials');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen gradient-hero flex flex-col lg:flex-row">
      {/* Left Side - Branding */}
      <div className="lg:w-1/2 p-8 lg:p-16 flex flex-col justify-center relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-40 h-40 bg-rose/20 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-40 right-10 w-48 h-48 bg-lavender/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        </div>

        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10"
        >
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <Globe className="w-4 h-4" />
            <span className="text-sm">Change Language</span>
          </Link>

          <div className="inline-flex items-center gap-2 bg-rose-light/50 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-rose" />
            <span className="text-sm font-medium text-rose-dark">{t('womenOnly')}</span>
          </div>

          <h1 className="font-display text-4xl lg:text-5xl font-bold text-foreground mb-4">
            {t('welcome')}
          </h1>

          <p className="text-xl text-muted-foreground mb-8">
            {t('tagline')}
          </p>

          <div className="flex flex-col gap-4 text-muted-foreground">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-light flex items-center justify-center">
                <span className="text-rose font-semibold">✓</span>
              </div>
              <span>Safe & Verified Community</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-peach-light flex items-center justify-center">
                <span className="text-rose font-semibold">✓</span>
              </div>
              <span>Flexible Work Hours</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-lavender-light flex items-center justify-center">
                <span className="text-rose font-semibold">✓</span>
              </div>
              <span>Earn From Home</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right Side - Login Form */}
      <div className="lg:w-1/2 p-8 lg:p-16 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-md"
        >
          <div className="glass-card rounded-3xl p-8 lg:p-10">
            <h2 className="font-display text-2xl font-bold text-foreground mb-2">
              {t('login')}
            </h2>
            <p className="text-muted-foreground mb-8">
              Enter your details to continue
            </p>

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">{t('email')}</Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    className="pl-12"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t('password')}</Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="pl-12 pr-12"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                variant="hero"
                size="xl"
                className="w-full mt-6"
                disabled={isLoading}
              >
                {isLoading ? 'Please wait...' : t('login')}
                <ArrowRight className="w-5 h-5" />
              </Button>
            </form>

            <p className="text-center mt-6 text-muted-foreground">
              {t('noAccount')}{' '}
              <Link to="/register" className="text-rose font-semibold hover:underline">
                {t('register')}
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
