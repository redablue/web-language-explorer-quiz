import { Badge } from "@/components/ui/badge";
import { useDoliProxy } from "@/hooks/useDoliProxy";
import { ShieldCheck, ShieldAlert } from "lucide-react";

const DoliProxyStatusBadge = ({ onClick }: { onClick?: () => void }) => {
  const { isConnected, isErpConnected, session, checking } = useDoliProxy();

  if (!isConnected) {
    return (
      <button type="button" onClick={onClick} className="inline-flex">
        <Badge variant="outline" className="gap-1 text-amber-700 border-amber-300">
          <ShieldAlert className="h-3 w-3" />
          DoliProxy déconnecté
        </Badge>
      </button>
    );
  }

  return (
    <button type="button" onClick={onClick} className="inline-flex">
      <Badge variant="secondary" className="gap-1">
        <ShieldCheck className={`h-3 w-3 ${isErpConnected ? "text-green-600" : "text-amber-600"}`} />
        {checking ? "DoliProxy…" : isErpConnected ? session?.companyName || "Dolibarr connecté" : "DoliProxy actif"}
      </Badge>
    </button>
  );
};

export default DoliProxyStatusBadge;
