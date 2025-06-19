
-- Create enum for user roles
CREATE TYPE public.user_role AS ENUM ('gerant', 'responsable', 'caissier', 'pompiste');

-- Create enum for fuel types
CREATE TYPE public.fuel_type AS ENUM ('essence_95', 'essence_98', 'diesel', 'gasoil');

-- Create profiles table for user management
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'pompiste',
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create fuel tanks table
CREATE TABLE public.fuel_tanks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  fuel_type fuel_type NOT NULL,
  capacity DECIMAL(10,2) NOT NULL,
  current_level DECIMAL(10,2) NOT NULL DEFAULT 0,
  min_threshold DECIMAL(10,2) NOT NULL DEFAULT 500,
  price_per_liter DECIMAL(8,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sales table
CREATE TABLE public.sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  fuel_tank_id UUID REFERENCES public.fuel_tanks(id) NOT NULL,
  quantity DECIMAL(8,2) NOT NULL,
  price_per_liter DECIMAL(8,2) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  payment_method TEXT NOT NULL DEFAULT 'cash',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create inventory items table
CREATE TABLE public.inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  current_stock INTEGER NOT NULL DEFAULT 0,
  min_threshold INTEGER NOT NULL DEFAULT 10,
  unit_price DECIMAL(8,2) NOT NULL,
  supplier TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fuel_tanks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;

-- Create function to check user role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role user_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = _user_id
      AND role = _role
  )
$$;

-- Create function to check if user is manager or higher
CREATE OR REPLACE FUNCTION public.is_manager_or_higher(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = _user_id
      AND role IN ('gerant', 'responsable')
  )
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Managers can view all profiles" ON public.profiles
  FOR SELECT USING (public.is_manager_or_higher(auth.uid()));

-- RLS Policies for fuel_tanks
CREATE POLICY "All authenticated users can view fuel tanks" ON public.fuel_tanks
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Managers can manage fuel tanks" ON public.fuel_tanks
  FOR ALL USING (public.is_manager_or_higher(auth.uid()));

-- RLS Policies for sales
CREATE POLICY "Users can view own sales" ON public.sales
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "All authenticated users can insert sales" ON public.sales
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Managers can view all sales" ON public.sales
  FOR SELECT USING (public.is_manager_or_higher(auth.uid()));

-- RLS Policies for inventory
CREATE POLICY "All authenticated users can view inventory" ON public.inventory_items
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Managers can manage inventory" ON public.inventory_items
  FOR ALL USING (public.is_manager_or_higher(auth.uid()));

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Nouvel Utilisateur'),
    'pompiste'
  );
  RETURN NEW;
END;
$$;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert sample data
INSERT INTO public.fuel_tanks (name, fuel_type, capacity, current_level, min_threshold, price_per_liter) VALUES
  ('Cuve Essence 95 #1', 'essence_95', 10000.00, 7500.00, 1000.00, 1.65),
  ('Cuve Essence 98 #1', 'essence_98', 8000.00, 6200.00, 800.00, 1.75),
  ('Cuve Diesel #1', 'diesel', 12000.00, 9800.00, 1200.00, 1.55),
  ('Cuve Gasoil #1', 'gasoil', 15000.00, 12300.00, 1500.00, 1.45);

INSERT INTO public.inventory_items (name, category, current_stock, min_threshold, unit_price, supplier) VALUES
  ('Huile Moteur 5W30', 'Lubrifiant', 45, 10, 8.50, 'Total Energies'),
  ('Liquide Lave-Glace', 'Entretien', 28, 15, 3.20, 'Garage Supply'),
  ('Pneu 195/65R15', 'Pneumatique', 12, 5, 75.00, 'Michelin'),
  ('Batterie 12V 70Ah', 'Électrique', 8, 3, 95.00, 'Varta'),
  ('Cigarettes Marlboro', 'Tabac', 150, 50, 11.50, 'Philip Morris');
