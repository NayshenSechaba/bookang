import { useState, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Edit2, Check, X, Camera } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
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
      onProfilePictureChange?.(imageUrl);
      
      toast({
        title: "Success",
        description: "Profile picture updated successfully!",
      });
    }
  };
  if (isEditing) {
    return (
      <div className="flex items-center gap-3">
        <div className="relative group/avatar">
          <Avatar className="h-36 w-36 cursor-pointer" onClick={handleAvatarClick}>
            <AvatarImage src={profilePicture} alt={userName || 'User'} />
            <AvatarFallback className="bg-primary text-primary-foreground text-5xl">
              {(userName || 'User').charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center cursor-pointer" onClick={handleAvatarClick}>
            <Camera className="h-8 w-8 text-white" />
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>
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
      <div className="relative group/avatar">
        <Avatar className="h-36 w-36 cursor-pointer" onClick={handleAvatarClick}>
          <AvatarImage src={profilePicture} alt={userName || 'User'} />
          <AvatarFallback className="bg-primary text-primary-foreground text-5xl">
            {(userName || 'User').charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center cursor-pointer" onClick={handleAvatarClick}>
          <Camera className="h-8 w-8 text-white" />
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
      </div>
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