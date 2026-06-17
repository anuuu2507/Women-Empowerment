import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import {
  User, Mail, Phone, MapPin, CreditCard, Lock, Eye, EyeOff,
  Shield, CheckCircle2, ArrowRight, Sparkles, Globe
} from 'lucide-react';
import TermsModal from '@/components/TermsModal';

const Register = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { register } = useAuth();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    address: '',
    aadhaarLast4: '',
    linkedAadhaarPhone: '',
    termsAccepted: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [aadhaarVerified, setAadhaarVerified] = useState(false);
  const [aadhaarOtpSent, setAadhaarOtpSent] = useState(false);
  const [aadhaarOtp, setAadhaarOtp] = useState('');
  const [showTerms, setShowTerms] = useState(false);

  const handleSendAadhaarOtp = async () => {
    if (!formData.aadhaarLast4 || formData.aadhaarLast4.length !== 4) {
      toast.error('Please enter last 4 digits of Aadhaar');
      return;
    }
    if (!formData.linkedAadhaarPhone) {
      toast.error('Please enter phone number linked to Aadhaar');
      return;
    }

    setIsVerifying(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setAadhaarOtpSent(true);
    setIsVerifying(false);
    toast.success('OTP sent to your Aadhaar-linked phone number');
  };

  const handleVerifyAadhaar = async () => {
    if (!aadhaarOtp || aadhaarOtp.length !== 6) {
      toast.error('Please enter 6-digit OTP');
      return;
    }

    setIsVerifying(true);
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simulate successful gender verification
    const mockResponse = {
      gender: 'F',
      name: formData.fullName,
      verified: true,
    };

    if (mockResponse.gender === 'F') {
      setAadhaarVerified(true);
      toast.success('Aadhaar verified! Gender confirmed as Female.');
    } else {
      toast.error('This platform is exclusively for women. Aadhaar must confirm female gender.');
    }
    setIsVerifying(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.termsAccepted) {
      toast.error('Please accept Terms & Conditions');
      return;
    }

    if (!aadhaarVerified) {
      toast.error('Please verify your Aadhaar first');
      return;
    }

    setIsLoading(true);

    const result = await register({
      name: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      aadhaarLast4: formData.aadhaarLast4,
      gender: 'female',
    });

    if (result.success) {
      toast.success('Registration successful! Welcome to Feminine Shakthi!');
      navigate('/dashboard');
    } else if (result.shouldRedirectToLogin) {
      // User already exists, redirect to login
      toast.error(result.message || 'You already have an account.');
      setTimeout(() => {
        navigate('/login');
      }, 2000); // Give user time to read the message
    } else {
      toast.error(result.message || 'Registration failed. Check server connection.');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen gradient-hero flex flex-col lg:flex-row">
      {/* Left Side - Branding */}
      <div className="lg:w-2/5 p-8 lg:p-16 flex flex-col justify-center relative overflow-hidden">
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

          <h1 className="font-display text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
            Join Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-purple-600">Community</span>
          </h1>

          <p className="text-xl text-muted-foreground mb-10 max-w-lg leading-relaxed">
            Create your account and start your empowerment journey today.
          </p>

          {/* Security Note */}
          <div className="bg-white/40 backdrop-blur-md rounded-2xl p-6 border border-rose-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-foreground mb-1">Secure Verification</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  We use Aadhaar OTP e-KYC to verify gender. We never collect or store your Aadhaar images.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right Side - Registration Form */}
      <div className="lg:w-3/5 p-8 lg:p-12 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-xl"
        >
          <div className="glass-card rounded-3xl p-8">
            <h2 className="font-display text-2xl font-bold text-foreground mb-6">
              {t('register')}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Personal Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">{t('fullName')}</Label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="fullName"
                      placeholder="Your full name"
                      className="pl-12"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      required
                    />
                  </div>
                </div>

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
                  <Label htmlFor="phone">{t('phone')}</Label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+91 98765 43210"
                      className="pl-12"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">{t('address')}</Label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-3 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="address"
                    placeholder="Your address"
                    className="pl-12"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Aadhaar Verification Section */}
              <div className="bg-lavender-light/50 rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-accent-foreground" />
                  <h3 className="font-semibold text-foreground">{t('verifyAadhaar')}</h3>
                  {aadhaarVerified && (
                    <CheckCircle2 className="w-5 h-5 text-sage ml-auto" />
                  )}
                </div>

                {!aadhaarVerified ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="aadhaar">{t('aadhaar')}</Label>
                        <div className="relative">
                          <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                          <Input
                            id="aadhaar"
                            type="text"
                            maxLength={4}
                            placeholder="XXXX"
                            className="pl-12"
                            value={formData.aadhaarLast4}
                            onChange={(e) => setFormData({ ...formData, aadhaarLast4: e.target.value.replace(/\D/g, '') })}
                            disabled={aadhaarOtpSent}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="linkedPhone">Aadhaar Linked Phone</Label>
                        <div className="relative">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                          <Input
                            id="linkedPhone"
                            type="tel"
                            placeholder="+91 XXXXX XXXXX"
                            className="pl-12"
                            value={formData.linkedAadhaarPhone}
                            onChange={(e) => setFormData({ ...formData, linkedAadhaarPhone: e.target.value })}
                            disabled={aadhaarOtpSent}
                          />
                        </div>
                      </div>
                    </div>

                    {!aadhaarOtpSent ? (
                      <Button
                        type="button"
                        variant="lavender"
                        onClick={handleSendAadhaarOtp}
                        disabled={isVerifying}
                        className="w-full"
                      >
                        {isVerifying ? 'Sending OTP...' : t('sendOtp')}
                      </Button>
                    ) : (
                      <div className="space-y-3">
                        <Input
                          type="text"
                          maxLength={6}
                          placeholder="Enter 6-digit OTP"
                          value={aadhaarOtp}
                          onChange={(e) => setAadhaarOtp(e.target.value.replace(/\D/g, ''))}
                        />
                        <Button
                          type="button"
                          variant="feminine"
                          onClick={handleVerifyAadhaar}
                          disabled={isVerifying}
                          className="w-full"
                        >
                          {isVerifying ? 'Verifying...' : 'Verify Gender'}
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex items-center gap-3 text-sage">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="font-medium">Gender verified as Female ✓</span>
                  </div>
                )}
              </div>

              {/* Terms & Conditions */}
              <div className="flex items-start gap-3">
                <Checkbox
                  id="terms"
                  checked={formData.termsAccepted}
                  onCheckedChange={(checked) => setFormData({ ...formData, termsAccepted: checked as boolean })}
                />
                <label htmlFor="terms" className="text-sm text-muted-foreground">
                  I accept the{' '}
                  <button
                    type="button"
                    onClick={() => setShowTerms(true)}
                    className="text-rose font-semibold hover:underline"
                  >
                    {t('termsConditions')}
                  </button>
                </label>
              </div>

              <Button
                type="submit"
                variant="hero"
                size="xl"
                className="w-full"
                disabled={isLoading || !aadhaarVerified}
              >
                {isLoading ? 'Creating Account...' : t('register')}
                <ArrowRight className="w-5 h-5" />
              </Button>
            </form>

            <p className="text-center mt-6 text-muted-foreground">
              {t('haveAccount')}{' '}
              <Link to="/login" className="text-rose font-semibold hover:underline">
                {t('login')}
              </Link>
            </p>
          </div>
        </motion.div>
      </div>

      <TermsModal open={showTerms} onClose={() => setShowTerms(false)} />
    </div>
  );
};

export default Register;
