import { Camera, Upload } from 'lucide-react';
import { useState } from 'react';
import EditableHeader from './EditableHeader';
import { useToast } from '@/hooks/use-toast';

interface DashboardHeaderProps {
  userName: string;
  profilePicture: string;
  onUpdateProfilePicture: (newImageUrl: string) => void;
  onUserNameChange: (newName: string) => void;
  socialMedia?: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
  };
}

const DashboardHeader = ({ userName, profilePicture, onUpdateProfilePicture, onUserNameChange, socialMedia }: DashboardHeaderProps) => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const { toast } = useToast();

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
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

      // Create object URL for the uploaded image
      const imageUrl = URL.createObjectURL(file);
      onUpdateProfilePicture(imageUrl);
      setShowUploadModal(false);
      
      toast({
        title: "Success",
        description: "Profile picture updated successfully!",
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
        description: "Profile picture updated successfully!",
      });
    } else {
      toast({
        title: "Error",
        description: "Please provide a valid image URL.",
        variant: "destructive"
      });
    }
  };

  const renderSocialIcon = (platform: string, url: string) => {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer">
        <img 
          src={`https://www.iconfinder.com/icons/1000000/${platform}.png`}
          alt={platform}
          className="w-6 h-6"
        />
      </a>
    );
  };

  return (
    <>
      <div className="mb-8">
        {/* Headliner Image with Profile Picture Overlay */}
        <div className="relative mb-16 h-48 w-full rounded-lg overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1649972904349-6e44c42644a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
            alt="Dashboard header"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          
          {/* Profile Picture Overlay */}
          <div className="absolute -bottom-16 left-4">
            <div className="relative">
              <img 
                src={profilePicture}
                alt="Profile"
                className="w-64 h-64 rounded-full object-cover border-4 border-white shadow-lg transition-transform duration-300 hover:scale-110 cursor-pointer"
                onClick={() => setShowUploadModal(true)}
              />
              <button
                onClick={() => setShowUploadModal(true)}
                className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
              >
                <Camera className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Name Section */}
        <div className="ml-6">
          <EditableHeader 
            userName={userName}
            onUserNameChange={onUserNameChange}
          />
          <p className="text-gray-600">
            Manage your appointments, services, products, and track your earnings.
          </p>
          
          {/* Social Media Links */}
          {socialMedia && (
            <div className="flex gap-3 mt-4">
              {socialMedia.instagram && renderSocialIcon('instagram', socialMedia.instagram)}
              {socialMedia.facebook && renderSocialIcon('facebook', socialMedia.facebook)}
              {socialMedia.twitter && renderSocialIcon('twitter', socialMedia.twitter)}
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Update Profile Picture</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Upload Image File</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="text-center text-sm text-gray-500">or</div>
              
              <form onSubmit={handleImageUrlSubmit}>
                <label className="block text-sm font-medium mb-2">Image URL</label>
                <input
                  type="url"
                  name="imageUrl"
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                />
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    <Upload className="mr-2 h-4 w-4 inline" />
                    Update
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DashboardHeader;
