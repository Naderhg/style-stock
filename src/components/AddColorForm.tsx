import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProducts, useAddInventory } from '@/hooks/useInventory';
import { Palette } from 'lucide-react';

export function AddColorForm() {
  const [productId, setProductId] = useState('');
  const [color, setColor] = useState('');
  const { data: products } = useProducts();
  const addInventory = useAddInventory();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId || !color.trim()) return;
    
    addInventory.mutate(
      { product_id: productId, color: color.trim() },
      {
        onSuccess: () => {
          setColor('');
        },
      }
    );
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Palette className="h-5 w-5 text-primary" />
          Add Color Variant
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="product">Product</Label>
              <Select value={productId} onValueChange={setProductId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  {products?.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.sku} - {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="color">Color</Label>
              <Input
                id="color"
                placeholder="e.g., Rose Pink"
                value={color}
                onChange={(e) => setColor(e.target.value)}
              />
            </div>
          </div>
          <Button 
            type="submit" 
            disabled={addInventory.isPending || !productId || !color.trim()}
            variant="secondary"
            className="w-full"
          >
            {addInventory.isPending ? 'Adding...' : 'Add Color Variant'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
