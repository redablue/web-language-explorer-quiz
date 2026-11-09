import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useDoliProxy } from "@/hooks/useDoliProxy";
import { checkSlug, DoliProxyError, firstValidationError, normalizeSlug } from "@/integrations/doliproxy/client";
import { listThirdParties, loginForApiKey, type DolibarrThirdParty } from "@/integrations/dolibarr/client";
import { SLUG_PATTERN } from "@/integrations/doliproxy/types";
import { useToast } from "@/hooks/use-toast";
import {
  CheckCircle2,
  Globe,
  KeyRound,
  Link2,
  Loader2,
  Mail,
  RefreshCw,
  Shield,
  Unplug,
} from "lucide-react";

const DoliProxySettings = () => {
  const {
    session,
    pending,
    checking,
    isConnected,
    isErpConnected,
    dolibarr,
    startCreate,
    confirmCreate,
    resendCode,
    startRestore,
    confirmRestore,
    connectExisting,
    refreshStatus,
    saveDolApiKey,
    setSyncSales,
    setDefaultSocId,
    disconnect,
    cancelPending,
  } = useDoliProxy();
  const { toast } = useToast();

  const [email, setEmail] = useState(pending?.email || session?.email || "");
  const [slug, setSlug] = useState(pending?.slug || session?.slug || "");
  const [trueAddress, setTrueAddress] = useState(pending?.trueAddress || session?.trueAddress || "");
  const [code, setCode] = useState("");
  const [existingToken, setExistingToken] = useState("");
  const [dolApiKey, setDolApiKey] = useState("");
  const [dolLogin, setDolLogin] = useState("");
  const [dolPassword, setDolPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [slugHint, setSlugHint] = useState<string>("");
  const [slugOk, setSlugOk] = useState<boolean | null>(null);
  const [customers, setCustomers] = useState<DolibarrThirdParty[]>([]);

  const normalizedSlug = useMemo(() => normalizeSlug(slug), [slug]);

  useEffect(() => {
    if (!normalizedSlug) {
      setSlugHint("");
      setSlugOk(null);
      return;
    }
    if (!SLUG_PATTERN.test(normalizedSlug)) {
      setSlugOk(false);
      setSlugHint("3 à 32 caractères : a-z, 0-9, tiret (pas au début ni à la fin).");
      return;
    }

    const handle = window.setTimeout(async () => {
      try {
        const result = await checkSlug(normalizedSlug);
        if (result.available) {
          setSlugOk(true);
          setSlugHint(`Adresse publique : https://${result.full_subdomain}`);
        } else {
          setSlugOk(false);
          setSlugHint(result.message || "Cet identifiant n'est pas disponible.");
        }
      } catch (error) {
        setSlugOk(false);
        setSlugHint(error instanceof Error ? error.message : "Impossible de vérifier l'identifiant");
      }
    }, 400);

    return () => window.clearTimeout(handle);
  }, [normalizedSlug]);

  useEffect(() => {
    if (!session?.dolApiKey || !session.dolApiBase) return;
    listThirdParties(session.dolApiBase, session.dolApiKey, 50)
      .then(setCustomers)
      .catch(() => setCustomers([]));
  }, [session?.dolApiBase, session?.dolApiKey]);

  const run = async (action: () => Promise<void>, success: string) => {
    setBusy(true);
    try {
      await action();
      toast({ title: "DoliProxy", description: success });
    } catch (error) {
      const message =
        error instanceof DoliProxyError
          ? firstValidationError(error.body) || error.message
          : error instanceof Error
            ? error.message
            : "Une erreur est survenue";
      toast({ title: "Erreur", description: message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  const connectedCard = isConnected && session && (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-600" />
              Proxy connecté
            </CardTitle>
            <CardDescription>
              Les appels Dolibarr de la station passent par DoliProxy.
            </CardDescription>
          </div>
          <Badge variant={session.lastStatus?.status === "active" ? "default" : "secondary"}>
            {session.lastStatus?.status || "inconnu"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-2 text-sm">
          <div>
            <p className="text-muted-foreground">Adresse publique</p>
            <a className="font-medium text-primary break-all" href={session.proxyUrl} target="_blank" rel="noreferrer">
              {session.proxyUrl}
            </a>
          </div>
          <div>
            <p className="text-muted-foreground">Dolibarr (cible)</p>
            <p className="font-medium break-all">{session.trueAddress}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Identifiant</p>
            <p className="font-medium">{session.slug}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Email</p>
            <p className="font-medium">{session.email || "—"}</p>
          </div>
        </div>

        {session.lastStatus?.is_trial && session.lastStatus.trial_ends_at && (
          <Alert>
            <AlertTitle>Essai DoliProxy</AlertTitle>
            <AlertDescription>
              Fin de l'essai : {new Date(session.lastStatus.trial_ends_at).toLocaleString("fr-FR")}
            </AlertDescription>
          </Alert>
        )}

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => run(async () => { await refreshStatus(); }, "Statut actualisé")} disabled={checking || busy}>
            {checking ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            Vérifier le proxy
          </Button>
          <Button variant="destructive" onClick={disconnect}>
            <Unplug className="h-4 w-4 mr-2" />
            Déconnecter
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const erpCard = isConnected && session && (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <KeyRound className="h-5 w-5" />
          Clé API Dolibarr
        </CardTitle>
        <CardDescription>
          Utilisez la clé API d'un utilisateur Dolibarr (fiche utilisateur → Clé API), ou connectez-vous pour la récupérer.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isErpConnected && dolibarr && (
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>{dolibarr.company?.name || "Dolibarr joignable"}</AlertTitle>
            <AlertDescription>
              {dolibarr.user?.login ? `Utilisateur API : ${dolibarr.user.login}. ` : ""}
              {dolibarr.version ? `Version ${dolibarr.version}. ` : ""}
              Base API : {dolibarr.apiBase}
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="dol-key">DOLAPIKEY</Label>
          <Input
            id="dol-key"
            type="password"
            autoComplete="off"
            placeholder="Clé API Dolibarr"
            value={dolApiKey}
            onChange={(e) => setDolApiKey(e.target.value)}
          />
        </div>
        <Button
          disabled={busy || !dolApiKey}
          onClick={() => run(async () => { await saveDolApiKey(dolApiKey); setDolApiKey(""); }, "Dolibarr connecté via DoliProxy")}
        >
          {busy ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Link2 className="h-4 w-4 mr-2" />}
          Tester et enregistrer
        </Button>

        <div className="border-t pt-4 space-y-3">
          <p className="text-sm text-muted-foreground">Ou obtenir la clé avec un identifiant Dolibarr</p>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="dol-login">Identifiant</Label>
              <Input id="dol-login" value={dolLogin} onChange={(e) => setDolLogin(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dol-password">Mot de passe</Label>
              <Input id="dol-password" type="password" value={dolPassword} onChange={(e) => setDolPassword(e.target.value)} />
            </div>
          </div>
          <Button
            variant="outline"
            disabled={busy || !dolLogin || !dolPassword || !session}
            onClick={() => run(async () => {
              const bases = [session.dolApiBase, session.proxyUrl, `${session.proxyUrl.replace(/\/$/, "")}/api/index.php`].filter(Boolean) as string[];
              let token: string | undefined;
              let lastError: unknown;
              for (const base of bases) {
                try {
                  token = await loginForApiKey(base, dolLogin, dolPassword);
                  break;
                } catch (error) {
                  lastError = error;
                }
              }
              if (!token) throw lastError instanceof Error ? lastError : new Error("Connexion Dolibarr refusée");
              await saveDolApiKey(token);
              setDolLogin("");
              setDolPassword("");
            }, "Clé API récupérée")}
          >
            Se connecter à Dolibarr
          </Button>
        </div>

        {isErpConnected && (
          <div className="border-t pt-4 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-medium">Envoyer les ventes vers Dolibarr</p>
                <p className="text-sm text-muted-foreground">Chaque encaissement crée une facture via DoliProxy.</p>
              </div>
              <Switch checked={session.syncSales} onCheckedChange={setSyncSales} />
            </div>
            {customers.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="default-customer">Client Dolibarr par défaut</Label>
                <select
                  id="default-customer"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={session.defaultSocId ?? ""}
                  onChange={(e) => setDefaultSocId(e.target.value ? Number(e.target.value) : undefined)}
                >
                  <option value="">Choisir un tiers</option>
                  {customers.map((customer) => (
                    <option key={String(customer.id)} value={String(customer.id)}>
                      {customer.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const codeForm = pending && (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Code envoyé par email
        </CardTitle>
        <CardDescription>
          Un code à 6 chiffres a été envoyé à {pending.email}
          {pending.expiresAt ? ` (valable jusqu'à ${new Date(pending.expiresAt).toLocaleTimeString("fr-FR")})` : ""}.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <InputOTP maxLength={6} value={code} onChange={setCode}>
          <InputOTPGroup>
            {Array.from({ length: 6 }).map((_, index) => (
              <InputOTPSlot key={index} index={index} />
            ))}
          </InputOTPGroup>
        </InputOTP>
        <div className="flex flex-wrap gap-2">
          <Button
            disabled={busy || code.length !== 6}
            onClick={() => run(async () => {
              if (pending.kind === "recover") await confirmRestore(code);
              else await confirmCreate(code);
              setCode("");
            }, "DoliProxy connecté")}
          >
            {busy ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
            Confirmer
          </Button>
          {pending.kind === "onboard" && (
            <Button variant="outline" disabled={busy} onClick={() => run(resendCode, "Nouveau code envoyé")}>
              Renvoyer le code
            </Button>
          )}
          <Button variant="ghost" onClick={cancelPending}>Annuler</Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Connexion DoliProxy</h1>
        <p className="text-muted-foreground mt-1">
          Reliez la station à votre Dolibarr via un reverse proxy sécurisé.
        </p>
      </div>

      {connectedCard}
      {erpCard}
      {codeForm}

      {!isConnected && !pending && (
        <Tabs defaultValue="create">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="create">Créer un proxy</TabsTrigger>
            <TabsTrigger value="existing">J'ai déjà un proxy</TabsTrigger>
          </TabsList>

          <TabsContent value="create">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Enregistrer un DoliProxy
                </CardTitle>
                <CardDescription>
                  DoliProxy crée une adresse publique et envoie un code de confirmation à votre email.
                  Dans Dolibarr, autorisez uniquement l'IP du proxy pour l'API REST.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vous@entreprise.fr" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Identifiant public</Label>
                  <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="ma-station" />
                  {slugHint && (
                    <p className={`text-sm ${slugOk ? "text-green-600" : "text-amber-700"}`}>{slugHint}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="true-address">URL de l'API Dolibarr</Label>
                  <Input
                    id="true-address"
                    value={trueAddress}
                    onChange={(e) => setTrueAddress(e.target.value)}
                    placeholder="https://erp.exemple.fr/api/index.php"
                  />
                </div>
                <Button
                  disabled={busy || !email || !trueAddress || slugOk !== true}
                  onClick={() => run(async () => {
                    await startCreate({ email, slug: normalizedSlug, trueAddress });
                  }, "Code envoyé par email")}
                >
                  {busy ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Mail className="h-4 w-4 mr-2" />}
                  Envoyer le code
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="existing">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Récupérer l'accès</CardTitle>
                  <CardDescription>
                    Un code est envoyé si un proxy existe déjà pour cet email et cet identifiant.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="recover-email">Email</Label>
                    <Input id="recover-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="recover-slug">Identifiant</Label>
                    <Input id="recover-slug" value={slug} onChange={(e) => setSlug(e.target.value)} />
                  </div>
                  <Button
                    disabled={busy || !email || !normalizedSlug}
                    onClick={() => run(async () => {
                      await startRestore({ email, slug: normalizedSlug });
                    }, "Si un proxy existe, un email a été envoyé")}
                  >
                    Récupérer
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Jeton déjà connu</CardTitle>
                  <CardDescription>
                    Collez le jeton Bearer fourni à la création du proxy, puis testez-le.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="proxy-token">Jeton DoliProxy</Label>
                    <Input
                      id="proxy-token"
                      type="password"
                      autoComplete="off"
                      value={existingToken}
                      onChange={(e) => setExistingToken(e.target.value)}
                    />
                  </div>
                  <Button
                    disabled={busy || !existingToken}
                    onClick={() => run(async () => {
                      await connectExisting({ proxyToken: existingToken, slug: normalizedSlug, email });
                      setExistingToken("");
                    }, "Proxy vérifié et enregistré")}
                  >
                    Connecter
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default DoliProxySettings;
