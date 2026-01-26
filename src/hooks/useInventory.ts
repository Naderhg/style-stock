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

export function useStockMovements() {
  return useQuery({
    queryKey: ['stock_movements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stock_movements')
        .select('*, inventory(*, products(*))')
        .order('movement_date', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data as StockMovement[];
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
    mutationFn: async ({ 
      inventory_id, 
      quantity, 
      movement_type, 
      notes 
    }: { 
      inventory_id: string; 
      quantity: number; 
      movement_type: 'IN' | 'OUT';
      notes?: string;
    }) => {
      // First, get current inventory
      const { data: currentInventory, error: fetchError } = await supabase
        .from('inventory')
        .select('quantity')
        .eq('id', inventory_id)
        .single();
      
      if (fetchError) throw fetchError;
      
      const newQuantity = movement_type === 'IN' 
        ? currentInventory.quantity + quantity 
        : currentInventory.quantity - quantity;
      
      if (newQuantity < 0) {
        throw new Error('Insufficient stock');
      }
      
      // Update inventory quantity
      const { error: updateError } = await supabase
        .from('inventory')
        .update({ quantity: newQuantity })
        .eq('id', inventory_id);
      
      if (updateError) throw updateError;
      
      // Record the movement
      const { data, error: movementError } = await supabase
        .from('stock_movements')
        .insert({ 
          inventory_id, 
          quantity, 
          movement_type,
          notes: notes || null,
          movement_date: new Date().toISOString()
        })
        .select()
        .single();
      
      if (movementError) throw movementError;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['stock_movements'] });
      toast.success(`Stock ${variables.movement_type === 'IN' ? 'added' : 'removed'} successfully`);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
