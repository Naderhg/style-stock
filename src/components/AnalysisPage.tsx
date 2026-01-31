import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from '@/components/ui/pagination';
import { useStockMovements, useProducts } from '@/hooks/useInventory';
import { BarChart3, Filter, X, TrendingUp, TrendingDown, Package } from 'lucide-react';
import { format } from 'date-fns';

export function AnalysisPage() {
  const [filters, setFilters] = useState({
    movementType: 'all',
    productId: 'all',
    dateFrom: '',
    dateTo: '',
    notes: '',
    page: 1,
    limit: 50
  });

  const { data: movementsData, isLoading } = useStockMovements(filters);
  const { data: products } = useProducts();

  const handleFilterChange = (key: string, value: string | number) => {
    // Reset to page 1 when any filter except page changes
    if (key !== 'page') {
      setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
    } else {
      setFilters(prev => ({ ...prev, [key]: value }));
    }
  };

  const handlePageChange = (page: number) => {
    handleFilterChange('page', page);
  };

  const clearFilters = () => {
    setFilters({
      movementType: 'all',
      productId: 'all',
      dateFrom: '',
      dateTo: '',
      notes: '',
      page: 1,
      limit: 50
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== 'all' && value !== '' && value !== 1 && value !== 50
  );

  // Calculate analysis statistics
  const calculateStats = () => {
    if (!movementsData?.data || movementsData.data.length === 0) {
      return {
        totalIn: 0,
        totalOut: 0,
        netChange: 0,
        totalTransactions: 0,
        topProduct: null,
        avgTransactionSize: 0
      };
    }

    const movements = movementsData.data;
    const totalIn = movements
      .filter(m => m.movement_type === 'IN')
      .reduce((sum, m) => sum + m.quantity, 0);
    
    const totalOut = movements
      .filter(m => m.movement_type === 'OUT')
      .reduce((sum, m) => sum + m.quantity, 0);

    const netChange = totalIn - totalOut;
    const totalTransactions = movements.length;
    const avgTransactionSize = totalTransactions > 0 ? (totalIn + totalOut) / totalTransactions : 0;

    // Find top product by transaction count
    const productCounts = {};
    movements.forEach(m => {
      const productKey = m.inventory?.products?.sku || 'Unknown';
      productCounts[productKey] = (productCounts[productKey] || 0) + 1;
    });

    const topProduct = Object.keys(productCounts).reduce((a, b) => 
      productCounts[a] > productCounts[b] ? a : b, null);

    return {
      totalIn,
      totalOut,
      netChange,
      totalTransactions,
      topProduct,
      avgTransactionSize
    };
  };

  const stats = calculateStats();

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total IN</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+{stats.totalIn}</div>
            <p className="text-xs text-muted-foreground">Stock added</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total OUT</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">-{stats.totalOut}</div>
            <p className="text-xs text-muted-foreground">Stock removed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Change</CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.netChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stats.netChange >= 0 ? '+' : ''}{stats.netChange}
            </div>
            <p className="text-xs text-muted-foreground">Overall change</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <BarChart3 className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.totalTransactions}</div>
            <p className="text-xs text-muted-foreground">Total movements</p>
          </CardContent>
        </Card>
      </div>

      {/* Analysis Table */}
      <Card className="animate-fade-in">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <BarChart3 className="h-5 w-5 text-primary" />
            Product Analysis
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-2">
                Filtered
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters Section */}
          <div className="border rounded-lg p-4 bg-muted/30">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <h3 className="font-semibold">Filters</h3>
              </div>
              {hasActiveFilters && (
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-2" />
                  Clear All
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="space-y-2">
                <Label htmlFor="movementType">Movement Type</Label>
                <Select value={filters.movementType} onValueChange={(value) => handleFilterChange('movementType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="IN">Stock IN</SelectItem>
                    <SelectItem value="OUT">Stock OUT</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="product">Product</Label>
                <Select value={filters.productId} onValueChange={(value) => handleFilterChange('productId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All products" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Products</SelectItem>
                    {products?.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.sku} - {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateFrom">Date From</Label>
                <Input
                  id="dateFrom"
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateTo">Date To</Label>
                <Input
                  id="dateTo"
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Search Notes</Label>
                <Input
                  id="notes"
                  placeholder="Search in notes..."
                  value={filters.notes}
                  onChange={(e) => handleFilterChange('notes', e.target.value)}
                />
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading analysis...</div>
          ) : movementsData?.data?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No data available for analysis.
            </div>
          ) : (
            <>
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
                    {movementsData?.data?.map((movement) => (
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

              {/* Pagination */}
              {movementsData && movementsData.totalPages > 1 && (
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Showing {((movementsData.currentPage - 1) * movementsData.limit) + 1} to{' '}
                    {Math.min(movementsData.currentPage * movementsData.limit, movementsData.totalCount)} of{' '}
                    {movementsData.totalCount} results
                  </div>
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => handlePageChange(movementsData.currentPage - 1)}
                          className={movementsData.currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                      
                      {Array.from({ length: movementsData.totalPages }, (_, i) => i + 1).map((page) => {
                        if (
                          page === 1 || 
                          page === movementsData.totalPages || 
                          (page >= movementsData.currentPage - 1 && page <= movementsData.currentPage + 1)
                        ) {
                          return (
                            <PaginationItem key={page}>
                              <PaginationLink
                                onClick={() => handlePageChange(page)}
                                isActive={page === movementsData.currentPage}
                                className="cursor-pointer"
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        } else if (
                          page === movementsData.currentPage - 2 || 
                          page === movementsData.currentPage + 2
                        ) {
                          return (
                            <PaginationItem key={page}>
                              <PaginationEllipsis />
                            </PaginationItem>
                          );
                        }
                        return null;
                      })}
                      
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => handlePageChange(movementsData.currentPage + 1)}
                          className={movementsData.currentPage === movementsData.totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}

          {/* Summary Statistics */}
          {movementsData?.data && movementsData.data.length > 0 && (
            <div className="mt-6 p-4 bg-muted/30 rounded-lg">
              <h3 className="font-semibold mb-3">Summary Statistics</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Top Product:</span>
                  <span className="ml-2 font-medium">{stats.topProduct || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Average Transaction Size:</span>
                  <span className="ml-2 font-medium">{stats.avgTransactionSize.toFixed(1)} units</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Net Movement:</span>
                  <span className={`ml-2 font-medium ${stats.netChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {stats.netChange >= 0 ? '+' : ''}{stats.netChange} units
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
