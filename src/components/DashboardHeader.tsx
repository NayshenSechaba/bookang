
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
        <div className="absolute -bottom-16 left-6">
          <div className="relative">
            <img 
              src={profilePicture}
              alt="Profile"
              className="w-64 h-64 rounded-full object-cover border-4 border-white shadow-lg transition-transform duration-300 hover:scale-110 cursor-pointer"
            />
            <button
              onClick={onUpdateProfilePicture}
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
      </div>
    </div>
  );
};

export default DashboardHeader;
