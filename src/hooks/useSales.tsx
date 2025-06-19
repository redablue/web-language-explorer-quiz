
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export interface Sale {
  id: string;
  user_id: string;
  fuel_tank_id: string;
  pump_id?: string;
  quantity: number;
  price_per_liter: number;
  total_amount: number;
  payment_method: string;
  created_at: string;
  fuel_tanks?: {
    name: string;
    fuel_type: string;
  };
  profiles?: {
    full_name: string;
  };
  pumps?: {
    name: string;
    position_number: number;
  };
}

export const useSales = (dateFilter?: { from: string; to: string }) => {
  const { toast } = useToast();
  const { isManagerOrHigher } = useAuth();

  return useQuery({
    queryKey: ['sales', dateFilter],
    queryFn: async (): Promise<Sale[]> => {
      let query = supabase
        .from('sales')
        .select(`
          *,
          fuel_tanks(name, fuel_type),
          profiles(full_name),
          pumps(name, position_number)
        `)
        .order('created_at', { ascending: false });

      if (dateFilter) {
        query = query
          .gte('created_at', dateFilter.from)
          .lte('created_at', dateFilter.to);
      }

      // Si pas manager, limiter aux ventes du jour
      if (!isManagerOrHigher()) {
        const today = new Date().toISOString().split('T')[0];
        query = query.gte('created_at', `${today}T00:00:00.000Z`);
      }

      const { data, error } = await query;

      if (error) {
        toast({
          title: "Erreur",
          description: "Impossible de charger les ventes",
          variant: "destructive",
        });
        throw error;
      }

      return data || [];
    },
  });
};

export const useCreateSale = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (saleData: {
      fuel_tank_id: string;
      pump_id?: string;
      quantity: number;
      price_per_liter: number;
      payment_method: string;
    }) => {
      if (!user) throw new Error('User not authenticated');

      const total_amount = saleData.quantity * saleData.price_per_liter;

      const { error } = await supabase
        .from('sales')
        .insert({
          ...saleData,
          user_id: user.id,
          total_amount,
        });

      if (error) throw error;

      // Mettre à jour le total distribué de la pompe si une pompe est sélectionnée
      if (saleData.pump_id) {
        const { error: pumpError } = await supabase.rpc(
          'increment_pump_total',
          { 
            pump_id: saleData.pump_id, 
            quantity: saleData.quantity 
          }
        );
        // Ignorer l'erreur si la fonction n'existe pas encore
        console.log('Pump update result:', pumpError);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['fuel-tanks'] });
      queryClient.invalidateQueries({ queryKey: ['pumps'] });
      toast({
        title: "Succès",
        description: "Vente enregistrée avec succès",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer la vente",
        variant: "destructive",
      });
    },
  });
};
