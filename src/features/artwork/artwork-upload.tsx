/**
 * Artwork Upload Component with Drag & Drop
 */

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Image, FileText, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Button,
  Input,
  Label,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Progress,
} from '@/components/ui';
import { formatFileSize, cn } from '@/lib/utils';
import { useUploadArtworkMutation } from './hooks';
import type { ProductType } from '@/lib/types';

const productTypes: { value: ProductType; label: string }[] = [
  { value: 'pouch', label: 'Pouch' },
  { value: 'jar', label: 'Jar' },
  { value: 'tube', label: 'Tube' },
  { value: 'box', label: 'Box' },
  { value: 'label', label: 'Label' },
  { value: 'insert', label: 'Insert' },
  { value: 'other', label: 'Other' },
];

const acceptedFileTypes = {
  'application/pdf': ['.pdf'],
  'image/png': ['.png'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'application/illustrator': ['.ai'],
  'image/svg+xml': ['.svg'],
};

interface ArtworkUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ArtworkUploadDialog({ open, onOpenChange }: ArtworkUploadDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [productType, setProductType] = useState<ProductType>('pouch');
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadMutation = useUploadArtworkMutation();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      setFile(selectedFile);
      if (!name) {
        // Auto-fill name from filename (without extension)
        const fileName = selectedFile.name.replace(/\.[^/.]+$/, '');
        setName(fileName);
      }
    }
  }, [name]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: acceptedFileTypes,
    maxSize: 50 * 1024 * 1024, // 50MB
    multiple: false,
  });

  const handleSubmit = async () => {
    if (!file || !name || !productType) return;

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => Math.min(prev + 10, 90));
    }, 150);

    try {
      await uploadMutation.mutateAsync({
        file,
        name,
        description: description || undefined,
        productType,
      });
      setUploadProgress(100);
      setTimeout(() => {
        handleClose();
      }, 500);
    } finally {
      clearInterval(progressInterval);
    }
  };

  const handleClose = () => {
    setFile(null);
    setName('');
    setDescription('');
    setProductType('pouch');
    setUploadProgress(0);
    onOpenChange(false);
  };

  const removeFile = () => {
    setFile(null);
    setUploadProgress(0);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload Artwork</DialogTitle>
          <DialogDescription>
            Upload your packaging artwork for review and approval.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Drop Zone */}
          {!file ? (
            <div
              {...getRootProps()}
              className={cn(
                "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
                isDragActive && !isDragReject && "border-primary bg-primary/5",
                isDragReject && "border-destructive bg-destructive/5",
                !isDragActive && "border-muted-foreground/25 hover:border-primary/50"
              )}
            >
              <input {...getInputProps()} />
              <Upload className={cn(
                "h-10 w-10 mx-auto mb-4",
                isDragReject ? "text-destructive" : "text-muted-foreground"
              )} />
              {isDragReject ? (
                <p className="text-destructive">File type not supported</p>
              ) : isDragActive ? (
                <p className="text-primary">Drop your file here...</p>
              ) : (
                <>
                  <p className="text-sm font-medium mb-1">
                    Drop your artwork here, or click to browse
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PDF, PNG, JPG, AI, SVG up to 50MB
                  </p>
                </>
              )}
            </div>
          ) : (
            <div className="border rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded bg-muted flex items-center justify-center flex-shrink-0">
                  {file.type.startsWith('image/') ? (
                    <Image className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <FileText className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                  {uploadProgress > 0 && (
                    <Progress value={uploadProgress} className="mt-2 h-1.5" />
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 flex-shrink-0"
                  onClick={removeFile}
                  disabled={uploadMutation.isPending}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Form Fields */}
          <div className="space-y-3">
            <div>
              <Label htmlFor="name">Artwork Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., OG Kush Premium Label v2"
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="productType">Product Type</Label>
              <Select value={productType} onValueChange={(v) => setProductType(v as ProductType)}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {productTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add any notes or special instructions..."
                className="mt-1.5"
                rows={3}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={uploadMutation.isPending}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!file || !name || uploadMutation.isPending}
          >
            {uploadMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload Artwork
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
