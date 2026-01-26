import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useInventory } from '@/hooks/useInventory';
import { Package } from 'lucide-react';

export function InventoryTable() {
  const { data: inventory, isLoading } = useInventory();

  const getStockStatus = (quantity: number) => {
    if (quantity === 0) return { label: 'Out of Stock', variant: 'destructive' as const };
    if (quantity <= 5) return { label: 'Low Stock', variant: 'secondary' as const };
    return { label: 'In Stock', variant: 'default' as const };
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Package className="h-5 w-5 text-primary" />
          Current Stock
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        ) : inventory?.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No inventory yet. Add a product and color to get started.
          </div>
        ) : (
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">SKU</TableHead>
                  <TableHead className="font-semibold">Product Name</TableHead>
                  <TableHead className="font-semibold">Color</TableHead>
                  <TableHead className="font-semibold text-right">Quantity</TableHead>
                  <TableHead className="font-semibold text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventory?.map((item) => {
                  const status = getStockStatus(item.quantity);
                  return (
                    <TableRow key={item.id} className="hover:bg-muted/30">
                      <TableCell className="font-mono text-sm">{item.products.sku}</TableCell>
                      <TableCell>{item.products.name}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-2">
                          <span 
                            className="w-3 h-3 rounded-full border" 
                            style={{ 
                              backgroundColor: item.color.toLowerCase().includes('white') ? '#fff' :
                                item.color.toLowerCase().includes('black') ? '#000' :
                                item.color.toLowerCase().includes('red') ? '#ef4444' :
                                item.color.toLowerCase().includes('blue') ? '#3b82f6' :
                                item.color.toLowerCase().includes('green') ? '#22c55e' :
                                item.color.toLowerCase().includes('pink') ? '#ec4899' :
                                item.color.toLowerCase().includes('yellow') ? '#eab308' :
                                item.color.toLowerCase().includes('purple') ? '#a855f7' :
                                item.color.toLowerCase().includes('orange') ? '#f97316' :
                                item.color.toLowerCase().includes('beige') ? '#d4c4b0' :
                                item.color.toLowerCase().includes('navy') ? '#1e3a5f' :
                                '#9ca3af'
                            }} 
                          />
                          {item.color}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-semibold">{item.quantity}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
