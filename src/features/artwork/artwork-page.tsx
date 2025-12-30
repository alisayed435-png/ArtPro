/**
 * Artwork Page Component
 * Grid/list view of artwork with filtering and approval actions
 */

import { useState, useMemo } from 'react';
import {
  Plus,
  Grid3X3,
  List,
  Search,
  Eye,
  CheckCircle2,
  Trash2,
  MoreHorizontal,
  Download,
  FileImage,
  Clock,
  User,
} from 'lucide-react';
import {
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Card,
  CardContent,
  Badge,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  Skeleton,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui';
import { PageHeader, EmptyState, ErrorState, ConfirmDialog, StatusBadge } from '@/components/shared';
import { useArtworkQuery, useDeleteArtworkMutation } from './hooks';
import { ArtworkUploadDialog } from './artwork-upload';
import { ArtworkApprovalDialog } from './artwork-approval';
import { formatDate } from '@/lib/utils';
import type { Artwork, ArtworkStatus } from '@/lib/types';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Status' },
  { value: 'draft', label: 'Draft' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'in_review', label: 'In Review' },
  { value: 'changes_requested', label: 'Changes Requested' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

const PRODUCT_OPTIONS = [
  { value: 'all', label: 'All Products' },
  { value: 'jar', label: 'Jars' },
  { value: 'pouch', label: 'Pouches' },
  { value: 'tube', label: 'Tubes' },
  { value: 'box', label: 'Boxes' },
  { value: 'label', label: 'Labels' },
];

function getStatusConfig(status: ArtworkStatus): { variant: 'default' | 'success' | 'warning' | 'destructive' | 'secondary'; label: string } {
  const configs: Record<ArtworkStatus, { variant: 'default' | 'success' | 'warning' | 'destructive' | 'secondary'; label: string }> = {
    draft: { variant: 'secondary', label: 'Draft' },
    submitted: { variant: 'default', label: 'Submitted' },
    in_review: { variant: 'secondary', label: 'In Review' },
    changes_requested: { variant: 'warning', label: 'Changes Requested' },
    approved: { variant: 'success', label: 'Approved' },
    rejected: { variant: 'destructive', label: 'Rejected' },
  };
  return configs[status];
}

function ArtworkGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <Skeleton className="h-40 w-full" />
          <CardContent className="p-4 space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-6 w-20" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ArtworkCard({
  artwork,
  onView,
  onApproval,
  onDelete,
}: {
  artwork: Artwork;
  onView: (artwork: Artwork) => void;
  onApproval: (artwork: Artwork) => void;
  onDelete: (artwork: Artwork) => void;
}) {
  const statusConfig = getStatusConfig(artwork.status);

  return (
    <Card className="overflow-hidden group hover:shadow-md transition-shadow">
      {/* Thumbnail */}
      <div
        className="relative h-40 bg-muted flex items-center justify-center cursor-pointer"
        onClick={() => onView(artwork)}
      >
        {artwork.thumbnailUrl ? (
          <img
            src={artwork.thumbnailUrl}
            alt={artwork.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <FileImage className="h-16 w-16 text-muted-foreground" />
        )}
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
          <Button variant="secondary" size="sm">
            <Eye className="mr-2 h-4 w-4" />
            View
          </Button>
        </div>
      </div>

      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="font-medium truncate" title={artwork.name}>
              {artwork.name}
            </h3>
            <p className="text-sm text-muted-foreground capitalize">{artwork.productType}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(artwork)}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Download className="mr-2 h-4 w-4" />
                Download
              </DropdownMenuItem>
              {artwork.status !== 'approved' && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onApproval(artwork)}>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Review Artwork
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => onDelete(artwork)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center text-xs text-muted-foreground">
                  <Clock className="mr-1 h-3 w-3" />
                  {formatDate(artwork.updatedAt)}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Last updated</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {artwork.description && (
          <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
            {artwork.description}
          </p>
        )}

        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <User className="h-3 w-3" />
          <span>v{artwork.version}</span>
          {artwork.revisionComment && (
            <span className="truncate">• {artwork.revisionComment}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function ArtworkListItem({
  artwork,
  onView,
  onApproval,
  onDelete,
}: {
  artwork: Artwork;
  onView: (artwork: Artwork) => void;
  onApproval: (artwork: Artwork) => void;
  onDelete: (artwork: Artwork) => void;
}) {
  const statusConfig = getStatusConfig(artwork.status);

  return (
    <div className="flex items-center gap-4 p-4 border-b last:border-b-0 hover:bg-muted/50 transition-colors">
      {/* Thumbnail */}
      <div
        className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 cursor-pointer overflow-hidden"
        onClick={() => onView(artwork)}
      >
        {artwork.thumbnailUrl ? (
          <img
            src={artwork.thumbnailUrl}
            alt={artwork.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <FileImage className="h-8 w-8 text-muted-foreground" />
        )}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="font-medium truncate">{artwork.name}</h3>
          <Badge variant={statusConfig.variant} className="flex-shrink-0">
            {statusConfig.label}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground capitalize">{artwork.productType} • v{artwork.version}</p>
        {artwork.description && (
          <p className="text-sm text-muted-foreground truncate mt-1">{artwork.description}</p>
        )}
      </div>

      {/* Meta */}
      <div className="hidden sm:flex flex-col items-end gap-1 flex-shrink-0">
        <span className="text-sm text-muted-foreground">{formatDate(artwork.updatedAt)}</span>
        <span className="text-xs text-muted-foreground">{artwork.fileType}</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {artwork.status !== 'approved' && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={() => onApproval(artwork)}>
                  <CheckCircle2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Review Artwork</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onView(artwork)}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Download className="mr-2 h-4 w-4" />
              Download
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => onDelete(artwork)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

export function ArtworkPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [productFilter, setProductFilter] = useState('all');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [approvalArtwork, setApprovalArtwork] = useState<Artwork | null>(null);
  const [deleteArtwork, setDeleteArtwork] = useState<Artwork | null>(null);
  const [viewArtwork, setViewArtwork] = useState<Artwork | null>(null);

  const { data: artworkResponse, isLoading, isError, refetch } = useArtworkQuery();
  const deleteMutation = useDeleteArtworkMutation();

  // Extract artwork array from paginated response
  const artworkList = artworkResponse?.data ?? [];

  // Filter artwork
  const filteredArtwork = useMemo(() => {
    if (!artworkList || artworkList.length === 0) return [];

    return artworkList.filter((item: Artwork) => {
      // Search filter
      if (search) {
        const searchLower = search.toLowerCase();
        const matches =
          item.name.toLowerCase().includes(searchLower) ||
          item.productType.toLowerCase().includes(searchLower) ||
          item.description?.toLowerCase().includes(searchLower);
        if (!matches) return false;
      }

      // Status filter
      if (statusFilter !== 'all' && item.status !== statusFilter) {
        return false;
      }

      // Product filter
      if (productFilter !== 'all' && item.productType !== productFilter) {
        return false;
      }

      return true;
    });
  }, [artworkList, search, statusFilter, productFilter]);

  const handleDelete = async () => {
    if (!deleteArtwork) return;
    await deleteMutation.mutateAsync(deleteArtwork.id);
    setDeleteArtwork(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Artwork"
          description="Manage your packaging artwork and designs"
        />
        <ArtworkGridSkeleton />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Artwork"
          description="Manage your packaging artwork and designs"
        />
        <ErrorState
          title="Failed to load artwork"
          description="There was an error loading your artwork. Please try again."
          onRetry={refetch}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Artwork"
        description="Manage your packaging artwork and designs"
        action={
          <Button onClick={() => setUploadOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Upload Artwork
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search artwork..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={productFilter} onValueChange={setProductFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Product" />
            </SelectTrigger>
            <SelectContent>
              {PRODUCT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="border-l pl-2 ml-2 flex items-center gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                    size="icon"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Grid View</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                    size="icon"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>List View</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>

      {/* Content */}
      {filteredArtwork.length === 0 ? (
        <EmptyState
          title={artworkList.length === 0 ? 'No artwork yet' : 'No matching artwork'}
          description={
            artworkList.length === 0
              ? 'Upload your first artwork to get started with the approval process.'
              : 'Try adjusting your search or filters to find what you\'re looking for.'
          }
          action={
            artworkList.length === 0 ? (
              <Button onClick={() => setUploadOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Upload Artwork
              </Button>
            ) : undefined
          }
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredArtwork.map((item: Artwork) => (
            <ArtworkCard
              key={item.id}
              artwork={item}
              onView={setViewArtwork}
              onApproval={setApprovalArtwork}
              onDelete={setDeleteArtwork}
            />
          ))}
        </div>
      ) : (
        <Card>
          {filteredArtwork.map((item: Artwork) => (
            <ArtworkListItem
              key={item.id}
              artwork={item}
              onView={setViewArtwork}
              onApproval={setApprovalArtwork}
              onDelete={setDeleteArtwork}
            />
          ))}
        </Card>
      )}

      {/* Results count */}
      {filteredArtwork.length > 0 && (
        <p className="text-sm text-muted-foreground">
          Showing {filteredArtwork.length} of {artworkList.length || 0} artwork
        </p>
      )}

      {/* Upload Dialog */}
      <ArtworkUploadDialog open={uploadOpen} onOpenChange={setUploadOpen} />

      {/* Approval Dialog */}
      <ArtworkApprovalDialog
        artwork={approvalArtwork}
        open={!!approvalArtwork}
        onOpenChange={(open) => !open && setApprovalArtwork(null)}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteArtwork}
        onOpenChange={(open) => !open && setDeleteArtwork(null)}
        title="Delete Artwork"
        description={`Are you sure you want to delete "${deleteArtwork?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
        loading={deleteMutation.isPending}
      />

      {/* View Artwork Dialog (simplified preview) */}
      {viewArtwork && (
        <Dialog open={!!viewArtwork} onOpenChange={(open) => !open && setViewArtwork(null)}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>{viewArtwork.name}</DialogTitle>
              <DialogDescription>Version {viewArtwork.version}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {/* Preview */}
              <div className="bg-muted rounded-lg h-64 flex items-center justify-center">
                {viewArtwork.thumbnailUrl ? (
                  <img
                    src={viewArtwork.thumbnailUrl}
                    alt={viewArtwork.name}
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <FileImage className="h-24 w-24 text-muted-foreground" />
                )}
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Product Type</p>
                  <p className="font-medium capitalize">{viewArtwork.productType}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <StatusBadge status={viewArtwork.status} />
                </div>
                <div>
                  <p className="text-muted-foreground">File Type</p>
                  <p className="font-medium uppercase">{viewArtwork.fileType}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Uploaded</p>
                  <p className="font-medium">{formatDate(viewArtwork.createdAt)}</p>
                </div>
              </div>

              {viewArtwork.description && (
                <div>
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="text-sm">{viewArtwork.description}</p>
                </div>
              )}

              {viewArtwork.revisionComment && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    Revision Comment
                  </p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                    {viewArtwork.revisionComment}
                  </p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setViewArtwork(null)}>
                Close
              </Button>
              {viewArtwork.status !== 'approved' && (
                <Button
                  onClick={() => {
                    setApprovalArtwork(viewArtwork);
                    setViewArtwork(null);
                  }}
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Review
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
