
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Info, AlertCircle } from 'lucide-react';

interface CustomAlertProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
}

const CustomAlert = ({ isOpen, onClose, type, title, message }: CustomAlertProps) => {
  // Get icon and colors based on alert type
  const getAlertStyles = () => {
    switch (type) {
      case 'success':
        return {
          icon: CheckCircle,
          iconColor: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          buttonColor: 'bg-green-600 hover:bg-green-700'
        };
      case 'error':
        return {
          icon: XCircle,
          iconColor: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          buttonColor: 'bg-red-600 hover:bg-red-700'
        };
      case 'warning':
        return {
          icon: AlertCircle,
          iconColor: 'text-amber-600',
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-200',
          buttonColor: 'bg-amber-600 hover:bg-amber-700'
        };
      default:
        return {
          icon: Info,
          iconColor: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          buttonColor: 'bg-blue-600 hover:bg-blue-700'
        };
    }
  };

  const styles = getAlertStyles();
  const IconComponent = styles.icon;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`sm:max-w-md ${styles.bgColor} ${styles.borderColor} border-2`}>
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className={`p-3 rounded-full ${styles.bgColor}`}>
              <IconComponent className={`h-8 w-8 ${styles.iconColor}`} />
            </div>
          </div>
          <DialogTitle className="text-center text-xl font-bold text-gray-900">
            {title}
          </DialogTitle>
          <DialogDescription className="text-center text-gray-600 text-base">
            {message}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex justify-center mt-6">
          <Button 
            onClick={onClose}
            className={`px-8 py-2 text-white ${styles.buttonColor}`}
          >
            OK
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CustomAlert;
