import { Card, CardContent } from '@/components/ui/card';
import { useInventory, useProducts, useStockMovements } from '@/hooks/useInventory';
import { Package, Palette, TrendingUp, AlertTriangle } from 'lucide-react';

export function StatsCards() {
  const { data: products } = useProducts();
  const { data: inventory } = useInventory();
  const { data: movements } = useStockMovements();

  const totalProducts = products?.length || 0;
  const totalVariants = inventory?.length || 0;
  const totalStock = inventory?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const lowStockItems = inventory?.filter(item => item.quantity > 0 && item.quantity <= 5).length || 0;

  const stats = [
    {
      label: 'Products',
      value: totalProducts,
      icon: Package,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      label: 'Color Variants',
      value: totalVariants,
      icon: Palette,
      color: 'text-accent-foreground',
      bg: 'bg-accent',
    },
    {
      label: 'Total Stock',
      value: totalStock,
      icon: TrendingUp,
      color: 'text-success',
      bg: 'bg-success/10',
    },
    {
      label: 'Low Stock',
      value: lowStockItems,
      icon: AlertTriangle,
      color: lowStockItems > 0 ? 'text-destructive' : 'text-muted-foreground',
      bg: lowStockItems > 0 ? 'bg-destructive/10' : 'bg-muted',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in">
      {stats.map((stat) => (
        <Card key={stat.label} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
