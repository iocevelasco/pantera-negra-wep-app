import { v2 as cloudinary } from 'cloudinary';
import type { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import { CLOUDINARY_CONFIG } from '../config/app.config.js';

/**
 * Interface for Cloudinary service operations
 * Following Interface Segregation Principle (ISP)
 */
export interface ICloudinaryService {
  uploadImage(file: Express.Multer.File, folder?: string): Promise<UploadResult>;
  deleteImage(publicId: string): Promise<DeleteResult>;
  getOptimizedUrl(publicId: string, options?: ImageOptions): string;
}

/**
 * Result of an upload operation
 */
export interface UploadResult {
  success: boolean;
  url?: string;
  publicId?: string;
  error?: string;
}

/**
 * Result of a delete operation
 */
export interface DeleteResult {
  success: boolean;
  error?: string;
}

/**
 * Options for image optimization
 */
export interface ImageOptions {
  width?: number;
  height?: number;
  crop?: 'auto' | 'fill' | 'fit' | 'scale';
  gravity?: 'auto' | 'face' | 'center';
  quality?: 'auto' | number;
  format?: 'auto' | 'jpg' | 'png' | 'webp';
}

/**
 * Cloudinary Service Implementation
 * Following Single Responsibility Principle (SRP)
 * Responsible only for Cloudinary operations
 */
export class CloudinaryService implements ICloudinaryService {
  private static instance: CloudinaryService;
  private initialized = false;

  private constructor() {
    this.initialize();
  }

  /**
   * Get singleton instance
   * Following Singleton pattern for configuration management
   */
  static getInstance(): CloudinaryService {
    if (!CloudinaryService.instance) {
      CloudinaryService.instance = new CloudinaryService();
    }
    return CloudinaryService.instance;
  }

  /**
   * Initialize Cloudinary configuration
   */
  private initialize(): void {
    if (this.initialized) return;

    // Configure Cloudinary
    cloudinary.config({
      cloud_name: CLOUDINARY_CONFIG.CLOUD_NAME,
      api_key: CLOUDINARY_CONFIG.API_KEY,
      api_secret: CLOUDINARY_CONFIG.API_SECRET,
    });

    this.initialized = true;
  }

  /**
   * Upload an image to Cloudinary
   * @param file - Multer file object
   * @param folder - Optional folder path in Cloudinary
   * @returns Upload result with URL and public ID
   */
  async uploadImage(file: Express.Multer.File, folder = 'users'): Promise<UploadResult> {
    try {
      // Validate file type
      if (!file.mimetype.startsWith('image/')) {
        return {
          success: false,
          error: 'File must be an image',
        };
      }

      // Validate file size (5MB max)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        return {
          success: false,
          error: 'File size must be less than 5MB',
        };
      }

      // Validate file format (PNG or JPG)
      const allowedFormats = ['image/png', 'image/jpeg', 'image/jpg'];
      if (!allowedFormats.includes(file.mimetype)) {
        return {
          success: false,
          error: 'File must be PNG or JPG format',
        };
      }

      // Upload using upload_stream for buffer
      const uploadResult = await new Promise<UploadApiResponse>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder,
            resource_type: 'image',
            allowed_formats: ['jpg', 'jpeg', 'png'],
            transformation: [
              {
                fetch_format: 'auto',
                quality: 'auto',
              },
            ],
          },
          (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
            if (error) {
              reject(error);
            } else if (result) {
              resolve(result);
            } else {
              reject(new Error('Upload failed: No result returned'));
            }
          }
        );

        // Write buffer to stream
        uploadStream.end(file.buffer);
      });

      return {
        success: true,
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
      };
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      };
    }
  }

  /**
   * Delete an image from Cloudinary
   * @param publicId - Public ID of the image to delete
   * @returns Delete result
   */
  async deleteImage(publicId: string): Promise<DeleteResult> {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      
      if (result.result === 'ok') {
        return { success: true };
      } else {
        return {
          success: false,
          error: result.result || 'Delete failed',
        };
      }
    } catch (error) {
      console.error('Cloudinary delete error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Delete failed',
      };
    }
  }

  /**
   * Get optimized URL for an image
   * @param publicId - Public ID of the image
   * @param options - Optimization options
   * @returns Optimized image URL
   */
  getOptimizedUrl(publicId: string, options: ImageOptions = {}): string {
    const {
      width,
      height,
      crop = 'auto',
      gravity = 'auto',
      quality = 'auto',
      format = 'auto',
    } = options;

    return cloudinary.url(publicId, {
      fetch_format: format,
      quality: quality,
      crop: crop,
      gravity: gravity,
      width: width,
      height: height,
    });
  }
}

