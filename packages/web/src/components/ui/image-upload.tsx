import { useState, useRef, useCallback } from 'react';
import { useImageUpload } from '@/hooks/useImageUpload';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

export interface ImageUploadProps {
  /**
   * Current image URL to display
   */
  currentImageUrl?: string | null;
  /**
   * Callback when image is uploaded successfully
   */
  onUploadSuccess?: (url: string, publicId: string) => void;
  /**
   * Callback when upload fails
   */
  onUploadError?: (error: string) => void;
  /**
   * Whether to upload as user avatar (updates user record)
   */
  uploadAsAvatar?: boolean;
  /**
   * User ID for avatar upload
   */
  userId?: string;
  /**
   * Folder path in Cloudinary
   */
  folder?: string;
  /**
   * Maximum file size in MB (default: 5MB)
   */
  maxSizeMB?: number;
  /**
   * Allowed file formats (default: PNG, JPG)
   */
  allowedFormats?: string[];
  /**
   * Custom className
   */
  className?: string;
  /**
   * Size variant
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Show preview
   */
  showPreview?: boolean;
  /**
   * Disabled state
   */
  disabled?: boolean;
}

const sizeClasses = {
  sm: 'h-16 w-16',
  md: 'h-24 w-24',
  lg: 'h-32 w-32',
};

export function ImageUpload({
  currentImageUrl,
  onUploadSuccess,
  onUploadError,
  uploadAsAvatar = false,
  userId,
  folder,
  maxSizeMB = 5,
  allowedFormats = ['image/png', 'image/jpeg', 'image/jpg'],
  className,
  size = 'md',
  showPreview = true,
  disabled = false,
}: ImageUploadProps) {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null);

  const { uploadImage, uploadUserAvatar, isUploading, error, progress } = useImageUpload({
    maxSizeMB,
    allowedFormats,
    onSuccess: (result) => {
      if (result.url) {
        setPreview(result.url);
        onUploadSuccess?.(result.url, result.publicId);
      }
    },
    onError: (err) => {
      onUploadError?.(err);
    },
  });

  const handleFileSelect = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload file
      if (uploadAsAvatar) {
        await uploadUserAvatar(file, userId);
      } else {
        await uploadImage(file, folder);
      }

      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [uploadAsAvatar, userId, folder, uploadImage, uploadUserAvatar]
  );

  const handleRemove = useCallback(() => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const handleClick = () => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click();
    }
  };

  const displayImage = preview || currentImageUrl;
  const initials = currentImageUrl ? 'U' : '';

  return (
    <div className={cn('flex flex-col items-center gap-4', className)}>
      {showPreview && (
        <div className="relative">
          <Avatar className={cn(sizeClasses[size], 'border-2 border-border')}>
            <AvatarImage src={displayImage || undefined} alt="Preview" />
            <AvatarFallback className="text-lg">
              {displayImage ? <ImageIcon className="h-6 w-6" /> : initials}
            </AvatarFallback>
          </Avatar>
          {displayImage && !disabled && (
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
              onClick={handleRemove}
              disabled={isUploading}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      )}

      <div className="flex flex-col items-center gap-2 w-full">
        <input
          ref={fileInputRef}
          type="file"
          accept={allowedFormats.join(',')}
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled || isUploading}
        />

        <Button
          type="button"
          variant="outline"
          onClick={handleClick}
          disabled={disabled || isUploading}
          className="w-full"
        >
          {isUploading ? (
            <>
              <Upload className="mr-2 h-4 w-4 animate-pulse" />
              {t('common.uploading') || 'Uploading...'}
            </>
          ) : displayImage ? (
            <>
              <Upload className="mr-2 h-4 w-4" />
              {t('common.changeImage') || 'Change Image'}
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              {t('common.uploadImage') || 'Upload Image'}
            </>
          )}
        </Button>

        {isUploading && progress > 0 && (
          <Progress value={progress * 100} className="w-full" />
        )}

        {error && (
          <p className="text-sm text-destructive text-center">{error}</p>
        )}

        <p className="text-xs text-muted-foreground text-center">
          {t('common.imageUploadHint') || `Max ${maxSizeMB}MB, PNG or JPG`}
        </p>
      </div>
    </div>
  );
}

