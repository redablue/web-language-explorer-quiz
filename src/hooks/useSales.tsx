
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useDoliProxy } from "@/hooks/useDoliProxy";
import { createInvoice } from "@/integrations/dolibarr/client";

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
      // Utiliser des données de test en attendant que les types Supabase soient mis à jour
      console.log('Using test data for sales - database tables not yet in Supabase types');
      return [
        {
          id: '1',
          user_id: 'test-user-1',
          fuel_tank_id: '1',
          pump_id: '1',
          quantity: 50,
          price_per_liter: 12.50,
          total_amount: 625,
          payment_method: 'cash',
          created_at: new Date().toISOString(),
          fuel_tanks: {
            name: 'Cuve Gasoil 1',
            fuel_type: 'gasoil'
          },
          profiles: {
            full_name: 'Utilisateur Test'
          },
          pumps: {
            name: 'Pompe 1',
            position_number: 1
          }
        }
      ];
    },
  });
};

export const useCreateSale = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();
  const { session, isErpConnected } = useDoliProxy();

  return useMutation({
    mutationFn: async (saleData: {
      fuel_tank_id: string;
      pump_id?: string;
      quantity: number;
      price_per_liter: number;
      payment_method: string;
      fuel_label?: string;
    }) => {
      if (!user) throw new Error('User not authenticated');

      const total_amount = saleData.quantity * saleData.price_per_liter;

      if (isErpConnected && session?.syncSales && session.dolApiKey && session.dolApiBase) {
        if (!session.defaultSocId) {
          throw new Error("Choisissez un client Dolibarr par défaut dans DoliProxy");
        }
        await createInvoice(session.dolApiBase, session.dolApiKey, {
          socid: session.defaultSocId,
          note_private: `Vente station ${saleData.payment_method} — ${new Date().toISOString()}`,
          lines: [
            {
              desc: `${saleData.fuel_label || "Carburant"} ${saleData.quantity} L`,
              subprice: saleData.price_per_liter,
              qty: saleData.quantity,
              tva_tx: 0,
            },
          ],
        });
      }

      return { total_amount };
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
    onError: (error) => {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible d'enregistrer la vente",
        variant: "destructive",
      });
    },
  });
};
