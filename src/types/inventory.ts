export interface Product {
  id: string;
  sku: string;
  name: string;
  created_at: string;
}

export interface Inventory {
  id: string;
  product_id: string;
  color: string;
  quantity: number;
  created_at: string;
  products?: Product;
}

export interface StockMovement {
  id: string;
  inventory_id: string;
  quantity: number;
  movement_type: 'IN' | 'OUT';
  notes: string | null;
  movement_date: string;
  created_at: string;
  inventory?: Inventory & { products?: Product };
}

export interface InventoryWithProduct extends Inventory {
  products: Product;
}
