import { Button } from './ui/button';
import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
    className?: string;
}

const EmptyState = ({ icon: Icon, title, description, actionLabel, onAction, className = '' }: EmptyStateProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex flex-col items-center justify-center text-center p-12 glass-card rounded-3xl border-2 border-dashed border-border/50 ${className}`}
        >
            <div className="w-20 h-20 bg-muted/30 rounded-full flex items-center justify-center mb-6 ring-8 ring-muted/10">
                <Icon className="w-10 h-10 text-muted-foreground/60" />
            </div>

            <h3 className="text-2xl font-display font-bold text-foreground mb-3">
                {title}
            </h3>

            <p className="text-muted-foreground max-w-sm mb-8 text-lg leading-relaxed">
                {description}
            </p>

            {actionLabel && onAction && (
                <Button
                    size="lg"
                    onClick={onAction}
                    className="font-semibold shadow-lg shadow-rose/20"
                >
                    {actionLabel}
                </Button>
            )}
        </motion.div>
    );
};

export default EmptyState;
