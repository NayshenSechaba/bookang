
import { useState, useEffect } from 'react';
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
  onSave: (productData: Omit<Product, 'id'>) => void;
  isAdding?: boolean;
}

const ProductEditDialog = ({ product, isOpen, onClose, onSave, isAdding = false }: ProductEditDialogProps) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    costPrice: 0,
    weight: 0,
    stock: 0,
    category: 'shampoo' as const,
    isActive: true
  });

  useEffect(() => {
    if (isAdding) {
      setFormData({
        name: '',
        description: '',
        price: 0,
        costPrice: 0,
        weight: 0,
        stock: 0,
        category: 'shampoo',
        isActive: true
      });
    } else if (product) {
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price,
        costPrice: product.costPrice,
        weight: product.weight,
        stock: product.stock,
        category: product.category,
        isActive: product.isActive
      });
    }
  }, [product, isAdding, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isAdding ? 'Add New Product' : 'Edit Product'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Product Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              required
              placeholder="Enter product name"
            />
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              required
              placeholder="Enter product description"
            />
          </div>
          
          <div>
            <Label htmlFor="price">Selling Price (R)</Label>
            <Input
              id="price"
              type="number"
              value={formData.price}
              onChange={(e) => handleInputChange('price', Number(e.target.value))}
              required
              min="0"
              step="0.01"
              placeholder="0.00"
            />
          </div>

          <div>
            <Label htmlFor="costPrice">Cost Price (R)</Label>
            <Input
              id="costPrice"
              type="number"
              value={formData.costPrice}
              onChange={(e) => handleInputChange('costPrice', Number(e.target.value))}
              required
              min="0"
              step="0.01"
              placeholder="0.00"
            />
          </div>

          <div>
            <Label htmlFor="weight">Weight (g)</Label>
            <Input
              id="weight"
              type="number"
              value={formData.weight}
              onChange={(e) => handleInputChange('weight', Number(e.target.value))}
              required
              min="0"
              step="0.1"
              placeholder="0"
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
              placeholder="0"
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
              {isAdding ? 'Add Product' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductEditDialog;
