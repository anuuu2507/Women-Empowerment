import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Slider } from '../components/ui/slider';
import {
  Search, MapPin, Clock, IndianRupee, Filter, Star,
  Phone, Video, MessageCircle, ChevronRight, Sparkles, Eye, Shield
} from 'lucide-react';
import Navigation from '../components/Navigation';
import EmptyState from '../components/EmptyState';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '../components/ui/sheet';

// Categories for filter
const categories = [
  'All', 'Stitching', 'Cooking', 'Online', 'Tuition', 'Pickles', 'Handicrafts', 'Cleaning'
];

const TakeWork = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [radiusFilter, setRadiusFilter] = useState(10);
  const [priceRange, setPriceRange] = useState([0, 50000]);
  const [deliveryFilter, setDeliveryFilter] = useState('all');
  const [urgencyFilter, setUrgencyFilter] = useState('all');
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [showAllJobs, setShowAllJobs] = useState(false); // Toggle for AI filtering

  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userApplications, setUserApplications] = useState<Map<string, any>>(new Map());

  const fetchTasks = () => {
    setLoading(true);

    // Use AI-recommended endpoint if user has skills, otherwise show all
    const endpoint = (user && !showAllJobs)
      ? `/api/jobs/recommended?userId=${user.id}`
      : '/api/jobs';

    fetch(endpoint)
      .then(res => res.json())
      .then(data => {
        setTasks(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch jobs", err);
        setLoading(false);
      });
  };

  const fetchMyApplications = () => {
    if (!user) return;
    fetch('/api/my-applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id })
    })
      .then(res => res.json())
      .then(apps => {
        if (Array.isArray(apps)) {
          const appMap = new Map();
          apps.forEach((app: any) => {
            appMap.set(app.id, {
              applicationId: app.myApplicationId,
              status: app.myApplicationStatus
            });
          });
          setUserApplications(appMap);
        }
      })
      .catch(err => console.error('Error fetching applications:', err));
  };

  useEffect(() => {
    fetchTasks();
    if (user) fetchMyApplications();
  }, [user, showAllJobs]); // Re-fetch when toggle changes


  const handleApply = async (e: React.MouseEvent, taskId: string) => {
    e.stopPropagation(); // Prevent navigation to details
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      if (userApplications.has(taskId)) {
        toast.error('You have already applied for this task');
        return;
      }

      const response = await fetch(`/api/jobs/${taskId}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ workerId: user.id }),
      });

      let data;
      try {
        data = await response.json();
      } catch (e) {
        console.error("Failed to parse JSON:", e);
        throw new Error(response.statusText || `Server Error ${response.status}`);
      }

      if (response.ok) {
        toast.success('Request Sent! Waiting for customer approval.');
        // Update local state to reflect change immediately
        const newApp = data.application; // from backend response
        setUserApplications(prev => {
          const next = new Map(prev);
          next.set(taskId, {
            applicationId: newApp.id,
            status: 'pending'
          });
          return next;
        });
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'on_hold' } : t));
        // Refresh applications list
        fetchMyApplications();
      } else {
        const errorMsg = data?.message || 'Failed to send request';
        toast.error(errorMsg);
      }
    } catch (error: any) {
      console.error('Apply error:', error);
      toast.error(error.message || 'Unable to connect to server. Please try again.');
    }
  };

  const handleCancel = async (e: React.MouseEvent, appResponse: any) => {
    e.stopPropagation();
    const appId = appResponse?.myApplicationId;
    if (!appId) return;

    try {
      const response = await fetch(`/api/applications/${appId}/cancel`, {
        method: 'POST'
      });

      if (response.ok) {
        toast.success('Request Cancelled');
        // Remove from local MAP
        const taskId = appResponse?.id; // job id
        setUserApplications(prev => {
          const next = new Map(prev);
          next.delete(taskId);
          return next;
        });
        // Optimistically update task status to OPEN if it was HOLD
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'open' } : t));
      } else {
        toast.error('Failed to cancel request');
      }
    } catch (e) {
      toast.error('Error cancelling request');
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (selectedCategory !== 'All' && task.category !== selectedCategory) return false;
    if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (task.amount.min < priceRange[0] || task.amount.max > priceRange[1]) return false;
    if (deliveryFilter !== 'all' && task.deliveryType !== deliveryFilter) return false;
    if (urgencyFilter !== 'all' && task.urgency !== urgencyFilter) return false;

    // Don't show own posts (Strict check)
    if (user && task.creator_id && String(task.creator_id) === String(user.id)) return false;

    return true;
  });

  if (!user) {
    navigate('/login');
    return null;
  }

  // Helper to determine button state based on strict rules
  const getButtonState = (task: any) => {
    // 1. LOCKED -> "Job Booked"
    if (task.status === 'locked' || task.status === 'accepted') {
      return {
        text: 'Job Booked / Not Available',
        disabled: true,
        className: 'bg-gray-300 text-gray-500 cursor-not-allowed'
      };
    }

    // 2. HOLD -> "Request Pending"
    if (task.status === 'hold' || task.status === 'on_hold') {
      return {
        text: 'Request Pending – Awaiting Customer Approval',
        disabled: true,
        className: 'bg-yellow-100 text-yellow-700 border-yellow-200 cursor-not-allowed'
      };
    }

    // 3. OPEN -> "Request" (Default)
    const application = userApplications.get(task.id);
    if (application) {
      // If I applied, enable Cancel
      return {
        text: 'Cancel Request',
        action: 'cancel',
        data: { myApplicationId: application.applicationId, id: task.id },
        className: 'bg-red-100 text-red-600 hover:bg-red-200 border border-red-200'
      };
    }

    return {
      text: 'Request',
      action: 'apply',
      disabled: false,
      className: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all'
    };
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Task Details Sheet */}
      <Sheet open={!!selectedTask} onOpenChange={(open) => !open && setSelectedTask(null)}>
        <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
          {selectedTask && (
            <div className="flex flex-col h-full">
              {/* Header with Gradient */}
              <div className="relative bg-gradient-to-r from-violet-600 to-indigo-600 p-6 -mx-6 -mt-6 mb-6">
                <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-medium">
                  {selectedTask.category}
                </div>
                <h2 className="text-2xl font-bold text-white mt-4">{selectedTask.title}</h2>
                <div className="flex items-center gap-2 mt-2 text-white/90 text-sm">
                  <Clock className="w-4 h-4" />
                  <span>Posted {selectedTask.postedAt}</span>
                </div>
              </div>

              <div className="space-y-6 flex-1 overflow-y-auto px-1">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted/30 p-4 rounded-xl border border-border/50">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Budget</p>
                    <p className="text-lg font-bold text-green-700 mt-1">₹{selectedTask.amount.min} - ₹{selectedTask.amount.max}</p>
                  </div>
                  <div className="bg-muted/30 p-4 rounded-xl border border-border/50">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Location</p>
                    <p className="text-lg font-bold text-foreground mt-1 flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-rose-500" />
                      {selectedTask.location}
                    </p>
                  </div>
                </div>

                {/* Urgency & Delivery */}
                <div className="flex gap-4">
                  <span className={`px-3 py-1.5 rounded-lg text-sm font-medium flex-1 text-center ${selectedTask.urgency === 'today' ? 'bg-rose-100 text-rose-700 border border-rose-200' : 'bg-gray-100 text-gray-700'}`}>
                    Urgency: {selectedTask.urgency.toUpperCase()}
                  </span>
                  <span className="px-3 py-1.5 rounded-lg text-sm font-medium flex-1 text-center bg-blue-50 text-blue-700 border border-blue-100 capitalize">
                    {selectedTask.deliveryType}
                  </span>
                </div>

                {/* Payment Tag */}
                <div className="mt-2 text-center">
                  {selectedTask.paymentMode === 'cod' ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-sm font-semibold border border-orange-200">
                      <IndianRupee className="w-3 h-3" /> Cash On Delivery
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-sm font-semibold border border-emerald-200">
                      <Shield className="w-3 h-3" /> Escrow Secured
                    </span>
                  )}
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-yellow-500" />
                    About this Task
                  </h3>
                  <div className="bg-secondary/20 p-4 rounded-xl text-muted-foreground leading-relaxed text-sm">
                    {selectedTask.description}
                  </div>
                </div>

                {/* Customer Profile */}
                <div className="flex items-center gap-4 bg-muted/20 p-4 rounded-xl border">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-400 to-orange-400 flex items-center justify-center font-bold text-white text-xl shadow-lg">
                    {selectedTask.customerName[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-lg">{selectedTask.customerName}</p>
                    <div className="flex items-center gap-1 text-sm text-yellow-600 font-medium">
                      <Star className="w-4 h-4 fill-current" />
                      {selectedTask.customerRating} Customer Rating
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div className="sticky bottom-0 -mx-6 -mb-6 p-6 bg-background/80 backdrop-blur-lg border-t mt-4">
                {userApplications.has(selectedTask.id) ? (
                  <Button
                    className="w-full bg-red-100 text-red-600 hover:bg-red-200 border border-red-200"
                    size="lg"
                    onClick={(e) => {
                      const app = userApplications.get(selectedTask.id);
                      handleCancel(e, { myApplicationId: app?.applicationId, id: selectedTask.id });
                      setSelectedTask(null);
                    }}
                  >
                    Cancel Request
                  </Button>
                ) : selectedTask.status === 'on_hold' ? (
                  <div className="text-center w-full">
                    <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg font-semibold mb-2 text-sm border border-red-100">
                      This task is currently on hold.
                    </div>
                    <Button disabled className="w-full bg-gray-100 text-gray-400" size="lg">
                      On Hold
                    </Button>
                  </div>
                ) : (
                  <Button
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-xl shadow-green-200 transition-all duration-300 transform hover:scale-[1.02]"
                    size="lg"
                    onClick={(e) => {
                      handleApply(e, selectedTask.id);
                      setSelectedTask(null);
                    }}
                  >
                    Request This Work
                  </Button>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground">
                {t('takeWork')}
              </h1>
              <p className="text-muted-foreground mt-1">
                {showAllJobs ? 'Showing all available jobs' : 'AI-recommended jobs based on your skills'}
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                variant={showAllJobs ? "outline" : "default"}
                className={`gap-2 ${!showAllJobs ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white' : ''}`}
                onClick={() => setShowAllJobs(false)}
              >
                <Sparkles className="w-4 h-4" />
                AI Recommended
              </Button>
              <Button
                variant={showAllJobs ? "default" : "outline"}
                onClick={() => setShowAllJobs(true)}
              >
                Show All Jobs
              </Button>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Filter className="w-4 h-4" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Filter Tasks</SheetTitle>
                  </SheetHeader>

                  <div className="space-y-6 mt-6">
                    {/* Radius Filter */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label>{t('radius')}</Label>
                        <span className="text-sm font-medium">{radiusFilter} km</span>
                      </div>
                      <Slider
                        value={[radiusFilter]}
                        onValueChange={(v) => setRadiusFilter(v[0])}
                        min={1}
                        max={20}
                        step={1}
                      />
                    </div>

                    {/* Price Range */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label>Price Range</Label>
                        <span className="text-sm font-medium">₹{priceRange[0]} - ₹{priceRange[1]}</span>
                      </div>
                      <Slider
                        value={priceRange}
                        onValueChange={setPriceRange}
                        min={0}
                        max={50000}
                        step={500}
                      />
                    </div>

                    {/* Delivery Type */}
                    <div className="space-y-2">
                      <Label>Delivery Type</Label>
                      <Select value={deliveryFilter} onValueChange={setDeliveryFilter}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="pickup">Pickup Only</SelectItem>
                          <SelectItem value="delivery">Home Delivery</SelectItem>
                          <SelectItem value="online">Online Work</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Urgency */}
                    <div className="space-y-2">
                      <Label>Urgency</Label>
                      <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="today">Today</SelectItem>
                          <SelectItem value="tomorrow">Tomorrow</SelectItem>
                          <SelectItem value="this_week">This Week</SelectItem>
                          <SelectItem value="flexible">Flexible</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {/* Search & Categories */}
          <div className="space-y-6 mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search for work (e.g., stitching, cooking)..."
                className="pl-10 h-12 bg-card/50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedCategory === cat
                    ? 'bg-rose text-white'
                    : 'bg-card hover:bg-muted text-foreground'
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Task Grid */}
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">Loading tasks...</div>
            ) : filteredTasks.length > 0 ? (
              filteredTasks.map((task, index) => {
                const isRequested = userApplications.has(task.id);
                const isOnHold = task.status === 'on_hold';

                return (
                  <motion.div
                    key={task.id}
                    layoutId={task.id}
                    onClick={() => setSelectedTask(task)} // Updated to open Sheet
                    className={`glass-card p-6 rounded-2xl cursor-pointer group hover:border-rose/50 transition-all ${isOnHold && !isRequested ? 'bg-red-50 border-red-100' : ''
                      }`}
                  >
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <span className="px-3 py-1 rounded-full bg-rose-light text-rose-dark text-xs font-medium">
                            {task.category}
                          </span>
                          {isOnHold && !isRequested && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white text-red-500 border border-red-200 shadow-sm animate-pulse">
                              ON HOLD
                            </span>
                          )}
                          <span className={`text-xs font-medium px-2 py-0.5 rounded ${task.urgency === 'today' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                            }`}>
                            {task.urgency === 'today' ? 'URGENT' : task.urgency}
                          </span>
                        </div>

                        <h3 className="font-semibold text-lg text-foreground group-hover:text-rose transition-colors">
                          {task.title}
                        </h3>
                        <p className="text-muted-foreground text-sm mt-1">{task.description}</p>

                        <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {task.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {task.postedAt}
                          </span>
                          <span className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-gold fill-gold" />
                            {task.customerName} ({task.customerRating})
                          </span>
                        </div>
                      </div>

                      <div className="flex md:flex-col items-center md:items-end gap-4">
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Budget</p>
                          <p className="font-semibold text-lg text-foreground">
                            ₹{task.amount.min} - ₹{task.amount.max}
                          </p>
                        </div>

                        <div className="flex gap-2">
                          {(() => {
                            const btnState = getButtonState(task);
                            return (
                              <Button
                                className={btnState.className}
                                onClick={(e) => {
                                  if (btnState.action === 'cancel') {
                                    handleCancel(e, btnState.data);
                                  } else {
                                    handleApply(e, task.id);
                                  }
                                }}
                                disabled={btnState.disabled}
                              >
                                {btnState.text}
                              </Button>
                            );
                          })()}

                          <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full"
                            title="View Details"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTask(task);
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(`https://meet.jit.si/ShakthiConnect-Job-${task.id}`, '_blank');
                            }}
                          >
                            <Phone className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(`https://meet.jit.si/ShakthiConnect-Job-${task.id}`, '_blank');
                            }}
                          >
                            <Video className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/chat/${task.id}`);
                            }}
                          >
                            <MessageCircle className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <ChevronRight className="w-5 h-5 text-muted-foreground hidden md:block" />
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <EmptyState
                icon={Filter}
                title="No tasks found"
                description="No tasks found matching your filters. (You cannot see tasks you posted yourself)"
                actionLabel="Clear Filters"
                onAction={() => {
                  setSelectedCategory('All');
                  setSearchQuery('');
                }}
              />
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default TakeWork;
