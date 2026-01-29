import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useInventory, useStockMovement } from '@/hooks/useInventory';
import { ArrowDownCircle, ArrowUpCircle, Package, Search, X } from 'lucide-react';

export function StockMovementForm() {
  const [selectedInventoryIds, setSelectedInventoryIds] = useState<string[]>([]);
  const [quantities, setQuantities] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState('');
  const [movementType, setMovementType] = useState<'IN' | 'OUT'>('IN');
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: inventory } = useInventory();
  const stockMovement = useStockMovement();

  const handleInventoryToggle = (inventoryId: string, checked: boolean) => {
    if (checked) {
      setSelectedInventoryIds(prev => [...prev, inventoryId]);
      if (!quantities[inventoryId]) {
        setQuantities(prev => ({ ...prev, [inventoryId]: '1' }));
      }
    } else {
      setSelectedInventoryIds(prev => prev.filter(id => id !== inventoryId));
      setQuantities(prev => {
        const newQuantities = { ...prev };
        delete newQuantities[inventoryId];
        return newQuantities;
      });
    }
  };

  const handleQuantityChange = (inventoryId: string, value: string) => {
    setQuantities(prev => ({ ...prev, [inventoryId]: value }));
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  // Filter inventory based on search term
  const filteredInventory = inventory?.filter(item => {
    if (!searchTerm.trim()) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      item.products.sku.toLowerCase().includes(searchLower) ||
      item.products.name.toLowerCase().includes(searchLower) ||
      item.color.toLowerCase().includes(searchLower)
    );
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const movements = selectedInventoryIds.map(inventoryId => ({
      inventory_id: inventoryId,
      quantity: parseInt(quantities[inventoryId] || '0'),
      movement_type: movementType,
      notes: notes.trim() || undefined,
    })).filter(movement => movement.quantity > 0);

    if (movements.length === 0) return;
    
    stockMovement.mutate(movements, {
      onSuccess: () => {
        setSelectedInventoryIds([]);
        setQuantities({});
        setNotes('');
      },
    });
  };

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
            <Label className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Select Products & Colors
            </Label>
            
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by SKU, product name, or color..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-10"
              />
              {searchTerm && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={clearSearch}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            <ScrollArea className="h-48 w-full border rounded-md p-2">
              <div className="space-y-2">
                {filteredInventory?.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground text-sm">
                    {searchTerm ? 'No products found matching your search.' : 'No products available.'}
                  </div>
                ) : (
                  filteredInventory?.map((item) => (
                    <div key={item.id} className="flex items-center space-x-3 p-2 rounded hover:bg-muted">
                      <Checkbox
                        id={item.id}
                        checked={selectedInventoryIds.includes(item.id)}
                        onCheckedChange={(checked) => handleInventoryToggle(item.id, checked as boolean)}
                      />
                      <Label htmlFor={item.id} className="flex-1 cursor-pointer text-sm">
                        {item.products.sku} - {item.products.name} ({item.color}) — Qty: {item.quantity}
                      </Label>
                      {selectedInventoryIds.includes(item.id) && (
                        <Input
                          type="number"
                          min="1"
                          value={quantities[item.id] || ''}
                          onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                          className="w-20 h-8 text-sm"
                          placeholder="Qty"
                        />
                      )}
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
            
            {searchTerm && filteredInventory && (
              <p className="text-xs text-muted-foreground">
                Found {filteredInventory.length} product{filteredInventory.length !== 1 ? 's' : ''} matching "{searchTerm}"
              </p>
            )}
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
          
          {selectedInventoryIds.some(id => {
            const item = filteredInventory?.find(i => i.id === id);
            return item && movementType === 'OUT' && parseInt(quantities[id] || '0') > item.quantity;
          }) && (
            <p className="text-sm text-destructive">
              Warning: Some selected quantities exceed available stock
            </p>
          )}
          
          <Button 
            type="submit" 
            disabled={stockMovement.isPending || selectedInventoryIds.length === 0 || 
              selectedInventoryIds.some(id => !quantities[id] || parseInt(quantities[id]) <= 0)}
            variant={movementType === 'IN' ? 'default' : 'destructive'}
            className="w-full"
          >
            {stockMovement.isPending ? 'Processing...' : `Record ${movementType} (${selectedInventoryIds.length} items)`}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
