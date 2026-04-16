import { Router, Request, Response } from 'express';
import multer from 'multer';
import { isAuthenticated } from '../middleware/auth.middleware.js';
import { CloudinaryService } from '../services/cloudinary.service.js';
import { UserModel } from '../models/User.js';
import { getUserRoles, isAdmin } from '../utils/roles.js';

export const uploadRouter = Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Only allow PNG and JPG
    const allowedMimes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PNG and JPG images are allowed'));
    }
  },
});

/**
 * POST /api/upload/image
 * Upload an image to Cloudinary
 * Requires authentication
 */
uploadRouter.post(
  '/image',
  isAuthenticated,
  upload.single('image'),
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No image file provided',
        });
      }

      const cloudinaryService = CloudinaryService.getInstance();
      const folder = req.body.folder || 'users';
      const result = await cloudinaryService.uploadImage(req.file, folder);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: result.error || 'Upload failed',
        });
      }

      res.json({
        success: true,
        data: {
          url: result.url,
          publicId: result.publicId,
        },
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      });
    }
  }
);

/**
 * POST /api/upload/user-avatar
 * Upload user avatar and update user record
 * Requires authentication
 */
uploadRouter.post(
  '/user-avatar',
  isAuthenticated,
  upload.single('image'),
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No image file provided',
        });
      }

      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
      }

      const userId = req.body.userId || req.user.sub;
      
      // Verify user can update this profile (own profile or admin)
      const userRoles = getUserRoles(req.user);
      if (userId !== req.user.sub && !isAdmin(userRoles)) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to update this user',
        });
      }

      const cloudinaryService = CloudinaryService.getInstance();
      const result = await cloudinaryService.uploadImage(req.file, 'users/avatars');

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: result.error || 'Upload failed',
        });
      }

      // Get current user to delete old image if exists
      const user = await UserModel.findById(userId);
      if (user && user.picture) {
        // Extract public ID from old picture URL if it's a Cloudinary URL
        const oldPublicId = extractPublicIdFromUrl(user.picture);
        if (oldPublicId) {
          // Delete old image (non-blocking)
          cloudinaryService.deleteImage(oldPublicId).catch((err) => {
            console.error('Failed to delete old avatar:', err);
          });
        }
      }

      // Update user with new picture URL
      const updatedUser = await UserModel.findByIdAndUpdate(
        userId,
        { picture: result.url },
        { new: true }
      )
        .populate('membership_id')
        .populate('tenant_id')
        .lean();

      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
        });
      }

      res.json({
        success: true,
        data: {
          url: result.url,
          publicId: result.publicId,
          user: {
            id: updatedUser._id.toString(),
            picture: result.url,
          },
        },
      });
    } catch (error) {
      console.error('Avatar upload error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      });
    }
  }
);

/**
 * DELETE /api/upload/:publicId
 * Delete an image from Cloudinary
 * Requires authentication
 */
uploadRouter.delete('/:publicId', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { publicId } = req.params;
    const cloudinaryService = CloudinaryService.getInstance();
    const result = await cloudinaryService.deleteImage(publicId as string);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error || 'Delete failed',
      });
    }

    res.json({
      success: true,
      message: 'Image deleted successfully',
    });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Delete failed',
    });
  }
});

/**
 * Helper function to extract public ID from Cloudinary URL
 */
function extractPublicIdFromUrl(url: string): string | null {
  try {
    // Cloudinary URLs format: https://res.cloudinary.com/{cloud_name}/image/upload/{public_id}.{format}
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

