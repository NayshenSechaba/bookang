
import { Camera } from 'lucide-react';
import EditableHeader from './EditableHeader';

interface DashboardHeaderProps {
  userName: string;
  profilePicture: string;
  onUpdateProfilePicture: () => void;
  onUserNameChange: (newName: string) => void;
}

const DashboardHeader = ({ userName, profilePicture, onUpdateProfilePicture, onUserNameChange }: DashboardHeaderProps) => {
  return (
    <div className="mb-8 flex items-center gap-6">
      <div className="relative">
        <img 
          src={profilePicture}
          alt="Profile"
          className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg transition-transform duration-300 hover:scale-110 cursor-pointer"
        />
        <button
          onClick={onUpdateProfilePicture}
          className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        >
          <Camera className="h-4 w-4" />
        </button>
      </div>
      <div className="flex-1">
        <EditableHeader 
          userName={userName}
          onUserNameChange={onUserNameChange}
        />
        <p className="text-gray-600">
          Manage your appointments, services, products, and track your earnings.
        </p>
      </div>
    </div>
  );
};

export default DashboardHeader;
