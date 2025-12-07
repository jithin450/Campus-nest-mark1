import React, { useState, useEffect } from 'react';
import { User, MapPin, GraduationCap, Star, Edit, Check, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/layout/Navbar';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { uploadAvatar, getAvatarUrl, checkAvatarsBucket } from '@/utils/avatarUtils';

const Profile = () => {
  const { profile, user, loading } = useAuth();
  const [isEditingFirstName, setIsEditingFirstName] = useState(false);
  const [isEditingLastName, setIsEditingLastName] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);



  const handleEditFirstName = () => {
    setFirstName(profile?.full_name?.split(' ')[0] || '');
    setIsEditingFirstName(true);
  };

  const handleEditLastName = () => {
    setLastName(profile?.full_name?.split(' ').slice(1).join(' ') || '');
    setIsEditingLastName(true);
  };

  const handleEditEmail = () => {
    setEmail(profile?.email || '');
    setIsEditingEmail(true);
  };

  const handleSaveFirstName = () => {
    // TODO: Implement save functionality with backend
    console.log('Saving first name:', firstName);
    setIsEditingFirstName(false);
  };

  const handleSaveLastName = () => {
    // TODO: Implement save functionality with backend
    console.log('Saving last name:', lastName);
    setIsEditingLastName(false);
  };

  const handleSaveEmail = async () => {
    if (!user) return;
    
    try {
      // Update auth user email first
      const { error: authError } = await supabase.auth.updateUser({
        email: email
      });
      
      if (authError) {
        console.error('Error updating auth email:', authError);
        alert('Failed to update email: ' + authError.message);
        return;
      }
      
      alert('Email updated successfully! Please check your email for confirmation.');
      setIsEditingEmail(false);
    } catch (error) {
      console.error('Error saving email:', error);
      alert('Failed to update email. Please try again.');
    }
  };

  const handleCancelFirstName = () => {
    setIsEditingFirstName(false);
    setFirstName('');
  };

  const handleCancelLastName = () => {
    setIsEditingLastName(false);
    setLastName('');
  };

  const handleCancelEmail = () => {
    setIsEditingEmail(false);
    setEmail('');
  };

  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    }
    if (profile?.avatar_url) {
      setAvatarUrl(profile.avatar_url);
    }
  }, [user, profile]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      const result = await uploadAvatar(file, user.id);
      
      if (!result.success) {
        alert('Error uploading avatar: ' + result.error);
        return;
      }

      const { error: updateError } = await supabase
         .from('profiles')
         .update({ avatar_url: result.url } as Record<string, unknown>)
         .eq('user_id', user.id);

      if (updateError) {
        console.error('Error updating profile:', updateError);
        alert('Image uploaded but failed to update profile: ' + updateError.message);
        return;
      }

      setAvatarUrl(result.url!);
      alert('Profile image updated successfully!');
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  // Show authentication required message
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-4">Authentication Required</h2>
            <p>Please log in to view your profile.</p>
          </div>
        </div>
      </div>
    );
  }

  // Show profile not found message with create option
  if (!profile) {
    const handleCreateProfile = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
             .from('profiles')
             .insert({
               user_id: user.id,
               full_name: user.user_metadata?.full_name || 'User',
               phone_number: user.user_metadata?.phone || null
             })
          .select()
          .single();
        
        if (error) {
          console.error('Error creating profile:', error);
          alert('Failed to create profile: ' + error.message);
        } else {
          alert('Profile created successfully! Please refresh the page.');
          window.location.reload();
        }
      } catch (error) {
        console.error('Error creating profile:', error);
        alert('Failed to create profile. Please try again.');
      }
    };
    
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-4">Profile Not Found</h2>
            <p className="mb-4">Your profile could not be loaded. This might be because:</p>
            <ul className="text-left max-w-md mx-auto mb-6 space-y-2">
              <li>• Your profile hasn't been created yet</li>
              <li>• There's a database connection issue</li>
              <li>• You need to sign in again</li>
            </ul>
            <div className="space-y-4">
              <button 
                onClick={handleCreateProfile}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Profile
              </button>
              <br />
              <button 
                onClick={() => window.location.reload()}
                className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Refresh Page
              </button>
            </div>
            {user && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  Logged in as: {user.email}
                  <br />
                  User ID: {user.id}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">User Profile</h1>
            <p className="text-gray-600">Manage your personal information and preferences</p>
          </div>

          {/* Profile Content */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Left Section - Profile Picture and Name */}
            <div className="md:col-span-1">
              <Card>
                <CardContent className="p-6 text-center">
                  {/* Circular Profile Picture */}
                  <div className="mb-4">
                    <div className="relative">
                      <Avatar className="w-32 h-32 mx-auto">
                        <AvatarImage src={avatarUrl || "/placeholder.svg"} alt="Profile" />
                        <AvatarFallback className="text-2xl">
                          <User className="w-16 h-16" />
                        </AvatarFallback>
                      </Avatar>
                      <label className="absolute bottom-0 right-0 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 cursor-pointer shadow-lg">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          disabled={uploading}
                        />
                        {uploading ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        )}
                      </label>
                    </div>
                  </div>
                  
                  {/* User Name Box */}
                  <Card className="bg-gray-50">
                    <CardContent className="p-4">
                      <h2 className="text-xl font-semibold text-gray-900">
                        {profile.full_name || 'No name provided'}
                      </h2>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            </div>

            {/* Right Section - Information Fields */}
            <div className="md:col-span-2">
              <div className="space-y-4">
                {/* First Name Field */}
                 <Card>
                   <CardHeader className="pb-3">
                     <CardTitle className="flex items-center justify-between text-lg">
                       <div className="flex items-center">
                         <User className="w-5 h-5 mr-2 text-green-600" />
                         First Name
                       </div>
                       {!isEditingFirstName ? (
                         <button 
                           onClick={handleEditFirstName}
                           className="p-1 hover:bg-gray-100 rounded"
                         >
                           <Edit className="w-4 h-4 text-gray-600" />
                         </button>
                       ) : (
                         <div className="flex gap-1">
                           <button 
                             onClick={handleSaveFirstName}
                             className="p-1 hover:bg-green-100 rounded"
                           >
                             <Check className="w-4 h-4 text-green-600" />
                           </button>
                           <button 
                             onClick={handleCancelFirstName}
                             className="p-1 hover:bg-red-100 rounded"
                           >
                             <X className="w-4 h-4 text-red-600" />
                           </button>
                         </div>
                       )}
                     </CardTitle>
                   </CardHeader>
                   <CardContent>
                     <div className="bg-gray-50 p-4 rounded-md border">
                       {!isEditingFirstName ? (
                         <p className="text-gray-900 font-medium">
                           {profile.full_name?.split(' ')[0] || 'Not provided'}
                         </p>
                       ) : (
                         <input
                           type="text"
                           value={firstName}
                           onChange={(e) => setFirstName(e.target.value)}
                           className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-green-500"
                           placeholder="Enter first name"
                           autoFocus
                         />
                       )}
                     </div>
                   </CardContent>
                 </Card>

                 {/* Last Name Field */}
                 <Card>
                   <CardHeader className="pb-3">
                     <CardTitle className="flex items-center justify-between text-lg">
                       <div className="flex items-center">
                         <User className="w-5 h-5 mr-2 text-purple-600" />
                         Last Name
                       </div>
                       {!isEditingLastName ? (
                         <button 
                           onClick={handleEditLastName}
                           className="p-1 hover:bg-gray-100 rounded"
                         >
                           <Edit className="w-4 h-4 text-gray-600" />
                         </button>
                       ) : (
                         <div className="flex gap-1">
                           <button 
                             onClick={handleSaveLastName}
                             className="p-1 hover:bg-green-100 rounded"
                           >
                             <Check className="w-4 h-4 text-green-600" />
                           </button>
                           <button 
                             onClick={handleCancelLastName}
                             className="p-1 hover:bg-red-100 rounded"
                           >
                             <X className="w-4 h-4 text-red-600" />
                           </button>
                         </div>
                       )}
                     </CardTitle>
                   </CardHeader>
                   <CardContent>
                     <div className="bg-gray-50 p-4 rounded-md border">
                       {!isEditingLastName ? (
                         <p className="text-gray-900 font-medium">
                           {profile.full_name?.split(' ').slice(1).join(' ') || 'Not provided'}
                         </p>
                       ) : (
                         <input
                           type="text"
                           value={lastName}
                           onChange={(e) => setLastName(e.target.value)}
                           className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
                           placeholder="Enter last name"
                           autoFocus
                         />
                       )}
                     </div>
                   </CardContent>
                 </Card>

                 {/* Email Field */}
                 <Card>
                   <CardHeader className="pb-3">
                     <CardTitle className="flex items-center justify-between text-lg">
                       <div className="flex items-center">
                         <User className="w-5 h-5 mr-2 text-blue-600" />
                         Email
                       </div>
                       {!isEditingEmail ? (
                         <button 
                           onClick={handleEditEmail}
                           className="p-1 hover:bg-gray-100 rounded"
                         >
                           <Edit className="w-4 h-4 text-gray-600" />
                         </button>
                       ) : (
                         <div className="flex gap-1">
                           <button 
                             onClick={handleSaveEmail}
                             className="p-1 hover:bg-green-100 rounded"
                           >
                             <Check className="w-4 h-4 text-green-600" />
                           </button>
                           <button 
                             onClick={handleCancelEmail}
                             className="p-1 hover:bg-red-100 rounded"
                           >
                             <X className="w-4 h-4 text-red-600" />
                           </button>
                         </div>
                       )}
                     </CardTitle>
                   </CardHeader>
                   <CardContent>
                     <div className="bg-gray-50 p-4 rounded-md border">
                       {!isEditingEmail ? (
                         <p className="text-gray-900 font-medium">
                           {profile.email || user?.email || 'Not provided'}
                         </p>
                       ) : (
                         <input
                           type="email"
                           value={email}
                           onChange={(e) => setEmail(e.target.value)}
                           className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                           placeholder="Enter email address"
                           autoFocus
                         />
                       )}
                     </div>
                   </CardContent>
                 </Card>

                {/* College Name Field */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center text-lg">
                      <GraduationCap className="w-5 h-5 mr-2 text-blue-600" />
                      College Name
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-50 p-4 rounded-md border">
                      <p className="text-gray-900 font-medium">
                        Annamacharya Institute of Technology & Sciences
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Address Field */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center text-lg">
                      <MapPin className="w-5 h-5 mr-2 text-green-600" />
                      Address
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-50 p-4 rounded-md border">
                      <p className="text-gray-900 font-medium">
                        {profile.address || 'No address provided'}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Review Points Field */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center text-lg">
                      <Star className="w-5 h-5 mr-2 text-yellow-600" />
                      Review Points
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-50 p-4 rounded-md border">
                      <div className="flex items-center justify-between">
                        <p className="text-gray-900 font-medium">
                          85 Points
                        </p>
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                          Excellent
                        </Badge>
                      </div>
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-yellow-600 h-2 rounded-full transition-all duration-300" 
                            style={{ width: `85%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
