
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Product } from '@/types/dashboard';

interface ProductEditDialogProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedProduct: Product) => void;
}

const ProductEditDialog = ({ product, isOpen, onClose, onSave }: ProductEditDialogProps) => {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || 0,
    stock: product?.stock || 0,
    category: product?.category || 'shampoo'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (product) {
      onSave({
        ...product,
        ...formData
      });
    }
    onClose();
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Product Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="price">Price (R)</Label>
            <Input
              id="price"
              type="number"
              value={formData.price}
              onChange={(e) => handleInputChange('price', Number(e.target.value))}
              required
              min="0"
              step="0.01"
            />
          </div>
          
          <div>
            <Label htmlFor="stock">Stock Quantity</Label>
            <Input
              id="stock"
              type="number"
              value={formData.stock}
              onChange={(e) => handleInputChange('stock', Number(e.target.value))}
              required
              min="0"
            />
          </div>
          
          <div>
            <Label htmlFor="category">Category</Label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            >
              <option value="shampoo">Shampoo</option>
              <option value="conditioner">Conditioner</option>
              <option value="styling">Styling</option>
              <option value="treatment">Treatment</option>
              <option value="tools">Tools</option>
            </select>
          </div>
          
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductEditDialog;
