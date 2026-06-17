import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import Navigation from '../components/Navigation';
import { toast } from 'sonner';
import {
    Briefcase, Star, Clock, Check, X, ChevronDown, ChevronUp, User, MessageCircle, AlertCircle
} from 'lucide-react';
import EmptyState from '../components/EmptyState';

const MyTasks = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [jobs, setJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedJob, setExpandedJob] = useState<string | null>(null);

    useEffect(() => {
        if (user) {
            fetch('/api/my-applications', {
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

    if (loading) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-background">
            <Navigation />

            <main className="max-w-4xl mx-auto px-4 py-8">
                <h1 className="font-display text-3xl font-bold mb-6">My Tasks</h1>

                {jobs.length === 0 ? (
                    <EmptyState
                        icon={Briefcase}
                        title="No tasks yet"
                        description="You haven't applied for any jobs yet."
                        actionLabel="Find Work"
                        onAction={() => navigate('/take-work')}
                    />
                ) : (
                    <div className="space-y-4">
                        {jobs.map((job) => (
                            <motion.div
                                key={job.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="glass-card rounded-2xl p-6"
                            >
                                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${job.myApplicationStatus === 'accepted' ? 'bg-green-100 text-green-700' :
                                                job.myApplicationStatus === 'rejected' ? 'bg-red-100 text-red-700' :
                                                    'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {job.myApplicationStatus === 'pending' ? 'PENDING APPROVAL' : job.myApplicationStatus.toUpperCase()}
                                            </span>
                                            <span className="text-sm text-muted-foreground">{job.postedAt}</span>
                                        </div>
                                        <h3 className="text-xl font-bold">{job.title}</h3>
                                        <p className="text-muted-foreground mt-1 mb-2">₹{job.amount.min} - ₹{job.amount.max}</p>

                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <User className="w-4 h-4" />
                                            <span>Posted by {job.customerName}</span>
                                            {job.customerRating && (
                                                <div className="flex items-center gap-1 ml-2">
                                                    <Star className="w-3 h-3 text-gold fill-gold" />
                                                    <span>{job.customerRating}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2 min-w-[140px]">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => navigate(`/chat/${job.id}`)}
                                            className="w-full"
                                        >
                                            <MessageCircle className="w-4 h-4 mr-2" />
                                            Chat
                                        </Button>

                                        {job.myApplicationStatus === 'accepted' && (
                                            <div className="bg-green-50 p-2 rounded text-xs text-green-700 text-center border border-green-100">
                                                <Check className="w-4 h-4 mx-auto mb-1" />
                                                You are hired!
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default MyTasks;
