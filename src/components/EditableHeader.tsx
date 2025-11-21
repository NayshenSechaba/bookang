import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Edit2, Check, X } from 'lucide-react';

interface EditableHeaderProps {
  userName: string;
  profilePicture?: string;
  onUserNameChange: (newName: string) => void;
}
const EditableHeader = ({
  userName,
  profilePicture,
  onUserNameChange
}: EditableHeaderProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(userName);
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
  if (isEditing) {
    return (
      <div className="flex items-center gap-3">
        <Avatar className="h-12 w-12">
          <AvatarImage src={profilePicture} alt={userName || 'User'} />
          <AvatarFallback className="bg-primary text-primary-foreground">
            {(userName || 'User').charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
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
      <Avatar className="h-12 w-12">
        <AvatarImage src={profilePicture} alt={userName || 'User'} />
        <AvatarFallback className="bg-primary text-primary-foreground">
          {(userName || 'User').charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
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