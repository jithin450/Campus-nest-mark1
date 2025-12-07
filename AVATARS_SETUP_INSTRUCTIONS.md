# Avatars Storage Bucket Setup Instructions

The application requires an "avatars" storage bucket in Supabase for user profile pictures. Since automatic creation failed due to RLS policies, please follow these manual setup steps:

## Manual Setup in Supabase Dashboard

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard/project/umiyiwixfkkadtnnehmz/storage/buckets
   - Log in with your Supabase account

2. **Create New Bucket**
   - Click the "New bucket" button
   - Enter the following details:
     - **Name**: `avatars`
     - **Public bucket**: ✅ Yes (checked)
     - **File size limit**: `2097152` (2MB)
     - **Allowed MIME types**: 
       ```
       image/png
       image/jpeg
       image/jpg
       image/gif
       image/webp
       ```

3. **Set Up RLS Policies**
   After creating the bucket, go to the SQL Editor and run:
   ```sql
   -- Allow public read access to avatars
   CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
   FOR SELECT USING (bucket_id = 'avatars');
   
   -- Allow users to upload their own avatars
   CREATE POLICY "Users can upload their own avatar" ON storage.objects
   FOR INSERT WITH CHECK (
     bucket_id = 'avatars' AND 
     auth.uid()::text = (storage.foldername(name))[1]
   );
   
   -- Allow users to update their own avatars
   CREATE POLICY "Users can update their own avatar" ON storage.objects
   FOR UPDATE USING (
     bucket_id = 'avatars' AND 
     auth.uid()::text = (storage.foldername(name))[1]
   ) WITH CHECK (
     bucket_id = 'avatars' AND 
     auth.uid()::text = (storage.foldername(name))[1]
   );
   
   -- Allow users to delete their own avatars
   CREATE POLICY "Users can delete their own avatar" ON storage.objects
   FOR DELETE USING (
     bucket_id = 'avatars' AND 
     auth.uid()::text = (storage.foldername(name))[1]
   );
   ```

## Verification

After setup, run the test script to verify:
```bash
node test-avatars-bucket.js
```

You should see "✅ Avatars bucket found!" in the output.

## Fallback Behavior

Until the bucket is set up, the application will:
- Show a default avatar placeholder
- Display an error message when users try to upload avatars
- Continue to function normally for all other features

## Code Implementation

The application now includes improved error handling for avatar operations:

### Avatar Utility Functions

A new utility file `src/utils/avatarUtils.ts` provides:
- `checkAvatarsBucket()`: Verifies if the avatars bucket exists
- `uploadAvatar()`: Handles file uploads with proper error handling
- `getAvatarUrl()`: Safely retrieves avatar URLs with fallbacks
- `deleteAvatar()`: Removes avatar files when needed

### Error Handling

The Profile component now:
- Checks for bucket existence before upload attempts
- Provides clear error messages to users
- Gracefully handles missing storage bucket scenarios
- Uses the avatar utility functions for consistent behavior

## Troubleshooting

If you encounter issues:
1. Ensure you have admin/owner permissions on the Supabase project
2. Check that RLS is enabled on the storage.objects table
3. Verify the bucket name is exactly "avatars" (lowercase)
4. Contact your Supabase administrator if you don't have sufficient permissions
5. **"Storage bucket not found" Error**: This indicates the avatars bucket hasn't been set up yet - follow the manual setup steps above

For additional support, contact your system administrator or check the Supabase documentation.