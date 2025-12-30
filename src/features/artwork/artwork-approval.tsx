/**
 * Artwork Approval Dialog Component
 */

import { useState } from 'react';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Button,
  Textarea,
  Label,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui';
import { useApproveArtworkMutation, useRequestChangesMutation } from './hooks';
import type { Artwork } from '@/lib/types';

interface ArtworkApprovalDialogProps {
  artwork: Artwork | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ArtworkApprovalDialog({ artwork, open, onOpenChange }: ArtworkApprovalDialogProps) {
  const [activeTab, setActiveTab] = useState<'approve' | 'changes'>('approve');
  const [approvalComment, setApprovalComment] = useState('');
  const [changesComment, setChangesComment] = useState('');

  const approveMutation = useApproveArtworkMutation();
  const requestChangesMutation = useRequestChangesMutation();

  const handleApprove = async () => {
    if (!artwork) return;
    await approveMutation.mutateAsync({
      id: artwork.id,
      comment: approvalComment || undefined,
    });
    handleClose();
  };

  const handleRequestChanges = async () => {
    if (!artwork || !changesComment.trim()) return;
    await requestChangesMutation.mutateAsync({
      id: artwork.id,
      comment: changesComment,
    });
    handleClose();
  };

  const handleClose = () => {
    setApprovalComment('');
    setChangesComment('');
    setActiveTab('approve');
    onOpenChange(false);
  };

  if (!artwork) return null;

  const isPending = approveMutation.isPending || requestChangesMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Review Artwork</DialogTitle>
          <DialogDescription>
            Review and provide feedback on "{artwork.name}"
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'approve' | 'changes')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="approve" className="gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Approve
            </TabsTrigger>
            <TabsTrigger value="changes" className="gap-2">
              <AlertCircle className="h-4 w-4" />
              Request Changes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="approve" className="mt-4">
            <div className="space-y-3">
              <div>
                <Label htmlFor="approval-comment">Comment (Optional)</Label>
                <Textarea
                  id="approval-comment"
                  value={approvalComment}
                  onChange={(e) => setApprovalComment(e.target.value)}
                  placeholder="Add any notes about the approval..."
                  className="mt-1.5"
                  rows={3}
                />
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                <p className="text-sm text-green-800 dark:text-green-200">
                  Approving this artwork will mark it ready for production use.
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="changes" className="mt-4">
            <div className="space-y-3">
              <div>
                <Label htmlFor="changes-comment">Required Changes *</Label>
                <Textarea
                  id="changes-comment"
                  value={changesComment}
                  onChange={(e) => setChangesComment(e.target.value)}
                  placeholder="Describe the changes needed..."
                  className="mt-1.5"
                  rows={4}
                  required
                />
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  The artwork creator will be notified and asked to submit a revised version.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isPending}>
            Cancel
          </Button>
          {activeTab === 'approve' ? (
            <Button onClick={handleApprove} disabled={isPending}>
              {approveMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Approving...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Approve Artwork
                </>
              )}
            </Button>
          ) : (
            <Button
              variant="secondary"
              onClick={handleRequestChanges}
              disabled={isPending || !changesComment.trim()}
            >
              {requestChangesMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <AlertCircle className="mr-2 h-4 w-4" />
                  Request Changes
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
