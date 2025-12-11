import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dna, GitMerge, Sparkles, Zap, Trophy, AlertCircle } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";

const activityIcons = {
    mutation: { icon: Dna, color: 'text-violet-400', bg: 'bg-violet-500/20' },
    crossover: { icon: GitMerge, color: 'text-teal-400', bg: 'bg-teal-500/20' },
    evaluation: { icon: Zap, color: 'text-amber-400', bg: 'bg-amber-500/20' },
    selection: { icon: Sparkles, color: 'text-blue-400', bg: 'bg-blue-500/20' },
    newBest: { icon: Trophy, color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
    error: { icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-500/20' },
};

export default function ActivityFeed({ activities = [] }) {
    return (
        <div className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-slate-400">Live Evolution Feed</h3>
                <div className="flex items-center gap-1.5">
                    <motion.div
                        className="w-2 h-2 rounded-full bg-emerald-500"
                        animate={{ opacity: [1, 0.5, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                    />
                    <span className="text-xs text-emerald-400">Live</span>
                </div>
            </div>

            <ScrollArea className="flex-1 pr-3">
                <div className="space-y-2">
                    <AnimatePresence mode="popLayout">
                        {activities.map((activity, index) => {
                            const config = activityIcons[activity.type] || activityIcons.evaluation;
                            const Icon = config.icon;

                            return (
                                <motion.div
                                    key={activity.id || index}
                                    initial={{ opacity: 0, x: -20, height: 0 }}
                                    animate={{ opacity: 1, x: 0, height: 'auto' }}
                                    exit={{ opacity: 0, x: 20, height: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50"
                                >
                                    <div className={`p-2 rounded-lg ${config.bg}`}>
                                        <Icon className={`w-4 h-4 ${config.color}`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-slate-200">{activity.message}</p>
                                        {activity.details && (
                                            <p className="text-xs text-slate-500 mt-1 truncate">
                                                {activity.details}
                                            </p>
                                        )}
                                        <span className="text-xs text-slate-600 mt-1 block">
                                            {activity.timestamp || 'Just now'}
                                        </span>
                                    </div>
                                    {activity.score !== undefined && (
                                        <div className={`px-2 py-1 rounded-lg text-xs font-semibold ${activity.score >= 80 ? 'bg-emerald-500/20 text-emerald-400' :
                                                activity.score >= 60 ? 'bg-violet-500/20 text-violet-400' :
                                                    activity.score >= 40 ? 'bg-amber-500/20 text-amber-400' :
                                                        'bg-red-500/20 text-red-400'
                                            }`}>
                                            {activity.score}
                                        </div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>

                    {activities.length === 0 && (
                        <div className="text-center py-8">
                            <Dna className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                            <p className="text-sm text-slate-500">No activity yet</p>
                            <p className="text-xs text-slate-600 mt-1">Start evolution to see live updates</p>
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>
    );
}