import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Product, InventoryWithProduct, StockMovement } from '@/types/inventory';
import { toast } from 'sonner';

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name');
      if (error) throw error;
      return data as Product[];
    },
  });
}

export function useInventory() {
  return useQuery({
    queryKey: ['inventory'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventory')
        .select('*, products(*)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as InventoryWithProduct[];
    },
  });
}

export function useStockMovements(filters?: {
  movementType?: string;
  productId?: string;
  dateFrom?: string;
  dateTo?: string;
  notes?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['stock_movements', filters],
    queryFn: async () => {
      const page = filters?.page || 1;
      const limit = filters?.limit || 50;
      const offset = (page - 1) * limit;

      console.log('useStockMovements filters:', filters);

      let query = supabase
        .from('stock_movements')
        .select('*, inventory!inner(*, products(*))', { count: 'exact' })
        .order('movement_date', { ascending: false });

      // Apply filters
      if (filters?.movementType && filters.movementType !== 'all') {
        console.log('Applying movementType filter:', filters.movementType);
        query = query.eq('movement_type', filters.movementType);
      }

      if (filters?.productId && filters.productId !== 'all') {
        console.log('Applying productId filter:', filters.productId);
        query = query.eq('inventory.product_id', filters.productId);
      }

      if (filters?.dateFrom) {
        query = query.gte('movement_date', new Date(filters.dateFrom).toISOString());
      }

      if (filters?.dateTo) {
        const endDate = new Date(filters.dateTo);
        endDate.setHours(23, 59, 59, 999);
        query = query.lte('movement_date', endDate.toISOString());
      }

      if (filters?.notes) {
        query = query.ilike('notes', `%${filters.notes}%`);
      }

      const { data, error, count } = await query
        .range(offset, offset + limit - 1);
      
      console.log('Query result:', { data: data?.length, totalCount: count, error });
      
      if (error) throw error;
      return {
        data: data as StockMovement[],
        totalCount: count || 0,
        currentPage: page,
        totalPages: Math.ceil((count || 0) / limit)
      };
    },
  });
}

export function useAddProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ sku, name }: { sku: string; name: string }) => {
      const { data, error } = await supabase
        .from('products')
        .insert({ sku: sku.toUpperCase(), name })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product added successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useAddInventory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ product_id, color }: { product_id: string; color: string }) => {
      const { data, error } = await supabase
        .from('inventory')
        .insert({ product_id, color, quantity: 0 })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast.success('Color variant added successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useStockMovement() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (movements: Array<{ 
      inventory_id: string; 
      quantity: number; 
      movement_type: 'IN' | 'OUT';
      notes?: string;
    }>) => {
      const results = [];
      
      for (const movement of movements) {
        // First, get current inventory
        const { data: currentInventory, error: fetchError } = await supabase
          .from('inventory')
          .select('quantity')
          .eq('id', movement.inventory_id)
          .single();
        
        if (fetchError) throw fetchError;
        
        const newQuantity = movement.movement_type === 'IN' 
          ? currentInventory.quantity + movement.quantity 
          : currentInventory.quantity - movement.quantity;
        
        if (newQuantity < 0) {
          throw new Error(`Insufficient stock for item ${movement.inventory_id}`);
        }
        
        // Update inventory quantity
        const { error: updateError } = await supabase
          .from('inventory')
          .update({ quantity: newQuantity })
          .eq('id', movement.inventory_id);
        
        if (updateError) throw updateError;
        
        // Record the movement
        const { data, error: movementError } = await supabase
          .from('stock_movements')
          .insert({ 
            inventory_id: movement.inventory_id, 
            quantity: movement.quantity, 
            movement_type: movement.movement_type,
            notes: movement.notes || null,
            movement_date: new Date().toISOString()
          })
          .select()
          .single();
        
        if (movementError) throw movementError;
        results.push(data);
      }
      
      return results;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['stock_movements'] });
      const movementType = variables[0]?.movement_type;
      toast.success(`${variables.length} stock ${movementType === 'IN' ? 'additions' : 'removals'} processed successfully`);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
