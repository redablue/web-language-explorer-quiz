
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Pump {
  id: string;
  name: string;
  fuel_tank_id: string;
  status: 'active' | 'inactive' | 'maintenance' | 'out_of_order';
  position_number: number;
  total_dispensed: number;
  last_maintenance: string | null;
  created_at: string;
  updated_at: string;
  fuel_tanks?: {
    name: string;
    fuel_type: string;
    current_level: number;
    price_per_liter: number;
  };
}

export const usePumps = () => {
  const { toast } = useToast();

  return useQuery({
    queryKey: ['pumps'],
    queryFn: async (): Promise<Pump[]> => {
      // Retourner des données de test pour l'instant
      return [
        {
          id: '1',
          name: 'Pompe 1',
          fuel_tank_id: '1',
          status: 'active',
          position_number: 1,
          total_dispensed: 5000,
          last_maintenance: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          fuel_tanks: {
            name: 'Cuve Gasoil 1',
            fuel_type: 'gasoil',
            current_level: 7500,
            price_per_liter: 12.50
          }
        },
        {
          id: '2',
          name: 'Pompe 2',
          fuel_tank_id: '2',
          status: 'active',
          position_number: 2,
          total_dispensed: 3200,
          last_maintenance: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          fuel_tanks: {
            name: 'Cuve Essence 1',
            fuel_type: 'essence',
            current_level: 6200,
            price_per_liter: 14.20
          }
        },
        {
          id: '3',
          name: 'Pompe 3',
          fuel_tank_id: '1',
          status: 'maintenance',
          position_number: 3,
          total_dispensed: 1800,
          last_maintenance: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          fuel_tanks: {
            name: 'Cuve Gasoil 1',
            fuel_type: 'gasoil',
            current_level: 7500,
            price_per_liter: 12.50
          }
        }
      ];
    },
  });
};

export const useUpdatePumpStatus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Pump['status'] }) => {
      // Pour l'instant, juste simuler la mise à jour
      console.log('Updating pump status for pump:', id, 'to:', status);
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pumps'] });
      toast({
        title: "Succès",
        description: "Statut de la pompe mis à jour",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut",
        variant: "destructive",
      });
    },
  });
};
