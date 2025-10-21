import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ProfileCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfileCompletionModal = ({ isOpen, onClose }: ProfileCompletionModalProps) => {
  const navigate = useNavigate();

  const handleCompleteProfile = () => {
    navigate('/business-profile');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 rounded-full bg-blue-50">
              <AlertCircle className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <DialogTitle className="text-center text-xl font-bold text-gray-900">
            Complete Your Profile to Get Noticed!
          </DialogTitle>
          <DialogDescription className="text-center text-gray-600 text-base">
            Add your business details to help customers find you and get contacted.
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter className="flex flex-col sm:flex-row gap-3 mt-4">
          <Button 
            onClick={handleCompleteProfile}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            Complete Profile
          </Button>
          <Button 
            onClick={onClose}
            variant="outline"
            className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Skip for Now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileCompletionModal;
