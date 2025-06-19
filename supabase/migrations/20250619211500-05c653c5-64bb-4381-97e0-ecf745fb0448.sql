
-- Create pumps table
CREATE TABLE public.pumps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  fuel_tank_id UUID REFERENCES public.fuel_tanks(id) NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance', 'out_of_order')),
  position_number INTEGER NOT NULL UNIQUE CHECK (position_number >= 1 AND position_number <= 8),
  total_dispensed DECIMAL(10,2) NOT NULL DEFAULT 0,
  last_maintenance DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for pumps
ALTER TABLE public.pumps ENABLE ROW LEVEL SECURITY;

-- RLS Policy for pumps
CREATE POLICY "All authenticated users can view pumps" ON public.pumps
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Managers can manage pumps" ON public.pumps
  FOR ALL USING (public.is_manager_or_higher(auth.uid()));

-- Insert sample pumps data
INSERT INTO public.pumps (name, fuel_tank_id, position_number, status) 
SELECT 
  'Pompe ' || generate_series AS name,
  (SELECT id FROM public.fuel_tanks ORDER BY created_at LIMIT 1 OFFSET (generate_series - 1) % 4) AS fuel_tank_id,
  generate_series AS position_number,
  CASE 
    WHEN generate_series <= 6 THEN 'active'
    WHEN generate_series = 7 THEN 'maintenance' 
    ELSE 'inactive'
  END AS status
FROM generate_series(1, 8);

-- Add pump_id to sales table for tracking which pump was used
ALTER TABLE public.sales ADD COLUMN pump_id UUID REFERENCES public.pumps(id);

-- Update existing sales with random pump assignments (for demo purposes)
UPDATE public.sales 
SET pump_id = (
  SELECT id FROM public.pumps 
  WHERE status = 'active' 
  ORDER BY random() 
  LIMIT 1
);
