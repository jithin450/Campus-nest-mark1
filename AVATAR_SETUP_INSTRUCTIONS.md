# Avatar Upload Setup Instructions

## Current Status
✅ **Avatars bucket exists and is accessible**  
❌ **RLS policies are blocking uploads**  
❌ **Bucket doesn't appear in bucket list (but direct access works)**  

## The Problem
The avatars bucket was created manually in the Supabase dashboard, but the RLS (Row Level Security) policies are preventing file uploads. The current policies expect a specific file path structure that doesn't match how the application uploads files.

## Solution: Manual Policy Setup

Since the API doesn't allow direct SQL execution, you need to manually update the RLS policies in the Supabase dashboard.

### Step 1: Access Supabase Dashboard
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project: `umiyiwixfkkadtnnehmz`
3. Go to **Authentication** > **Policies**

### Step 2: Update Storage Object Policies

Find the `storage.objects` table policies and replace them with these:

#### Policy 1: Public Read Access
```sql
CREATE POLICY "Avatar images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'avatars');
```

#### Policy 2: Authenticated Upload
```sql
CREATE POLICY "Authenticated users can upload avatars" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'avatars' AND 
  auth.role() = 'authenticated'
);
```

#### Policy 3: Authenticated Update
```sql
CREATE POLICY "Authenticated users can update avatars" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'avatars' AND 
  auth.role() = 'authenticated'
) 
WITH CHECK (
  bucket_id = 'avatars' AND 
  auth.role() = 'authenticated'
);
```

#### Policy 4: Authenticated Delete
```sql
CREATE POLICY "Authenticated users can delete avatars" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'avatars' AND 
  auth.role() = 'authenticated'
);
```

### Step 3: Alternative - Disable RLS (Quick Fix)

If the above policies don't work, you can temporarily disable RLS for the storage.objects table:

1. Go to **Database** > **Tables**
2. Find `storage.objects` table
3. Click on the table
4. Go to **Settings** tab
5. Toggle **Enable RLS** to OFF

⚠️ **Warning**: This makes all storage objects publicly accessible. Only use this for testing.

### Step 4: Verify Bucket Settings

Make sure your avatars bucket has these settings:
- **Name**: `avatars`
- **Public**: ✅ Yes
- **File size limit**: `2097152` (2MB)
- **Allowed MIME types**: 
  - `image/png`
  - `image/jpeg`
  - `image/jpg`
  - `image/gif`
  - `image/webp`

### Step 5: Test the Fix

After updating the policies:

1. Refresh your application: [http://localhost:8081](http://localhost:8081)
2. Go to the Profile page
3. Try uploading an avatar image
4. Check if the upload succeeds and the image displays

## Application File Structure

The application uploads files with this path structure:
```
avatars/{userId}.{extension}
```

Example: `avatars/123e4567-e89b-12d3-a456-426614174000.png`

## Troubleshooting

### If uploads still fail:
1. Check browser console for errors
2. Verify user is authenticated
3. Check file size (must be < 2MB)
4. Check file type (must be image)
5. Try disabling RLS temporarily

### If bucket doesn't appear in list:
- This is a known issue but doesn't affect functionality
- Direct bucket access works fine
- The application will work correctly

## Next Steps

1. ✅ **Bucket exists** - Done
2. 🔧 **Fix RLS policies** - Manual step required
3. 🧪 **Test upload** - After policy fix
4. ✅ **Application ready** - After successful test

---

**Need help?** The bucket is accessible and the application code is correct. The only remaining issue is the RLS policies, which need to be updated manually in the Supabase dashboard.