import { useState, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Edit2, Check, X, Camera } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface EditableHeaderProps {
  userName: string;
  profilePicture?: string;
  onUserNameChange: (newName: string) => void;
  onProfilePictureChange?: (newImageUrl: string) => void;
}
const EditableHeader = ({
  userName,
  profilePicture,
  onUserNameChange,
  onProfilePictureChange
}: EditableHeaderProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(userName);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const handleSave = () => {
    if (editValue.trim()) {
      onUserNameChange(editValue.trim());
      setIsEditing(false);
    }
  };
  const handleCancel = () => {
    setEditValue(userName);
    setIsEditing(false);
  };
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    }
    if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
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

        onProfilePictureChange?.(publicUrl);
        
        toast({
          title: "Success",
          description: "Profile picture updated successfully!",
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
  if (isEditing) {
    return (
      <div className="flex items-center gap-3">
        <Input 
          value={editValue} 
          onChange={e => setEditValue(e.target.value)} 
          onKeyDown={handleKeyPress} 
          className="text-3xl font-bold border-2 focus:border-primary" 
          autoFocus 
          placeholder="Enter your name or business name" 
        />
        <Button onClick={handleSave} size="sm" className="bg-green-600 hover:bg-green-700">
          <Check className="h-4 w-4" />
        </Button>
        <Button onClick={handleCancel} size="sm" variant="outline">
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-3 group">
      <h1 className="text-3xl font-bold text-foreground">
        {userName || 'Hair Stylist'}
      </h1>
      <Button 
        onClick={() => setIsEditing(true)} 
        size="sm" 
        variant="ghost" 
        className="opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Edit2 className="h-4 w-4" />
      </Button>
    </div>
  );
};
export default EditableHeader;