-- Create products table
CREATE TABLE public.products (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    sku VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create inventory table (product + color combinations with stock)
CREATE TABLE public.inventory (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    color VARCHAR(100) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(product_id, color)
);

-- Create stock movements table
CREATE TABLE public.stock_movements (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    inventory_id UUID NOT NULL REFERENCES public.inventory(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    movement_type VARCHAR(10) NOT NULL CHECK (movement_type IN ('IN', 'OUT')),
    notes TEXT,
    movement_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables (but allow public access for simplicity - no auth required)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (simple inventory system without auth)
CREATE POLICY "Allow public read access on products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on products" ON public.products FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on products" ON public.products FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access on products" ON public.products FOR DELETE USING (true);

CREATE POLICY "Allow public read access on inventory" ON public.inventory FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on inventory" ON public.inventory FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on inventory" ON public.inventory FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access on inventory" ON public.inventory FOR DELETE USING (true);

CREATE POLICY "Allow public read access on stock_movements" ON public.stock_movements FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on stock_movements" ON public.stock_movements FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on stock_movements" ON public.stock_movements FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access on stock_movements" ON public.stock_movements FOR DELETE USING (true);

-- Create indexes for better performance
CREATE INDEX idx_inventory_product_id ON public.inventory(product_id);
CREATE INDEX idx_stock_movements_inventory_id ON public.stock_movements(inventory_id);
CREATE INDEX idx_stock_movements_date ON public.stock_movements(movement_date DESC);