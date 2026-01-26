import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAddProduct } from '@/hooks/useInventory';
import { Package } from 'lucide-react';

export function AddProductForm() {
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const addProduct = useAddProduct();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sku.trim() || !name.trim()) return;
    
    addProduct.mutate(
      { sku: sku.trim(), name: name.trim() },
      {
        onSuccess: () => {
          setSku('');
          setName('');
        },
      }
    );
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Package className="h-5 w-5 text-primary" />
          Add New Product
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sku">SKU Code</Label>
              <Input
                id="sku"
                placeholder="e.g., DRS-001"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="uppercase"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                placeholder="e.g., Summer Floral Dress"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>
          <Button 
            type="submit" 
            disabled={addProduct.isPending || !sku.trim() || !name.trim()}
            className="w-full"
          >
            {addProduct.isPending ? 'Adding...' : 'Add Product'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
