
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface FuelTank {
  id: string;
  name: string;
  fuel_type: 'essence_95' | 'essence_98' | 'diesel' | 'gasoil';
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
      const { data, error } = await supabase
        .from('fuel_tanks')
        .select('*')
        .order('name');

      if (error) {
        toast({
          title: "Erreur",
          description: "Impossible de charger les cuves",
          variant: "destructive",
        });
        throw error;
      }

      return data || [];
    },
  });
};

export const useUpdateFuelLevel = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, newLevel }: { id: string; newLevel: number }) => {
      const { error } = await supabase
        .from('fuel_tanks')
        .update({ 
          current_level: newLevel,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
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
