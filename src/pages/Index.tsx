import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AddProductForm } from '@/components/AddProductForm';
import { AddColorForm } from '@/components/AddColorForm';
import { StockMovementForm } from '@/components/StockMovementForm';
import { InventoryTable } from '@/components/InventoryTable';
import { MovementHistory } from '@/components/MovementHistory';
import { StatsCards } from '@/components/StatsCards';
import { ReportPage } from '@/components/ReportPage';
import { AnalysisPage } from '@/components/AnalysisPage';
import { UserMenu } from '@/components/UserMenu';
import { Shirt, FileText, BarChart3 } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary rounded-lg">
                <Shirt className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold"><a href='https:deev-community.netlify.app'>Deev Community</a></h1>
                <p className="text-sm text-muted-foreground">Prude Style</p>
              </div>
            </div>
            <UserMenu />
          </div>
        </div>
      </header>

      <main className="container py-6 space-y-6">
        <StatsCards />
        
        <Tabs defaultValue="stock" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 max-w-2xl">
            <TabsTrigger value="stock">Stock</TabsTrigger>
            <TabsTrigger value="movement">IN / OUT</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="stock" className="space-y-6">
            <InventoryTable />
          </TabsContent>
          
          <TabsContent value="movement" className="space-y-6">
            <div className="max-w-xl">
              <StockMovementForm />
            </div>
          </TabsContent>
          
          <TabsContent value="products" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <AddProductForm />
              <AddColorForm />
            </div>
          </TabsContent>
          
          <TabsContent value="analysis" className="space-y-6">
            <AnalysisPage />
          </TabsContent>
          
          <TabsContent value="reports" className="space-y-6">
            <ReportPage />
          </TabsContent>
          
          <TabsContent value="history" className="space-y-6">
            <MovementHistory />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
