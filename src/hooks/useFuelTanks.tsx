
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface FuelTank {
  id: string;
  name: string;
  fuel_type: 'gasoil' | 'essence' | 'melange';
  capacity: number;
  current_level: number;
  min_threshold: number;
  price_per_liter: number;
  created_at: string;
  updated_at: string;
}

export const useFuelTanks = () => {
  const { toast } = useToast();

  return useQuery({
    queryKey: ['fuel-tanks'],
    queryFn: async (): Promise<FuelTank[]> => {
      // Utiliser des données de test en attendant que les types Supabase soient mis à jour
      console.log('Using test data for fuel tanks - database tables not yet in Supabase types');
      return [
        {
          id: '1',
          name: 'Cuve Gasoil 1',
          fuel_type: 'gasoil',
          capacity: 10000,
          current_level: 7500,
          min_threshold: 1000,
          price_per_liter: 12.50,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Cuve Essence 1',
          fuel_type: 'essence',
          capacity: 8000,
          current_level: 6200,
          min_threshold: 800,
          price_per_liter: 14.20,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '3',
          name: 'Cuve Mélange 1',
          fuel_type: 'melange',
          capacity: 5000,
          current_level: 3800,
          min_threshold: 500,
          price_per_liter: 13.80,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
    },
  });
};

export const useUpdateFuelLevel = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, newLevel }: { id: string; newLevel: number }) => {
      // Pour l'instant, juste simuler la mise à jour
      console.log('Updating fuel level for tank:', id, 'to:', newLevel);
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fuel-tanks'] });
      toast({
        title: "Succès",
        description: "Niveau de carburant mis à jour",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le niveau",
        variant: "destructive",
      });
    },
  });
};
