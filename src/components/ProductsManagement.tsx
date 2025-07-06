
import { useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Product } from '@/types/dashboard';
import ProductEditDialog from './ProductEditDialog';

interface ProductsManagementProps {
  products: Product[];
  onProductAdd: (newProduct: Product) => void;
  onProductEdit: (updatedProduct: Product) => void;
  onProductDelete: (id: number) => void;
  onProductToggle: (id: number) => void;
}

const ProductsManagement = ({ 
  products, 
  onProductAdd, 
  onProductEdit, 
  onProductDelete, 
  onProductToggle 
}: ProductsManagementProps) => {
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleEditClick = (product: Product) => {
    setEditingProduct(product);
    setIsEditDialogOpen(true);
  };

  const handleEditSave = (updatedProduct: Product) => {
    onProductEdit(updatedProduct);
  };

  const handleEditClose = () => {
    setEditingProduct(null);
    setIsEditDialogOpen(false);
  };

  return (
    <div className="space-y-4 mt-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Your Products</h3>
        <Button onClick={() => onProductAdd({
          id: Date.now(),
          name: 'New Product',
          description: 'Product description',
          price: 25,
          stock: 10,
          category: 'shampoo',
          isActive: true
        })}>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>
      
      <div className="space-y-4">
        {products.map((product) => (
          <div key={product.id} className="border rounded-lg p-4 bg-white">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold text-lg">{product.name}</h4>
                  <Badge 
                    variant={product.isActive ? 'default' : 'secondary'}
                    className={product.isActive ? 'bg-green-100 text-green-800' : ''}
                  >
                    {product.isActive ? 'Available' : 'Unavailable'}
                  </Badge>
                  {product.stock <= 5 && (
                    <Badge variant="destructive">Low Stock</Badge>
                  )}
                </div>
                <p className="text-gray-600 mb-2">{product.description}</p>
                <div className="flex gap-4 text-sm text-gray-500">
                  <span>Price: R{product.price}</span>
                  <span>Stock: {product.stock}</span>
                  <span>Category: {product.category}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onProductToggle(product.id)}
                >
                  {product.isActive ? 'Hide' : 'Show'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEditClick(product)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onProductDelete(product.id)}
                  className="text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <ProductEditDialog
        product={editingProduct}
        isOpen={isEditDialogOpen}
        onClose={handleEditClose}
        onSave={handleEditSave}
      />
    </div>
  );
};

export default ProductsManagement;
