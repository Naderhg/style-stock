import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useInventory, useStockMovement } from '@/hooks/useInventory';
import { ArrowDownCircle, ArrowUpCircle } from 'lucide-react';

export function StockMovementForm() {
  const [inventoryId, setInventoryId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [notes, setNotes] = useState('');
  const [movementType, setMovementType] = useState<'IN' | 'OUT'>('IN');
  
  const { data: inventory } = useInventory();
  const stockMovement = useStockMovement();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inventoryId || !quantity || parseInt(quantity) <= 0) return;
    
    stockMovement.mutate(
      { 
        inventory_id: inventoryId, 
        quantity: parseInt(quantity), 
        movement_type: movementType,
        notes: notes.trim() || undefined,
      },
      {
        onSuccess: () => {
          setQuantity('');
          setNotes('');
        },
      }
    );
  };

  const selectedInventory = inventory?.find(i => i.id === inventoryId);

  return (
    <Card className="animate-fade-in">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          {movementType === 'IN' ? (
            <ArrowDownCircle className="h-5 w-5 text-success" />
          ) : (
            <ArrowUpCircle className="h-5 w-5 text-destructive" />
          )}
          Stock Movement
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2">
            <Button
              type="button"
              variant={movementType === 'IN' ? 'default' : 'outline'}
              onClick={() => setMovementType('IN')}
              className="flex-1"
            >
              <ArrowDownCircle className="h-4 w-4 mr-2" />
              Stock IN
            </Button>
            <Button
              type="button"
              variant={movementType === 'OUT' ? 'destructive' : 'outline'}
              onClick={() => setMovementType('OUT')}
              className="flex-1"
            >
              <ArrowUpCircle className="h-4 w-4 mr-2" />
              Stock OUT
            </Button>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="inventory">Product & Color</Label>
            <Select value={inventoryId} onValueChange={setInventoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Select product and color" />
              </SelectTrigger>
              <SelectContent>
                {inventory?.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.products.sku} - {item.products.name} ({item.color}) — Qty: {item.quantity}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                placeholder="e.g., 10"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Input
                id="notes"
                placeholder="e.g., Factory delivery"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
          
          {selectedInventory && movementType === 'OUT' && parseInt(quantity) > selectedInventory.quantity && (
            <p className="text-sm text-destructive">
              Warning: Only {selectedInventory.quantity} in stock
            </p>
          )}
          
          <Button 
            type="submit" 
            disabled={stockMovement.isPending || !inventoryId || !quantity || parseInt(quantity) <= 0}
            variant={movementType === 'IN' ? 'default' : 'destructive'}
            className="w-full"
          >
            {stockMovement.isPending ? 'Processing...' : `Record ${movementType}`}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
