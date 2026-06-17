import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { 
  MapPin, Navigation2, Users, Briefcase, Star, 
  Phone, MessageCircle, Video
} from 'lucide-react';
import Navigation from '@/components/Navigation';

// Mock nearby workers
const mockNearbyWorkers = [
  {
    id: '1',
    name: 'Anita Devi',
    skills: ['Stitching', 'Tailoring'],
    distance: '1.2 km',
    rating: 4.8,
    reviews: 32,
    available: true,
  },
  {
    id: '2',
    name: 'Meera Kumari',
    skills: ['Home Cooking', 'Pickles'],
    distance: '2.1 km',
    rating: 4.6,
    reviews: 18,
    available: true,
  },
  {
    id: '3',
    name: 'Sunita Sharma',
    skills: ['Kids Care', 'Tuition'],
    distance: '3.5 km',
    rating: 4.9,
    reviews: 45,
    available: false,
  },
  {
    id: '4',
    name: 'Lakshmi Rao',
    skills: ['Data Entry', 'Content Writing'],
    distance: '4.2 km',
    rating: 4.5,
    reviews: 22,
    available: true,
  },
];

const NearMe = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user } = useAuth();
  
  const [radius, setRadius] = useState(5);
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);

  const filteredWorkers = mockNearbyWorkers.filter(worker => {
    const workerDistance = parseFloat(worker.distance);
    if (workerDistance > radius) return false;
    if (showAvailableOnly && !worker.available) return false;
    return true;
  });

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
            {t('nearMe')}
          </h1>
          <p className="text-muted-foreground mb-8">
            Find workers and tasks near your location
          </p>

          {/* Map Placeholder */}
          <div className="glass-card rounded-3xl p-6 mb-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-rose-light/30 to-lavender-light/30" />
            <div className="relative z-10 text-center py-12">
              <div className="w-16 h-16 rounded-full bg-rose-light mx-auto flex items-center justify-center mb-4">
                <MapPin className="w-8 h-8 text-rose" />
              </div>
              <h3 className="font-semibold text-lg text-foreground mb-2">
                Real-time Location Map
              </h3>
              <p className="text-muted-foreground text-sm mb-4">
                View workers and tasks on map
              </p>
              <Button variant="feminine" className="gap-2">
                <Navigation2 className="w-4 h-4" />
                Enable Location
              </Button>
            </div>
          </div>

          {/* Radius Filter */}
          <div className="glass-card rounded-2xl p-5 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-rose" />
                <span className="font-medium text-foreground">{t('radius')}</span>
              </div>
              <span className="font-semibold text-foreground">{radius} km</span>
            </div>
            <Slider
              value={[radius]}
              onValueChange={(v) => setRadius(v[0])}
              min={1}
              max={20}
              step={1}
            />
            <div className="flex justify-between text-sm text-muted-foreground mt-2">
              <span>1 km</span>
              <span>20 km</span>
            </div>
          </div>

          {/* Filter Toggle */}
          <div className="flex items-center gap-3 mb-6">
            <Button 
              variant={!showAvailableOnly ? 'feminine' : 'outline'}
              onClick={() => setShowAvailableOnly(false)}
            >
              All Workers
            </Button>
            <Button 
              variant={showAvailableOnly ? 'feminine' : 'outline'}
              onClick={() => setShowAvailableOnly(true)}
            >
              Available Now
            </Button>
          </div>

          {/* Workers List */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-muted-foreground" />
              <span className="text-muted-foreground">
                {filteredWorkers.length} workers within {radius} km
              </span>
            </div>

            {filteredWorkers.map((worker, index) => (
              <motion.div
                key={worker.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass-card rounded-2xl p-5"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-rose-light flex items-center justify-center">
                    <span className="text-xl font-semibold text-rose">
                      {worker.name.charAt(0)}
                    </span>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">{worker.name}</h3>
                      <span className={`w-2 h-2 rounded-full ${worker.available ? 'bg-sage' : 'bg-muted-foreground'}`} />
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {worker.skills.map((skill) => (
                        <span 
                          key={skill}
                          className="px-2 py-0.5 bg-lavender-light text-accent-foreground rounded-full text-xs"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {worker.distance}
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-gold fill-gold" />
                        {worker.rating} ({worker.reviews})
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <Phone className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <Video className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}

            {filteredWorkers.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No workers found in this radius</p>
                <Button variant="outline" onClick={() => setRadius(10)}>
                  Expand Radius
                </Button>
              </div>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default NearMe;
