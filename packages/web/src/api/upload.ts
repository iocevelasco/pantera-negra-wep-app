import { apiClient } from '@/lib/api-client';
import type { ApiResponse } from '@pantera-negra/shared';

export interface UploadImageResponse {
  url: string;
  publicId: string;
}

export interface UploadUserAvatarResponse extends UploadImageResponse {
  user: {
    id: string;
    picture: string;
  };
}

// Upload endpoints
export const uploadApi = {
  /**
   * Upload an image to Cloudinary
   * @param file - File to upload
   * @param folder - Optional folder path
   * @returns Upload result with URL and public ID
   */
  uploadImage: async (file: File, folder?: string): Promise<UploadImageResponse> => {
    const formData = new FormData();
    formData.append('image', file);
    if (folder) {
      formData.append('folder', folder);
    }

    const response = await apiClient.post<ApiResponse<UploadImageResponse>>(
      '/api/upload/image',
      formData
    );

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to upload image');
    }

    return response.data;
  },

  /**
   * Upload user avatar and update user record
   * @param file - File to upload
   * @param userId - Optional user ID (defaults to current user)
   * @returns Upload result with URL, public ID, and updated user
   */
  uploadUserAvatar: async (file: File, userId?: string): Promise<UploadUserAvatarResponse> => {
    const formData = new FormData();
    formData.append('image', file);
    if (userId) {
      formData.append('userId', userId);
    }

    const response = await apiClient.post<ApiResponse<UploadUserAvatarResponse>>(
      '/api/upload/user-avatar',
      formData
    );

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to upload avatar');
    }

    return response.data;
  },

  /**
   * Delete an image from Cloudinary
   * @param publicId - Public ID of the image to delete
   */
  deleteImage: async (publicId: string): Promise<void> => {
    const response = await apiClient.delete<ApiResponse<void>>(`/api/upload/${publicId}`);
    if (!response.success) {
      throw new Error(response.error || 'Failed to delete image');
    }
  },
};

