import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  FileText, MapPin, Clock, IndianRupee, Truck, Store,
  Wifi, Send, Sparkles, AlertCircle
} from 'lucide-react';
import Navigation from '@/components/Navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const workCategories = [
  'Stitching & Tailoring',
  'Home Cooking',
  'Pickles & Snacks',
  'Kids Care',
  'Home Cleaning',
  'Data Entry',
  'Content Writing',
  'Tuition',
  'Handicrafts',
  'Other',
];

const GiveWork = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    quantity: '',
    timeRequired: '',
    budgetMin: '',
    budgetMax: '',
    deliveryType: 'pickup',
    location: '',
    deliveryInstructions: '',
    urgency: 'flexible',
    paymentMode: 'online',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.category || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!formData.budgetMin || !formData.budgetMax) {
      toast.error('Please enter both minimum and maximum budget');
      return;
    }

    if (Number(formData.budgetMin) > Number(formData.budgetMax)) {
      toast.error('Minimum budget cannot be greater than maximum budget');
      return;
    }

    if (formData.deliveryType !== 'online' && !formData.location) {
      toast.error('Please enter your location');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          category: formData.category,
          description: formData.description,
          quantity: formData.quantity,
          timeRequired: formData.timeRequired,
          amount: { min: Number(formData.budgetMin), max: Number(formData.budgetMax) },
          location: formData.location || 'Online',
          deliveryType: formData.deliveryType,
          deliveryInstructions: formData.deliveryInstructions,
          urgency: formData.urgency,
          paymentMode: formData.paymentMode,
          customerName: user?.name || 'Anonymous',
          postedAt: new Date().toLocaleString(),
          creatorId: user?.id
        }),
      });

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error('Failed to parse response:', parseError);
        toast.error('Server error. Please try again.');
        return;
      }

      if (response.ok) {
        toast.success('Work posted successfully! Workers in your area will be notified.');
        // Reset form
        setFormData({
          title: '',
          category: '',
          description: '',
          quantity: '',
          timeRequired: '',
          budgetMin: '',
          budgetMax: '',
          deliveryType: 'pickup',
          location: '',
          deliveryInstructions: '',
          urgency: 'flexible',
          paymentMode: 'online',
        });
        navigate('/my-postings');
      } else {
        toast.error(data?.message || 'Failed to post work. Please try again.');
      }
    } catch (error) {
      console.error('Error posting work:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Network error: ${errorMessage}. Ensure the backend server is running on port 5000.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="max-w-3xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">
            {t('giveWork')}
          </h1>
          <p className="text-muted-foreground mb-8">
            Post a task and find skilled women in your area
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="glass-card rounded-3xl p-6">
              <h2 className="font-semibold text-lg text-foreground mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-rose" />
                Work Details
              </h2>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Work Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Blouse Stitching Required"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {workCategories.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the work in detail..."
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      placeholder="e.g., 2 pieces"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timeRequired">Time Required</Label>
                    <Input
                      id="timeRequired"
                      placeholder="e.g., 3 days"
                      value={formData.timeRequired}
                      onChange={(e) => setFormData({ ...formData, timeRequired: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Budget */}
            <div className="glass-card rounded-3xl p-6">
              <h2 className="font-semibold text-lg text-foreground mb-4 flex items-center gap-2">
                <IndianRupee className="w-5 h-5 text-rose" />
                Budget
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="budgetMin">Minimum (₹)</Label>
                  <Input
                    id="budgetMin"
                    type="number"
                    placeholder="300"
                    value={formData.budgetMin}
                    onChange={(e) => setFormData({ ...formData, budgetMin: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="budgetMax">Maximum (₹)</Label>
                  <Input
                    id="budgetMax"
                    type="number"
                    placeholder="500"
                    value={formData.budgetMax}
                    onChange={(e) => setFormData({ ...formData, budgetMax: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Payment Mode */}
            <div className="glass-card rounded-3xl p-6">
              <h2 className="font-semibold text-lg text-foreground mb-4 flex items-center gap-2">
                <IndianRupee className="w-5 h-5 text-rose" />
                Mode of Payment
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { id: 'online', label: 'Online Payment (Escrow)', desc: 'Secure Escrow Protection', color: 'bg-emerald-50 border-emerald-200' },
                  { id: 'cod', label: 'Cash on Delivery', desc: 'Pay when work is done', color: 'bg-orange-50 border-orange-200' }
                ].map(mode => (
                  <div
                    key={mode.id}
                    onClick={() => setFormData({ ...formData, paymentMode: mode.id })}
                    className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col gap-1 transition-all ${
                      // @ts-ignore
                      formData.paymentMode === mode.id ? 'border-rose ring-2 ring-rose/20' : 'border-border/50 hover:border-rose/30'
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground">{mode.label}</span>
                      {/* @ts-ignore */}
                      {formData.paymentMode === mode.id && <div className="w-4 h-4 rounded-full bg-rose animate-pulse" />}
                    </div>
                    <p className="text-sm text-muted-foreground">{mode.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Urgency */}
            <div className="glass-card rounded-3xl p-6">
              <h2 className="font-semibold text-lg text-foreground mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-rose" />
                Urgency
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { id: 'today', label: 'Today', color: 'rose' },
                  { id: 'tomorrow', label: 'Tomorrow', color: 'peach' },
                  { id: 'this_week', label: 'This Week', color: 'lavender' },
                  { id: 'flexible', label: 'Flexible', color: 'muted' },
                ].map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, urgency: option.id })}
                    className={`p-3 rounded-xl border-2 transition-all duration-300 ${formData.urgency === option.id
                      ? 'border-rose bg-rose-light'
                      : 'border-border hover:border-rose/30'
                      }`}
                  >
                    <span className={`font-medium ${formData.urgency === option.id ? 'text-rose-dark' : 'text-foreground'
                      }`}>
                      {option.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Delivery */}
            <div className="glass-card rounded-3xl p-6">
              <h2 className="font-semibold text-lg text-foreground mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-rose" />
                Delivery Options
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                {[
                  { id: 'pickup', label: 'Pickup', icon: Store, desc: 'I will pick up' },
                  { id: 'delivery', label: 'Home Delivery', icon: Truck, desc: 'Deliver to me' },
                  { id: 'online', label: 'Online', icon: Wifi, desc: 'Digital submission' },
                ].map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, deliveryType: option.id })}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-300 ${formData.deliveryType === option.id
                        ? 'border-rose bg-rose-light'
                        : 'border-border hover:border-rose/30'
                        }`}
                    >
                      <Icon className={`w-6 h-6 ${formData.deliveryType === option.id ? 'text-rose' : 'text-muted-foreground'
                        }`} />
                      <span className={`font-medium ${formData.deliveryType === option.id ? 'text-rose-dark' : 'text-foreground'
                        }`}>
                        {option.label}
                      </span>
                      <span className="text-xs text-muted-foreground">{option.desc}</span>
                    </button>
                  );
                })}
              </div>

              {formData.deliveryType !== 'online' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      placeholder="Your address or landmark"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="instructions">Delivery Instructions</Label>
                    <Textarea
                      id="instructions"
                      placeholder="Any specific instructions for pickup/delivery..."
                      rows={2}
                      value={formData.deliveryInstructions}
                      onChange={(e) => setFormData({ ...formData, deliveryInstructions: e.target.value })}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* AI Matching Info */}
            <div className="bg-lavender-light/50 rounded-2xl p-4 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-accent-foreground flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-accent-foreground">AI-Powered Matching</p>
                <p className="text-sm text-muted-foreground">
                  Your task will be automatically matched with skilled workers in your area based on skills, distance, and availability.
                </p>
              </div>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              variant="hero"
              size="xl"
              className="w-full"
              disabled={isSubmitting}
            >
              <Send className="w-5 h-5" />
              {isSubmitting ? 'Posting Work...' : 'Post Work'}
            </Button>
          </form>
        </motion.div>
      </main>
    </div>
  );
};

export default GiveWork;
