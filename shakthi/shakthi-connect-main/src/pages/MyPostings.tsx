import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import Navigation from '../components/Navigation';
import { toast } from 'sonner';
import {
    Briefcase, Star, Clock, Check, X, ChevronDown, ChevronUp, User, MessageCircle, FilePlus
} from 'lucide-react';
import EmptyState from '../components/EmptyState';

const MyPostings = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const [jobs, setJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedJob, setExpandedJob] = useState<string | null>(null);

    // Review State
    const [reviewOpen, setReviewOpen] = useState(false);
    const [selectedJob, setSelectedJob] = useState<any>(null);
    const [rating, setRating] = useState(5);
    const [review, setReview] = useState('');

    useEffect(() => {
        if (user) {
            fetch('/api/my-postings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id })
            })
                .then(res => res.json())
                .then(data => {
                    setJobs(data);
                    setLoading(false);
                })
                .catch(err => {
                    console.error(err);
                    setLoading(false);
                });
        }
    }, [user]);

    useEffect(() => {
        if (location.state?.openJobId && jobs.length > 0) {
            setExpandedJob(location.state.openJobId);
            // Clear state to prevent re-opening on manual navigation (optional structure)
            window.history.replaceState({}, document.title);
        }
    }, [location.state, jobs]);

    const handleDelete = async (jobId: string) => {
        // Optimistic update
        setJobs(prev => prev.filter(j => j.id !== jobId));

        try {
            const res = await fetch(`/api/jobs/${jobId}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                toast.success('Job deleted successfully');
            } else {
                // Revert if failed
                toast.error('Failed to delete job');
                window.location.reload();
            }
        } catch (e) {
            toast.error('Network error');
            window.location.reload();
        }
    };

    const handleAction = async (appId: string, action: 'accept' | 'reject') => {
        try {
            const res = await fetch(`/api/applications/${appId}/${action}`, {
                method: 'POST'
            });
            if (res.ok) {
                toast.success(`Application ${action}ed!`);
                window.location.reload();
            } else {
                toast.error('Action failed');
            }
        } catch (e) {
            toast.error('Network error');
        }
    };

    const handleComplete = async () => {
        if (!selectedJob) return;
        try {
            const res = await fetch(`/api/jobs/${selectedJob.id}/complete`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rating, review })
            });
            if (res.ok) {
                toast.success('Job completed and review submitted!');
                setReviewOpen(false);
                window.location.reload();
            } else {
                toast.error('Failed to submit review');
            }
        } catch (e) {
            toast.error('Network error');
        }
    };

    if (loading) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-background">
            <Navigation />

            {/* Review Dialog Overlay */}
            {reviewOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white rounded-2xl p-6 max-w-md w-full"
                    >
                        <h2 className="text-xl font-bold mb-4">Job Completed! Rate Worker</h2>
                        <div className="flex gap-2 justify-center mb-6">
                            {[1, 2, 3, 4, 5].map(star => (
                                <button key={star} onClick={() => setRating(star)}>
                                    <Star className={`w-8 h-8 ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                                </button>
                            ))}
                        </div>
                        <textarea
                            className="w-full border rounded-lg p-3 mb-4"
                            placeholder="How was their work?"
                            rows={3}
                            value={review}
                            onChange={e => setReview(e.target.value)}
                        />
                        <div className="flex gap-2 justify-end">
                            <Button variant="ghost" onClick={() => setReviewOpen(false)}>Cancel</Button>
                            <Button onClick={handleComplete}>Submit Review</Button>
                        </div>
                    </motion.div>
                </div>
            )}

            <main className="max-w-4xl mx-auto px-4 py-8">
                <h1 className="font-display text-3xl font-bold mb-6">My Posted Jobs</h1>

                <div className="space-y-4">
                    {jobs.length === 0 ? (
                        <EmptyState
                            icon={FilePlus}
                            title="No Jobs Posted Yet"
                            description="You haven't posted any work yet. Start by posting a job to find skilled workers."
                            actionLabel="Post Your First Job"
                            onAction={() => navigate('/give-work')}
                        />
                    ) : (
                        jobs.map((job) => (
                            <motion.div
                                key={job.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="glass-card rounded-2xl p-6"
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${job.status === 'open' ? 'bg-green-100 text-green-700' :
                                                job.status === 'hold' ? 'bg-yellow-100 text-yellow-700' :
                                                    job.status === 'locked' ? 'bg-red-100 text-red-700' :
                                                        job.status === 'completed' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                {job.status === 'hold' ? 'PENDING APPROVAL' : job.status.toUpperCase()}
                                            </span>
                                            <span className="text-sm text-muted-foreground">{job.postedAt}</span>
                                        </div>
                                        <h3 className="text-xl font-bold">{job.title}</h3>
                                        <p className="text-muted-foreground mt-1">₹{job.amount.min} - ₹{job.amount.max}</p>

                                        {/* Action Buttons */}
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={(e: React.MouseEvent) => {
                                                    e.stopPropagation();
                                                    navigate(`/chat/${job.id}`);
                                                }}
                                            >
                                                <MessageCircle className="w-4 h-4 mr-1" />
                                                Chat
                                            </Button>

                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleDelete(job.id); }}
                                            >
                                                <X className="w-4 h-4 mr-1" /> Delete
                                            </Button>
                                        </div>

                                        {/* Complete Button */}
                                        {(job.status === 'accepted' || job.status === 'locked') && (
                                            <Button
                                                className="mt-3 bg-indigo-600 text-white hover:bg-indigo-700 w-full md:w-auto"
                                                onClick={(e: React.MouseEvent) => {
                                                    e.stopPropagation();
                                                    setSelectedJob(job);
                                                    setReviewOpen(true);
                                                }}
                                            >
                                                <Check className="w-4 h-4 mr-2" /> Mark Completed & Review
                                            </Button>
                                        )}
                                    </div>

                                    <Button
                                        variant="outline"
                                        onClick={() => setExpandedJob(expandedJob === job.id ? null : job.id)}
                                    >
                                        {job.applications.length} Applications
                                        {expandedJob === job.id ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
                                    </Button>
                                </div>

                                <AnimatePresence>
                                    {expandedJob === job.id && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden mt-4 pt-4 border-t"
                                        >
                                            {job.applications.length === 0 ? (
                                                <p className="text-center text-muted-foreground py-4">No waiting applications.</p>
                                            ) : (
                                                <div className="space-y-3">
                                                    {job.applications.map((app: any) => (
                                                        <div key={app.id} className="flex items-center justify-between bg-muted/30 p-4 rounded-xl">
                                                            <div 
                                                                className="flex items-center gap-3 cursor-pointer hover:opacity-85 transition-opacity"
                                                                onClick={() => navigate(`/profile?userId=${app.workerId}`)}
                                                                title="View Worker Profile"
                                                            >
                                                                <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 font-bold">
                                                                    {app.workerName[0]}
                                                                </div>
                                                                <div>
                                                                    <p className="font-semibold text-rose-dark hover:underline">{app.workerName}</p>
                                                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                                        <Star className="w-3 h-3 text-gold fill-gold" />
                                                                        <span>{app.workerRating}</span>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {app.status === 'pending' ? (
                                                                <div className="flex gap-2">
                                                                    <Button size="sm" variant="destructive" onClick={() => handleAction(app.id, 'reject')}>
                                                                        <X className="w-4 h-4 mr-1" /> Reject
                                                                    </Button>
                                                                    <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleAction(app.id, 'accept')}>
                                                                        <Check className="w-4 h-4 mr-1" /> Accept
                                                                    </Button>
                                                                </div>
                                                            ) : (
                                                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${app.status === 'accepted' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                                    }`}>
                                                                    {app.status}
                                                                </span>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))
                    )}
                </div>
            </main>
        </div>
    );
};
export default MyPostings;
