import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useStockMovements } from '@/hooks/useInventory';
import { History } from 'lucide-react';
import { format } from 'date-fns';

export function MovementHistory() {
  const { data: movements, isLoading } = useStockMovements();

  return (
    <Card className="animate-fade-in">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <History className="h-5 w-5 text-primary" />
          Recent Movements
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        ) : movements?.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No stock movements yet.
          </div>
        ) : (
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">Date</TableHead>
                  <TableHead className="font-semibold">Type</TableHead>
                  <TableHead className="font-semibold">Product</TableHead>
                  <TableHead className="font-semibold">Color</TableHead>
                  <TableHead className="font-semibold text-right">Qty</TableHead>
                  <TableHead className="font-semibold">Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movements?.map((movement) => (
                  <TableRow key={movement.id} className="hover:bg-muted/30">
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(movement.movement_date), 'MMM d, yyyy HH:mm')}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={movement.movement_type === 'IN' ? 'default' : 'destructive'}
                        className="font-mono"
                      >
                        {movement.movement_type}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {movement.inventory?.products?.sku}
                    </TableCell>
                    <TableCell>{movement.inventory?.color}</TableCell>
                    <TableCell className="text-right font-semibold">
                      {movement.movement_type === 'IN' ? '+' : '-'}{movement.quantity}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                      {movement.notes || '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
