
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Service } from '@/types/dashboard';

interface ServicesManagementProps {
  services: Service[];
  onServiceAdd: (newService: Service) => void;
  onServiceEdit: (updatedService: Service) => void;
  onServiceDelete: (id: number) => void;
  onServiceToggle: (id: number) => void;
}

const ServicesManagement = ({ 
  services, 
  onServiceAdd, 
  onServiceEdit, 
  onServiceDelete, 
  onServiceToggle 
}: ServicesManagementProps) => {
  return (
    <div className="space-y-4 mt-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Your Services</h3>
        <Button onClick={() => onServiceAdd({
          id: Date.now(),
          name: 'New Service',
          description: 'Service description',
          duration: 60,
          price: 50,
          category: 'haircut',
          isActive: true
        })}>
          <Plus className="mr-2 h-4 w-4" />
          Add Service
        </Button>
      </div>
      
      <div className="space-y-4">
        {services.map((service) => (
          <div key={service.id} className="border rounded-lg p-4 bg-white">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold text-lg">{service.name}</h4>
                  <Badge 
                    variant={service.isActive ? 'default' : 'secondary'}
                    className={service.isActive ? 'bg-green-100 text-green-800' : ''}
                  >
                    {service.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <p className="text-gray-600 mb-2">{service.description}</p>
                <div className="flex gap-4 text-sm text-gray-500">
                  <span>Duration: {service.duration} min</span>
                  <span>Price: R{service.price}</span>
                  <span>Category: {service.category}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onServiceToggle(service.id)}
                >
                  {service.isActive ? 'Deactivate' : 'Activate'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onServiceEdit(service)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onServiceDelete(service.id)}
                  className="text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServicesManagement;
