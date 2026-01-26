import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useInventory, useProducts } from '@/hooks/useInventory';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Filter, Package, TrendingUp, AlertTriangle } from 'lucide-react';

export function ReportPage() {
  const { data: inventory } = useInventory();
  const { data: products } = useProducts();
  
  const [minQuantity, setMinQuantity] = useState<string>('');
  const [maxQuantity, setMaxQuantity] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'quantity' | 'name'>('quantity');

  const filteredInventory = useMemo(() => {
    if (!inventory) return [];
    
    let filtered = [...inventory];
    
    // Filter by product
    if (selectedProduct !== 'all') {
      filtered = filtered.filter(item => item.product_id === selectedProduct);
    }
    
    // Filter by quantity range
    if (minQuantity !== '') {
      filtered = filtered.filter(item => item.quantity >= parseInt(minQuantity));
    }
    if (maxQuantity !== '') {
      filtered = filtered.filter(item => item.quantity <= parseInt(maxQuantity));
    }
    
    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'quantity') {
        return b.quantity - a.quantity;
      } else {
        return a.products.name.localeCompare(b.products.name);
      }
    });
    
    return filtered;
  }, [inventory, selectedProduct, minQuantity, maxQuantity, sortBy]);

  const chartData = useMemo(() => {
    return filteredInventory.map(item => ({
      name: `${item.products.name} (${item.color})`,
      quantity: item.quantity,
      sku: item.products.sku
    }));
  }, [filteredInventory]);

  const pieData = useMemo(() => {
    const productTotals = filteredInventory.reduce((acc, item) => {
      const productName = item.products.name;
      acc[productName] = (acc[productName] || 0) + item.quantity;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(productTotals).map(([name, quantity]) => ({
      name,
      quantity
    }));
  }, [filteredInventory]);

  const stats = useMemo(() => {
    const totalItems = filteredInventory.length;
    const totalQuantity = filteredInventory.reduce((sum, item) => sum + item.quantity, 0);
    const lowStockItems = filteredInventory.filter(item => item.quantity > 0 && item.quantity <= 5).length;
    const outOfStockItems = filteredInventory.filter(item => item.quantity === 0).length;

    return {
      totalItems,
      totalQuantity,
      lowStockItems,
      outOfStockItems
    };
  }, [filteredInventory]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  const clearFilters = () => {
    setMinQuantity('');
    setMaxQuantity('');
    setSelectedProduct('all');
    setSortBy('quantity');
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalItems}</p>
                <p className="text-sm text-muted-foreground">Items</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalQuantity}</p>
                <p className="text-sm text-muted-foreground">Total Stock</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.lowStockItems}</p>
                <p className="text-sm text-muted-foreground">Low Stock</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.outOfStockItems}</p>
                <p className="text-sm text-muted-foreground">Out of Stock</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="product">Product</Label>
              <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                <SelectTrigger>
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Products</SelectItem>
                  {products?.map(product => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="min-quantity">Min Quantity</Label>
              <Input
                id="min-quantity"
                type="number"
                placeholder="0"
                value={minQuantity}
                onChange={(e) => setMinQuantity(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="max-quantity">Max Quantity</Label>
              <Input
                id="max-quantity"
                type="number"
                placeholder="999"
                value={maxQuantity}
                onChange={(e) => setMaxQuantity(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="sort">Sort By</Label>
              <Select value={sortBy} onValueChange={(value: 'quantity' | 'name') => setSortBy(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="quantity">Quantity (High to Low)</SelectItem>
                  <SelectItem value="name">Name (A-Z)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="mt-4">
            <Button onClick={clearFilters} variant="outline">
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Stock Levels by Item</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="quantity" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Stock Distribution by Product</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="quantity"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Inventory Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Color</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInventory.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.products.sku}</TableCell>
                  <TableCell>{item.products.name}</TableCell>
                  <TableCell>{item.color}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>
                    {item.quantity === 0 ? (
                      <span className="text-red-600 font-medium">Out of Stock</span>
                    ) : item.quantity <= 5 ? (
                      <span className="text-yellow-600 font-medium">Low Stock</span>
                    ) : (
                      <span className="text-green-600 font-medium">In Stock</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
