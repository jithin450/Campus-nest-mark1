import { supabase } from '@/integrations/supabase/client';

/**
 * Utility functions for handling avatar operations with proper error handling
 * for missing storage buckets
 */

export interface AvatarUploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

/**
 * Check if the avatars storage bucket exists
 */
export async function checkAvatarsBucket(): Promise<boolean> {
  try {
    const { data, error } = await supabase.storage.listBuckets();
    if (error) {
      console.error('Error checking buckets:', error);
      return false;
    }
    return data?.some(bucket => bucket.name === 'avatars') || false;
  } catch (error) {
    console.error('Error checking avatars bucket:', error);
    return false;
  }
}

/**
 * Upload an avatar file with proper error handling
 */
export async function uploadAvatar(file: File, userId: string): Promise<AvatarUploadResult> {
  try {
    // Check if bucket exists first
    const bucketExists = await checkAvatarsBucket();
    if (!bucketExists) {
      return {
        success: false,
        error: 'Storage bucket not found. Please contact the administrator to set up the avatars storage bucket in Supabase.'
      };
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      return {
        success: false,
        error: uploadError.message
      };
    }

    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    return {
      success: true,
      url: data.publicUrl
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload avatar'
    };
  }
}

/**
 * Get avatar URL with fallback handling
 */
export function getAvatarUrl(avatarUrl: string | null): string | null {
  if (!avatarUrl) return null;
  
  // If it's already a full URL, return as is
  if (avatarUrl.startsWith('http')) {
    return avatarUrl;
  }
  
  // If it's a storage path, construct the full URL
  try {
    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(avatarUrl);
    return data.publicUrl;
  } catch (error) {
    console.error('Error getting avatar URL:', error);
    return null;
  }
}

/**
 * Delete an avatar file
 */
export async function deleteAvatar(filePath: string): Promise<{ success: boolean; error?: string }> {
  try {
    const bucketExists = await checkAvatarsBucket();
    if (!bucketExists) {
      return {
        success: false,
        error: 'Storage bucket not found'
      };
    }

    const { error } = await supabase.storage
      .from('avatars')
      .remove([filePath]);

    if (error) {
      return {
        success: false,
        error: error.message
      };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete avatar'
    };
  }
}
