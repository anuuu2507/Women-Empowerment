import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Send, Phone, Video, ArrowLeft, MoreVertical, Image as ImageIcon, Mic } from 'lucide-react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import Navigation from '../components/Navigation';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../components/ui/sheet';
import { Badge } from '../components/ui/badge';
import { ScrollArea } from '../components/ui/scroll-area';

const Chat = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const location = useLocation();
    const { user } = useAuth();
    const scrollRef = useRef<HTMLDivElement>(null);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState<any[]>([]);
    const [job, setJob] = useState<any>(location.state?.job || null);

    const fetchMessages = async () => {
        if (!id) return;
        try {
            const res = await fetch(`http://localhost:5000/api/messages/${id}`);
            if (res.ok) {
                const data = await res.json();
                setMessages(data);
            }
        } catch (error) {
            console.error("Failed to fetch messages", error);
        }
    };

    const fetchJobDetails = async () => {
        if (job) return; // Don't fetch if we already have it from state
        if (!id) return;
        try {
            const res = await fetch(`http://localhost:5000/api/jobs/${id}`);
            if (res.ok) {
                const data = await res.json();
                if (data.success) {
                    setJob(data.job);
                }
            }
        } catch (error) {
            console.error("Failed to fetch job details", error);
        }
    };

    useEffect(() => {
        fetchMessages();
        fetchJobDetails();
        const interval = setInterval(fetchMessages, 1000); // Poll every 1 second
        return () => clearInterval(interval);
    }, [id]);

    // ... (rest of effects)

    const handleCall = (type: 'audio' | 'video') => {
        window.open(`https://meet.jit.si/shakthi-${id}-${type}`, '_blank');
    };

    const handleSend = async () => {
        if (!message.trim() || !user || !id) return;

        const content = message;
        setMessage(''); // Clear input

        // Optimistic Update
        const optimisticMsg = {
            id: Date.now().toString(),
            jobId: id,
            senderId: user.id,
            content: content,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, optimisticMsg]);

        try {
            await fetch('http://localhost:5000/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jobId: id,
                    senderId: user.id,
                    content: content
                })
            });
            // Don't fetch immediately to avoid race condition. Poller will catch it in <1s.
        } catch (error) {
            console.error("Failed to send message", error);
            toast.error("Message failed to send");
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navigation />

            <main className="flex-1 max-w-4xl mx-auto w-full p-4 flex flex-col h-[calc(100vh-80px)]">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-card border rounded-2xl shadow-sm flex-1 flex flex-col overflow-hidden"
                >
                    {/* Chat Header */}
                    <div className="p-4 border-b flex items-center justify-between bg-muted/30">
                        <div className="flex items-center gap-3">
                            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                            <Avatar>
                                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${job?.customerName || 'Customer'}`} />
                                <AvatarFallback>CN</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                                <h3 className="font-semibold">{job?.customerName || 'Customer'}</h3>
                                <div className="flex items-center gap-2">
                                    <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                                        {job ? `${job.title}` : 'Loading...'}
                                    </p>
                                    <Sheet>
                                        <SheetTrigger asChild>
                                            <Button variant="link" size="sm" className="h-auto p-0 text-xs text-rose-500">
                                                View Details
                                            </Button>
                                        </SheetTrigger>
                                        <SheetContent>
                                            <SheetHeader>
                                                <SheetTitle>Task Details</SheetTitle>
                                            </SheetHeader>
                                            <div className="mt-6 space-y-6">
                                                <div>
                                                    <h4 className="font-semibold text-lg">{job?.title}</h4>
                                                    <Badge variant="outline" className="mt-2 text-rose-500 border-rose-200 bg-rose-50">
                                                        {job?.category}
                                                    </Badge>
                                                </div>

                                                <div className="space-y-4 text-sm">
                                                    <div>
                                                        <label className="text-muted-foreground">Description</label>
                                                        <p className="mt-1">{job?.description}</p>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="text-muted-foreground">Budget</label>
                                                            <p className="font-medium mt-1">₹{job?.amount?.min} - ₹{job?.amount?.max}</p>
                                                        </div>
                                                        <div>
                                                            <label className="text-muted-foreground">Urgency</label>
                                                            <p className="capitalize mt-1">{job?.urgency}</p>
                                                        </div>
                                                        <div>
                                                            <label className="text-muted-foreground">Location</label>
                                                            <p className="mt-1">{job?.location}</p>
                                                        </div>
                                                        <div>
                                                            <label className="text-muted-foreground">Posted</label>
                                                            <p className="mt-1">{job?.postedAt}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </SheetContent>
                                    </Sheet>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleCall('audio')}>
                                <Phone className="w-5 h-5 text-muted-foreground" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleCall('video')}>
                                <Video className="w-5 h-5 text-muted-foreground" />
                            </Button>
                            <Button variant="ghost" size="icon">
                                <MoreVertical className="w-5 h-5 text-muted-foreground" />
                            </Button>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
                        {messages.map((msg) => (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={`flex ${msg.content.startsWith('EXT_SYSTEM:') ? 'justify-center my-4' : msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                            >
                                {msg.content.startsWith('EXT_SYSTEM:') ? (
                                    <div className="bg-muted px-4 py-1 rounded-full text-xs text-muted-foreground">
                                        {msg.content.replace('EXT_SYSTEM:', '').trim()}
                                    </div>
                                ) : (
                                    <div
                                        className={`max-w-[70%] p-3 rounded-2xl px-4 ${msg.senderId === user?.id
                                            ? 'bg-rose-500 text-white rounded-br-none shadow-md'
                                            : 'bg-purple-100 text-purple-900 rounded-bl-none shadow-sm'
                                            }`}
                                    >
                                        <p className="text-sm">{msg.content}</p>
                                        <p className={`text-[10px] mt-1 text-right ${msg.senderId === user?.id ? 'text-white/80' : 'text-purple-900/60'
                                            }`}>
                                            {msg.timestamp}
                                        </p>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                        <div ref={scrollRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-white border-t flex gap-2 items-center">
                        <Button variant="ghost" size="icon" className="shrink-0">
                            <ImageIcon className="w-5 h-5 text-muted-foreground" />
                        </Button>
                        <Input
                            placeholder="Type a message..."
                            value={message}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMessage(e.target.value)}
                            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleSend()}
                            className="rounded-full bg-muted/50 border-0 focus-visible:ring-1"
                        />
                        {message.trim() ? (
                            <Button onClick={handleSend} size="icon" className="rounded-full shrink-0 bg-rose-500 hover:bg-rose-600 text-white">
                                <Send className="w-4 h-4" />
                            </Button>
                        ) : (
                            <Button variant="ghost" size="icon" className="shrink-0">
                                <Mic className="w-5 h-5 text-muted-foreground" />
                            </Button>
                        )}
                    </div>
                </motion.div>
            </main>
        </div>
    );
};

export default Chat;
