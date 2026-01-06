import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Bookmark, Loader2 } from 'lucide-react';

type SaveSnapshotDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (name: string) => void;
    defaultName?: string;
    generation?: number;
    isSaving?: boolean;
};

export default function SaveSnapshotDialog({
    open,
    onOpenChange,
    onSave,
    defaultName = '',
    generation = 0,
    isSaving = false
}: SaveSnapshotDialogProps) {
    const [name, setName] = useState(defaultName);

    const handleSave = () => {
        if (name.trim()) {
            onSave(name.trim());
            setName('');
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-slate-900 border-slate-700 text-white">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Bookmark className="w-5 h-5 text-blue-400" />
                        Save Manual Snapshot
                    </DialogTitle>
                    <DialogDescription className="text-slate-400">
                        Create a named checkpoint of the current evolution state at Generation {generation}.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="snapshot-name" className="text-slate-300">
                            Snapshot Name
                        </Label>
                        <Input
                            id="snapshot-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., Best approach so far, Before major change..."
                            className="bg-slate-800/50 border-slate-700 text-slate-200"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !isSaving) {
                                    handleSave();
                                }
                            }}
                            disabled={isSaving}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isSaving}
                        className="border-slate-700 text-slate-300 hover:bg-slate-800"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={!name.trim() || isSaving}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Bookmark className="w-4 h-4 mr-2" />
                                Save Snapshot
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}