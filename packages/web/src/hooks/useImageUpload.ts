import { useState, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { uploadApi, type UploadImageResponse, type UploadUserAvatarResponse } from '@/api/upload';

export interface ImageUploadOptions {
  maxSizeMB?: number;
  allowedFormats?: string[];
  onSuccess?: (result: UploadImageResponse | UploadUserAvatarResponse) => void;
  onError?: (error: string) => void;
}

export interface UseImageUploadReturn {
  uploadImage: (file: File, folder?: string) => Promise<UploadImageResponse | undefined>;
  uploadUserAvatar: (file: File, userId?: string) => Promise<UploadUserAvatarResponse | undefined>;
  isUploading: boolean;
  error: string | null;
  progress: number;
}

const DEFAULT_MAX_SIZE_MB = 5;
const DEFAULT_ALLOWED_FORMATS = ['image/png', 'image/jpeg', 'image/jpg'];

/**
 * Hook for handling image uploads to Cloudinary
 * Validates file size and format before upload
 */
export function useImageUpload(options: ImageUploadOptions = {}): UseImageUploadReturn {
  const { maxSizeMB = DEFAULT_MAX_SIZE_MB, allowedFormats = DEFAULT_ALLOWED_FORMATS, onSuccess, onError } = options;
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);

  /**
   * Validate file before upload
   */
  const validateFile = useCallback(
    (file: File): string | null => {
      // Check file type
      if (!allowedFormats.includes(file.type)) {
        return `File must be one of: ${allowedFormats.join(', ')}`;
      }

      // Check file size
      const maxSizeBytes = maxSizeMB * 1024 * 1024;
      if (file.size > maxSizeBytes) {
        return `File size must be less than ${maxSizeMB}MB`;
      }

      // Check if file is empty
      if (file.size === 0) {
        return 'File is empty';
      }

      return null;
    },
    [maxSizeMB, allowedFormats]
  );

  // Mutation for uploading image
  const uploadImageMutation = useMutation({
    mutationFn: async ({ file, folder }: { file: File; folder?: string }) => {
      setError(null);
      setProgress(0);

      const validationError = validateFile(file);
      if (validationError) {
        throw new Error(validationError);
      }

      // Simulate progress (Cloudinary doesn't provide progress events in this setup)
      setProgress(0.3);
      const result = await uploadApi.uploadImage(file, folder);
      setProgress(1);
      return result;
    },
    onSuccess: (data) => {
      setProgress(0);
      onSuccess?.(data);
    },
    onError: (err: Error) => {
      setProgress(0);
      const errorMessage = err.message || 'Upload failed';
      setError(errorMessage);
      onError?.(errorMessage);
    },
  });

  // Mutation for uploading user avatar
  const uploadUserAvatarMutation = useMutation({
    mutationFn: async ({ file, userId }: { file: File; userId?: string }) => {
      setError(null);
      setProgress(0);

      const validationError = validateFile(file);
      if (validationError) {
        throw new Error(validationError);
      }

      // Simulate progress
      setProgress(0.3);
      const result = await uploadApi.uploadUserAvatar(file, userId);
      setProgress(1);
      return result;
    },
    onSuccess: (data) => {
      setProgress(0);
      onSuccess?.(data);
    },
    onError: (err: Error) => {
      setProgress(0);
      const errorMessage = err.message || 'Upload failed';
      setError(errorMessage);
      onError?.(errorMessage);
    },
  });

  const uploadImage = useCallback(
    async (file: File, folder?: string): Promise<UploadImageResponse | undefined> => {
      try {
        return await uploadImageMutation.mutateAsync({ file, folder });
      } catch (err) {
        // Error is handled by mutation
        return undefined;
      }
    },
    [uploadImageMutation]
  );

  const uploadUserAvatar = useCallback(
    async (file: File, userId?: string): Promise<UploadUserAvatarResponse | undefined> => {
      try {
        return await uploadUserAvatarMutation.mutateAsync({ file, userId });
      } catch (err) {
        // Error is handled by mutation
        return undefined;
      }
    },
    [uploadUserAvatarMutation]
  );

  return {
    uploadImage,
    uploadUserAvatar,
    isUploading: uploadImageMutation.isPending || uploadUserAvatarMutation.isPending,
    error,
    progress,
  };
}

