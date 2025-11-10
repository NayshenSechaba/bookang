import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Edit2, Check, X } from 'lucide-react';
interface EditableHeaderProps {
  userName: string;
  onUserNameChange: (newName: string) => void;
}
const EditableHeader = ({
  userName,
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
    return <div className="flex items-center gap-2">
        <Input value={editValue} onChange={e => setEditValue(e.target.value)} onKeyDown={handleKeyPress} className="text-3xl font-bold text-gray-900 border-2 border-blue-300 focus:border-blue-500" autoFocus placeholder="Enter your name or business name" />
        <Button onClick={handleSave} size="sm" className="bg-green-600 hover:bg-green-700">
          <Check className="h-4 w-4" />
        </Button>
        <Button onClick={handleCancel} size="sm" variant="outline">
          <X className="h-4 w-4" />
        </Button>
      </div>;
  }
  return <div className="flex items-center gap-2 group">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Sechaba Magatikele!{userName || 'Hair Stylist'}!
      </h1>
      <Button onClick={() => setIsEditing(true)} size="sm" variant="ghost" className="opacity-0 group-hover:opacity-100 transition-opacity">
        <Edit2 className="h-4 w-4" />
      </Button>
    </div>;
};
export default EditableHeader;