import { Camera, Upload, Instagram, Facebook, Twitter, Plus, ImagePlus } from 'lucide-react';
import { useState } from 'react';
import EditableHeader from './EditableHeader';
import { useToast } from '@/hooks/use-toast';
import { CoverPhotoCropModal } from './CoverPhotoCropModal';
import { supabase } from '@/integrations/supabase/client';
interface DashboardHeaderProps {
  userName: string;
  profilePicture: string;
  coverImage?: string;
  onUpdateProfilePicture: (newImageUrl: string) => void;
  onUpdateCoverImage?: (newImageUrl: string) => void;
  onUserNameChange: (newName: string) => void;
  socialMedia?: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    tiktok?: string;
  };
}
const DashboardHeader = ({
  userName,
  profilePicture,
  coverImage,
  onUpdateProfilePicture,
  onUpdateCoverImage,
  onUserNameChange,
  socialMedia
}: DashboardHeaderProps) => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [showCoverCropModal, setShowCoverCropModal] = useState(false);
  const [tempCoverImage, setTempCoverImage] = useState<string>('');
  const [hasStory, setHasStory] = useState(true);
  const {
    toast
  } = useToast();
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Error",
          description: "Please select an image file.",
          variant: "destructive"
        });
        return;
      }

      try {
        // Show loading toast
        toast({
          title: "Uploading",
          description: "Uploading your profile picture..."
        });

        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          throw new Error("User not authenticated");
        }

        // Upload to Supabase Storage
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('profile-avatars')
          .upload(fileName, file, { upsert: true });

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('profile-avatars')
          .getPublicUrl(fileName);

        // Update profile in database
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ avatar_url: publicUrl })
          .eq('user_id', user.id);

        if (updateError) throw updateError;

        onUpdateProfilePicture(publicUrl);
        setShowUploadModal(false);
        toast({
          title: "Success",
          description: "Profile picture updated successfully!"
        });
      } catch (error) {
        console.error('Error uploading profile picture:', error);
        toast({
          title: "Error",
          description: "Failed to upload profile picture. Please try again.",
          variant: "destructive"
        });
      }
    }
  };
  const handleStoryUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type (images and videos for stories)
      if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
        toast({
          title: "Error",
          description: "Please select an image or video file for your story.",
          variant: "destructive"
        });
        return;
      }
      setHasStory(true);
      setShowStoryModal(false);
      toast({
        title: "Success",
        description: "Story uploaded successfully!"
      });
    }
  };
  const handleStoryUrlSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const mediaUrl = formData.get('mediaUrl') as string;
    if (mediaUrl.trim()) {
      setHasStory(true);
      setShowStoryModal(false);
      toast({
        title: "Success",
        description: "Story added successfully!"
      });
    } else {
      toast({
        title: "Error",
        description: "Please provide a valid media URL.",
        variant: "destructive"
      });
    }
  };
  const handleImageUrlSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const imageUrl = formData.get('imageUrl') as string;
    if (imageUrl.trim()) {
      onUpdateProfilePicture(imageUrl.trim());
      setShowUploadModal(false);
      toast({
        title: "Success",
        description: "Profile picture updated successfully!"
      });
    } else {
      toast({
        title: "Error",
        description: "Please provide a valid image URL.",
        variant: "destructive"
      });
    }
  };

  const handleCoverImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Error",
          description: "Please select an image file.",
          variant: "destructive"
        });
        return;
      }

      const imageUrl = URL.createObjectURL(file);
      setTempCoverImage(imageUrl);
      setShowCoverCropModal(true);
    }
  };

  const handleCoverCropComplete = async (croppedImageUrl: string) => {
    try {
      // Show loading toast
      toast({
        title: "Uploading",
        description: "Uploading your cover photo..."
      });

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      // Convert blob URL to blob
      const response = await fetch(croppedImageUrl);
      const blob = await response.blob();
      
      // Upload to Supabase Storage
      const fileName = `cover-${user.id}-${Date.now()}.png`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('profile-avatars')
        .upload(fileName, blob, { 
          upsert: true,
          contentType: 'image/png'
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-avatars')
        .getPublicUrl(fileName);

      // Update profile in database
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ banner_url: publicUrl })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      if (onUpdateCoverImage) {
        onUpdateCoverImage(publicUrl);
      }
      
      toast({
        title: "Success",
        description: "Cover photo updated successfully!"
      });
    } catch (error) {
      console.error('Error uploading cover photo:', error);
      toast({
        title: "Error",
        description: "Failed to upload cover photo. Please try again.",
        variant: "destructive"
      });
    }
  };

  const renderSocialIcon = (platform: string, url: string) => {
    const iconProps = "w-6 h-6 text-gray-600 hover:text-primary transition-colors";
    const getIcon = () => {
      switch (platform) {
        case 'instagram':
          return <Instagram className={iconProps} />;
        case 'facebook':
          return <Facebook className={iconProps} />;
        case 'twitter':
          return <Twitter className={iconProps} />;
        case 'tiktok':
          return <svg className={iconProps} viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.525 2.016c-.374-.065-1.18-.056-1.18-.056s-.054-.79-.423-1.296C10.65.384 10.306.096 9.68.024 9.374-.016 8.89.024 8.89.024s.02.79.374 1.296c.294.424.619.712 1.245.784zm3.624 1.2c-.334-.065-1.064-.056-1.064-.056s-.048-.71-.382-1.17C14.493 1.67 14.2 1.43 13.688 1.37c-.276-.04-.689.01-.689.01s.018.71.338 1.17c.266.383.559.623 1.048.683zm-6.225.72c-.306-.06-.975-.052-.975-.052s-.044-.653-.351-1.076c-.246-.34-.491-.583-.903-.64-.222-.036-.633.009-.633.009s.017.653.31 1.076c.244.353.514.572.938.628z" />
            </svg>;
        default:
          return null;
      }
    };
    return <a href={url} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-white border border-gray-200 hover:border-primary transition-colors shadow-sm" aria-label={`Visit ${platform} profile`}>
        {getIcon()}
      </a>;
  };
  return <>
      <div className="mb-8">
        {/* Headliner Image with Profile Picture Overlay */}
        <div className="relative mb-16 h-48 w-full rounded-lg overflow-hidden bg-gradient-to-r from-purple-100 to-pink-100 group cursor-pointer" onClick={() => document.getElementById('cover-image-upload')?.click()}>
          {coverImage && <img src={coverImage} alt="Dashboard header" className="w-full h-full object-cover" />}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent group-hover:bg-black/50 transition-colors">
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="bg-white/90 rounded-full p-4">
                <ImagePlus className="h-8 w-8 text-primary" />
              </div>
            </div>
          </div>
          <input
            id="cover-image-upload"
            type="file"
            accept="image/*"
            onChange={handleCoverImageUpload}
            className="hidden"
          />
          
          {/* Profile Picture Overlay */}
          <div className="absolute -bottom-16 left-4">
            <div className="relative">
              {/* Story Ring */}
              <div className={`absolute -inset-2 rounded-full ${hasStory ? 'bg-gradient-to-tr from-purple-500 via-pink-500 to-orange-500' : 'bg-gray-300'} p-1 transition-all duration-300`}>
                <div className="bg-white rounded-full p-1">
                  <img src={profilePicture} alt="Profile" className="w-64 h-64 rounded-full object-cover shadow-lg transition-transform duration-300 hover:scale-105 cursor-pointer" onClick={() => setShowUploadModal(true)} />
                </div>
              </div>
              
              {/* Profile Picture Edit Button */}
              <button onClick={() => setShowUploadModal(true)} className="absolute top-2 right-2 bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-10">
                <Camera className="h-4 w-4" />
              </button>

              {/* Story Upload Button */}
              <button onClick={() => setShowStoryModal(true)} className="absolute -bottom-2 right-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white p-3 rounded-full shadow-lg hover:scale-110 transition-all duration-200 animate-pulse" title="Add to your story">
                <Plus className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Name Section */}
        <div className="ml-6">
          <EditableHeader userName={userName} profilePicture={profilePicture} onUserNameChange={onUserNameChange} onProfilePictureChange={onUpdateProfilePicture} />
          <p className="text-gray-600">
            Manage your appointments, services, products, and track your earnings.
          </p>
          
          {/* Social Media Links */}
          {socialMedia && <div className="flex gap-3 mt-4">
              {socialMedia.instagram && renderSocialIcon('instagram', socialMedia.instagram)}
              {socialMedia.facebook && renderSocialIcon('facebook', socialMedia.facebook)}
              {socialMedia.twitter && renderSocialIcon('twitter', socialMedia.twitter)}
              {socialMedia.tiktok && renderSocialIcon('tiktok', socialMedia.tiktok)}
            </div>}
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Update Profile Picture</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Upload Image File</label>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              
              <div className="text-center text-sm text-gray-500">or</div>
              
              <form onSubmit={handleImageUrlSubmit}>
                <label className="block text-sm font-medium mb-2">Image URL</label>
                <input type="url" name="imageUrl" placeholder="https://example.com/image.jpg" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4" />
                <div className="flex justify-end space-x-2">
                  <button type="button" onClick={() => setShowUploadModal(false)} className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50">
                    Cancel
                  </button>
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    <Upload className="mr-2 h-4 w-4 inline" />
                    Update
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>}
      {/* Story Upload Modal */}
      {showStoryModal && <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Add to Your Story</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Upload Image or Video</label>
                <input type="file" accept="image/*,video/*" onChange={handleStoryUpload} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
              
              <div className="text-center text-sm text-gray-500">or</div>
              
              <form onSubmit={handleStoryUrlSubmit}>
                <label className="block text-sm font-medium mb-2">Media URL</label>
                <input type="url" name="mediaUrl" placeholder="https://example.com/media.jpg" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4" />
                <div className="flex justify-end space-x-2">
                  <button type="button" onClick={() => setShowStoryModal(false)} className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50">
                    Cancel
                  </button>
                  <button type="submit" className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-md hover:opacity-90">
                    <Upload className="mr-2 h-4 w-4 inline" />
                    Add Story
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>}

      <CoverPhotoCropModal
        isOpen={showCoverCropModal}
        onClose={() => setShowCoverCropModal(false)}
        imageSrc={tempCoverImage}
        onCropComplete={handleCoverCropComplete}
      />
    </>;
};
export default DashboardHeader;