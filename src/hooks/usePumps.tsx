
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
      const { data, error } = await supabase
        .from('pumps')
        .select(`
          *,
          fuel_tanks(name, fuel_type, current_level, price_per_liter)
        `)
        .order('position_number');

      if (error) {
        toast({
          title: "Erreur",
          description: "Impossible de charger les pompes",
          variant: "destructive",
        });
        throw error;
      }

      // Cast the status to the correct type since Supabase returns string
      return (data || []).map(pump => ({
        ...pump,
        status: pump.status as 'active' | 'inactive' | 'maintenance' | 'out_of_order'
      }));
    },
  });
};

export const useUpdatePumpStatus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Pump['status'] }) => {
      const { error } = await supabase
        .from('pumps')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
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
