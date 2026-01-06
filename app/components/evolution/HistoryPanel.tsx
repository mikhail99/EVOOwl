import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    History,
    Undo2,
    Trash2,
    Download,
    Search,
    Calendar,
    Trophy,
    Flag,
    Bookmark,
    Circle,
    AlertCircle,
    CheckCircle
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { format } from 'date-fns';
import type { Snapshot } from '@/api/types';

const snapshotIcons: Record<string, { icon: LucideIcon; color: string; bg: string }> = {
    manual: { icon: Bookmark, color: 'text-blue-400', bg: 'bg-blue-500/20' },
    new_champion: { icon: Trophy, color: 'text-amber-400', bg: 'bg-amber-500/20' },
    generation_complete: { icon: Circle, color: 'text-violet-400', bg: 'bg-violet-500/20' },
    evolution_complete: { icon: Flag, color: 'text-emerald-400', bg: 'bg-emerald-500/20' }
};

type HistoryPanelProps = {
    snapshots?: Snapshot[];
    currentSnapshotId: string | null;
    isViewingHistory: boolean;
    onRestore: (snapshot: Snapshot) => void;
    onDelete: (snapshotId: string) => void;
    onExport: (snapshot: Snapshot) => void;
};

export default function HistoryPanel({
    snapshots = [],
    currentSnapshotId,
    isViewingHistory,
    onRestore,
    onDelete,
    onExport
}: HistoryPanelProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [deleteTarget, setDeleteTarget] = useState<Snapshot | null>(null);

    const filteredSnapshots = snapshots.filter(snapshot =>
        snapshot.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        snapshot.problem?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const sortedSnapshots = [...filteredSnapshots].sort(
        (a, b) => new Date(b.created_date ?? 0).getTime() - new Date(a.created_date ?? 0).getTime()
    );

    return (
        <Card className="bg-slate-900/80 border-slate-700/50 backdrop-blur-xl overflow-hidden h-full flex flex-col">
            {/* Header */}
            <div className="border-b border-slate-700/50 p-4">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-violet-500/20">
                            <History className="w-4 h-4 text-violet-400" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-white">Evolution History</h3>
                            <p className="text-xs text-slate-400">{snapshots.length} snapshots saved</p>
                        </div>
                    </div>
                    {isViewingHistory && (
                        <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Viewing History
                        </Badge>
                    )}
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search snapshots..."
                        className="pl-10 bg-slate-800/50 border-slate-700 text-slate-200 text-sm"
                    />
                </div>
            </div>

            {/* Snapshots List */}
            <ScrollArea className="flex-1">
                <div className="p-4 space-y-2">
                    <AnimatePresence mode="popLayout">
                        {sortedSnapshots.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center py-8"
                            >
                                <History className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                                <p className="text-sm text-slate-400">
                                    {searchQuery ? 'No snapshots found' : 'No history yet'}
                                </p>
                                <p className="text-xs text-slate-500 mt-1">
                                    {searchQuery ? 'Try a different search' : 'Run evolution to create snapshots'}
                                </p>
                            </motion.div>
                        ) : (
                            sortedSnapshots.map((snapshot) => {
                                const config = snapshotIcons[snapshot.snapshot_type] || snapshotIcons.generation_complete;
                                const Icon = config.icon;
                                const isActive = snapshot.id === currentSnapshotId;

                                return (
                                    <motion.div
                                        key={snapshot.id}
                                        layout
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className={`p-3 rounded-xl border transition-all ${isActive
                                                ? 'bg-violet-500/10 border-violet-500/30 shadow-lg shadow-violet-500/10'
                                                : 'bg-slate-800/30 border-slate-700/50 hover:bg-slate-800/50 hover:border-slate-600/50'
                                            }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            {/* Icon */}
                                            <div className={`p-2 rounded-lg ${config.bg} flex-shrink-0`}>
                                                <Icon className={`w-4 h-4 ${config.color}`} />
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2 mb-1">
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-medium text-white text-sm truncate">
                                                            {snapshot.name}
                                                        </h4>
                                                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                                                            <span className="flex items-center gap-1">
                                                                <Calendar className="w-3 h-3" />
                                                                {snapshot.created_date
                                                                    ? format(new Date(snapshot.created_date), 'MMM d, HH:mm')
                                                                    : 'Unknown'}
                                                            </span>
                                                            <span>•</span>
                                                            <span className="font-mono">Gen {snapshot.generation}</span>
                                                        </div>
                                                    </div>
                                                    {isActive && (
                                                        <Badge className="bg-violet-500/20 text-violet-400 border-0 text-xs flex-shrink-0">
                                                            <CheckCircle className="w-3 h-3 mr-1" />
                                                            Active
                                                        </Badge>
                                                    )}
                                                </div>

                                                {/* Fitness */}
                                                {snapshot.best_fitness !== undefined && (
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                                            <motion.div
                                                                className={`h-full rounded-full ${snapshot.best_fitness >= 80 ? 'bg-emerald-500' :
                                                                        snapshot.best_fitness >= 60 ? 'bg-violet-500' :
                                                                            snapshot.best_fitness >= 40 ? 'bg-amber-500' :
                                                                                'bg-red-500'
                                                                    }`}
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${snapshot.best_fitness}%` }}
                                                                transition={{ duration: 0.5 }}
                                                            />
                                                        </div>
                                                        <span className="text-xs font-semibold text-white">
                                                            {snapshot.best_fitness.toFixed(1)}
                                                        </span>
                                                    </div>
                                                )}

                                                {/* Actions */}
                                                <div className="flex items-center gap-1 mt-3">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => onRestore(snapshot)}
                                                        disabled={isActive}
                                                        className="h-7 px-2 text-xs text-slate-300 hover:text-violet-400 hover:bg-violet-500/10"
                                                    >
                                                        <Undo2 className="w-3 h-3 mr-1" />
                                                        Restore
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => onExport(snapshot)}
                                                        className="h-7 px-2 text-xs text-slate-300 hover:text-teal-400 hover:bg-teal-500/10"
                                                    >
                                                        <Download className="w-3 h-3 mr-1" />
                                                        Export
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => setDeleteTarget(snapshot)}
                                                        className="h-7 px-2 text-xs text-slate-300 hover:text-red-400 hover:bg-red-500/10 ml-auto"
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })
                        )}
                    </AnimatePresence>
                </div>
            </ScrollArea>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
                <AlertDialogContent className="bg-slate-900 border-slate-700">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-white">Delete Snapshot?</AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-400">
                            Are you sure you want to delete "{deleteTarget?.name}"? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                if (deleteTarget) {
                                    onDelete(deleteTarget.id);
                                    setDeleteTarget(null);
                                }
                            }}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Card>
    );
}