
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Service } from '@/types/dashboard';

interface ServiceEditDialogProps {
  service: Service | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (serviceData: Omit<Service, 'id'>) => void;
  isAdding?: boolean;
}

const ServiceEditDialog = ({ service, isOpen, onClose, onSave, isAdding = false }: ServiceEditDialogProps) => {
  const [formData, setFormData] = useState<Omit<Service, 'id'>>({
    name: '',
    description: '',
    duration: 60,
    price: 0,
    category: 'haircut',
    isActive: true
  });

  useEffect(() => {
    if (isAdding) {
      setFormData({
        name: '',
        description: '',
        duration: 60,
        price: 0,
        category: 'haircut',
        isActive: true
      });
    } else if (service) {
      setFormData({
        name: service.name,
        description: service.description,
        duration: service.duration,
        price: service.price,
        category: service.category,
        isActive: service.isActive
      });
    }
  }, [service, isAdding, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const handleInputChange = (field: keyof Omit<Service, 'id'>, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isAdding ? 'Add New Service' : 'Edit Service'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Service Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              required
              placeholder="Enter service name"
            />
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              required
              placeholder="Enter service description"
            />
          </div>
          
          <div>
            <Label htmlFor="duration">Duration (minutes)</Label>
            <Input
              id="duration"
              type="number"
              inputMode="numeric"
              value={formData.duration}
              onChange={(e) => handleInputChange('duration', Number(e.target.value))}
              required
              min="1"
              placeholder="60"
            />
          </div>
          
          <div>
            <Label htmlFor="price">Price (R)</Label>
            <Input
              id="price"
              type="number"
              inputMode="decimal"
              value={formData.price}
              onChange={(e) => handleInputChange('price', Number(e.target.value))}
              required
              min="0"
              step="0.01"
              placeholder="0.00"
            />
          </div>
          
          <div>
            <Label htmlFor="category">Category</Label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value as Service['category'])}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            >
              <option value="haircut">Haircut</option>
              <option value="color">Color</option>
              <option value="styling">Styling</option>
              <option value="treatment">Treatment</option>
            </select>
          </div>
          
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {isAdding ? 'Add Service' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ServiceEditDialog;
