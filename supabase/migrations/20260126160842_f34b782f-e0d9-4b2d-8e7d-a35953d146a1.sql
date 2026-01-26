-- Drop existing public policies
DROP POLICY IF EXISTS "Allow public delete access on inventory" ON public.inventory;
DROP POLICY IF EXISTS "Allow public insert access on inventory" ON public.inventory;
DROP POLICY IF EXISTS "Allow public read access on inventory" ON public.inventory;
DROP POLICY IF EXISTS "Allow public update access on inventory" ON public.inventory;

DROP POLICY IF EXISTS "Allow public delete access on products" ON public.products;
DROP POLICY IF EXISTS "Allow public insert access on products" ON public.products;
DROP POLICY IF EXISTS "Allow public read access on products" ON public.products;
DROP POLICY IF EXISTS "Allow public update access on products" ON public.products;

DROP POLICY IF EXISTS "Allow public delete access on stock_movements" ON public.stock_movements;
DROP POLICY IF EXISTS "Allow public insert access on stock_movements" ON public.stock_movements;
DROP POLICY IF EXISTS "Allow public read access on stock_movements" ON public.stock_movements;
DROP POLICY IF EXISTS "Allow public update access on stock_movements" ON public.stock_movements;

-- Create authenticated-only policies for products
CREATE POLICY "Authenticated users can read products"
ON public.products FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert products"
ON public.products FOR INSERT TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update products"
ON public.products FOR UPDATE TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete products"
ON public.products FOR DELETE TO authenticated
USING (true);

-- Create authenticated-only policies for inventory
CREATE POLICY "Authenticated users can read inventory"
ON public.inventory FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert inventory"
ON public.inventory FOR INSERT TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update inventory"
ON public.inventory FOR UPDATE TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete inventory"
ON public.inventory FOR DELETE TO authenticated
USING (true);

-- Create authenticated-only policies for stock_movements
CREATE POLICY "Authenticated users can read stock_movements"
ON public.stock_movements FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert stock_movements"
ON public.stock_movements FOR INSERT TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update stock_movements"
ON public.stock_movements FOR UPDATE TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete stock_movements"
ON public.stock_movements FOR DELETE TO authenticated
USING (true);