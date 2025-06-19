
-- Modifier l'enum fuel_type pour avoir seulement 3 types
ALTER TYPE public.fuel_type RENAME TO fuel_type_old;

CREATE TYPE public.fuel_type AS ENUM ('gasoil', 'essence', 'melange');

-- Mettre à jour la table fuel_tanks avec la nouvelle enum
ALTER TABLE public.fuel_tanks ALTER COLUMN fuel_type TYPE fuel_type USING 
  CASE 
    WHEN fuel_type::text IN ('essence_95', 'essence_98') THEN 'essence'::fuel_type
    WHEN fuel_type::text = 'diesel' THEN 'gasoil'::fuel_type
    WHEN fuel_type::text = 'gasoil' THEN 'gasoil'::fuel_type
    ELSE 'melange'::fuel_type
  END;

-- Supprimer l'ancien type
DROP TYPE fuel_type_old;

-- Mettre à jour les données existantes pour avoir des exemples des 3 types
UPDATE public.fuel_tanks 
SET name = CASE 
  WHEN fuel_type = 'gasoil' THEN 'Cuve Gasoil #1'
  WHEN fuel_type = 'essence' THEN 'Cuve Essence #1'
  ELSE name
END;

-- Ajouter une cuve de mélange si elle n'existe pas
INSERT INTO public.fuel_tanks (name, fuel_type, capacity, current_level, min_threshold, price_per_liter)
SELECT 'Cuve Mélange #1', 'melange', 10000.00, 8000.00, 1000.00, 1.60
WHERE NOT EXISTS (SELECT 1 FROM public.fuel_tanks WHERE fuel_type = 'melange');
