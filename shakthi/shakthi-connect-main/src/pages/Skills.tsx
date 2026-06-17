import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import { 
  Scissors, UtensilsCrossed, Baby, BookOpen, Laptop, 
  Paintbrush, Package, Heart, Plus, Check, MapPin, Clock,
  Truck, Store, Wifi, Save
} from 'lucide-react';
import Navigation from '@/components/Navigation';

const skillCategories = [
  { id: 'stitching', label: 'Stitching', icon: Scissors },
  { id: 'tailoring', label: 'Tailoring', icon: Scissors },
  { id: 'cooking', label: 'Home Cooking', icon: UtensilsCrossed },
  { id: 'pickles', label: 'Pickles Making', icon: Package },
  { id: 'snacks', label: 'Snacks Preparation', icon: UtensilsCrossed },
  { id: 'kidcare', label: 'Kids Care', icon: Baby },
  { id: 'storytelling', label: 'Story Telling', icon: BookOpen },
  { id: 'dataentry', label: 'Data Entry', icon: Laptop },
  { id: 'handicrafts', label: 'Handicrafts', icon: Paintbrush },
  { id: 'cleaning', label: 'Home Cleaning', icon: Heart },
  { id: 'tuition', label: 'Online Tuition', icon: BookOpen },
  { id: 'contentwriting', label: 'Content Writing', icon: Laptop },
  { id: 'graphicdesign', label: 'Graphic Design', icon: Paintbrush },
  { id: 'resume', label: 'Resume Writing', icon: Laptop },
];

const deliveryOptions = [
  { id: 'pickup', label: 'Pickup', icon: Store, description: 'Customer picks up from your location' },
  { id: 'delivery', label: 'Home Delivery', icon: Truck, description: 'You deliver to customer' },
  { id: 'online', label: 'Online Work', icon: Wifi, description: 'Complete work digitally' },
];

const Skills = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user, updateUser } = useAuth();
  
  const [selectedSkills, setSelectedSkills] = useState<string[]>(user?.skills || []);
  const [customSkill, setCustomSkill] = useState('');
  const [radius, setRadius] = useState(user?.radius || 5);
  const [availability, setAvailability] = useState(user?.availability || '9 AM - 6 PM');
  const [deliveryPreference, setDeliveryPreference] = useState<string>(user?.deliveryPreference || 'all');
  const [isSaving, setIsSaving] = useState(false);

  // Load saved skills on mount
  useEffect(() => {
    if (user?.skills) {
      setSelectedSkills(user.skills);
    }
  }, [user]);

  const toggleSkill = (skillId: string) => {
    setSelectedSkills(prev => 
      prev.includes(skillId) 
        ? prev.filter(s => s !== skillId)
        : [...prev, skillId]
    );
  };

  const addCustomSkill = () => {
    if (customSkill.trim() && !selectedSkills.includes(customSkill.trim())) {
      setSelectedSkills(prev => [...prev, customSkill.trim()]);
      setCustomSkill('');
    }
  };

  const handleSave = async () => {
    if (selectedSkills.length === 0) {
      toast.error('Please select at least one skill');
      return;
    }

    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    updateUser({
      skills: selectedSkills,
      radius,
      availability,
      deliveryPreference: deliveryPreference as any,
    });

    toast.success('Skills saved successfully!');
    setIsSaving(false);
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">
            {t('skills')}
          </h1>
          <p className="text-muted-foreground mb-8">
            Select your skills and set your preferences to receive matching work
          </p>

          {/* Skills Selection */}
          <div className="glass-card rounded-3xl p-6 mb-6">
            <h2 className="font-semibold text-lg text-foreground mb-4">Select Your Skills</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {skillCategories.map((skill) => {
                const Icon = skill.icon;
                const isSelected = selectedSkills.includes(skill.id);
                return (
                  <button
                    key={skill.id}
                    onClick={() => toggleSkill(skill.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all duration-300 ${
                      isSelected
                        ? 'border-rose bg-rose-light'
                        : 'border-border hover:border-rose/30 hover:bg-muted'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      isSelected ? 'bg-rose/20' : 'bg-muted'
                    }`}>
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-rose' : 'text-muted-foreground'}`} />
                    </div>
                    <span className={`text-sm font-medium ${isSelected ? 'text-rose-dark' : 'text-foreground'}`}>
                      {skill.label}
                    </span>
                    {isSelected && <Check className="w-4 h-4 text-rose ml-auto" />}
                  </button>
                );
              })}
            </div>

            {/* Custom Skill */}
            <div className="mt-4 flex gap-2">
              <Input
                placeholder="Add custom skill..."
                value={customSkill}
                onChange={(e) => setCustomSkill(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addCustomSkill()}
              />
              <Button variant="peach" onClick={addCustomSkill}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {/* Selected Custom Skills */}
            {selectedSkills.filter(s => !skillCategories.find(c => c.id === s)).length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {selectedSkills
                  .filter(s => !skillCategories.find(c => c.id === s))
                  .map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-lavender-light rounded-full text-sm"
                    >
                      {skill}
                      <button 
                        onClick={() => toggleSkill(skill)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        ×
                      </button>
                    </span>
                  ))}
              </div>
            )}
          </div>

          {/* Delivery Preference */}
          <div className="glass-card rounded-3xl p-6 mb-6">
            <h2 className="font-semibold text-lg text-foreground mb-4">Delivery Preference</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {deliveryOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = deliveryPreference === option.id || deliveryPreference === 'all';
                return (
                  <button
                    key={option.id}
                    onClick={() => setDeliveryPreference(option.id)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-300 ${
                      isSelected
                        ? 'border-rose bg-rose-light'
                        : 'border-border hover:border-rose/30 hover:bg-muted'
                    }`}
                  >
                    <Icon className={`w-6 h-6 ${isSelected ? 'text-rose' : 'text-muted-foreground'}`} />
                    <span className={`font-medium ${isSelected ? 'text-rose-dark' : 'text-foreground'}`}>
                      {option.label}
                    </span>
                    <span className="text-xs text-muted-foreground text-center">
                      {option.description}
                    </span>
                  </button>
                );
              })}
            </div>
            <Button 
              variant={deliveryPreference === 'all' ? 'feminine' : 'outline'}
              className="w-full mt-4"
              onClick={() => setDeliveryPreference('all')}
            >
              All Options
            </Button>
          </div>

          {/* Working Radius */}
          <div className="glass-card rounded-3xl p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-rose" />
              <h2 className="font-semibold text-lg text-foreground">Working Radius</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Distance from your location</span>
                <span className="font-semibold text-foreground">{radius} km</span>
              </div>
              <Slider
                value={[radius]}
                onValueChange={(value) => setRadius(value[0])}
                min={1}
                max={20}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>1 km</span>
                <span>20 km</span>
              </div>
            </div>
          </div>

          {/* Availability */}
          <div className="glass-card rounded-3xl p-6 mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-rose" />
              <h2 className="font-semibold text-lg text-foreground">Availability</h2>
            </div>
            <div className="space-y-2">
              <Label>Working Hours</Label>
              <Input
                placeholder="e.g., 9 AM - 6 PM"
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
              />
            </div>
          </div>

          {/* Save Button */}
          <Button
            variant="hero"
            size="xl"
            className="w-full"
            onClick={handleSave}
            disabled={isSaving}
          >
            <Save className="w-5 h-5" />
            {isSaving ? 'Saving...' : 'Save Skills & Preferences'}
          </Button>
        </motion.div>
      </main>
    </div>
  );
};

export default Skills;
