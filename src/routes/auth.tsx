import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Boxes } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({ component: AuthPage });

function AuthPage() {
  const nav = useNavigate();
  const { user, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) nav({ to: "/" });
  }, [user, loading, nav]);

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) toast.error(error.message);
    else { toast.success("Welcome back"); nav({ to: "/" }); }
  };

  const signUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { emailRedirectTo: window.location.origin, data: { full_name: name } },
    });
    setBusy(false);
    if (error) toast.error(error.message);
    else toast.success("Check your email to confirm your account");
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden lg:flex flex-col justify-between bg-sidebar p-12 text-sidebar-foreground overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-transparent to-primary-glow/20" />
        <div className="relative flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary shadow-elegant">
            <Boxes className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <div className="font-semibold">MILA PLASTICS</div>
            <div className="text-xs text-sidebar-foreground/60">Quzhou, China</div>
          </div>
        </div>
        <div className="relative space-y-6">
          <h1 className="text-4xl font-semibold leading-tight">
            Run your factory operations<br/>with confidence.
          </h1>
          <p className="max-w-md text-sidebar-foreground/70">
            Trigger sprayers, mist sprayers, lotion & foam pumps. Track every order from inquiry to delivery — production, shipping, payments, and customers in one premium workspace.
          </p>
          <div className="grid grid-cols-3 gap-4 max-w-md">
            {[["120+","Active orders"],["35","Countries"],["98%","On-time"]].map(([a,b])=>(
              <div key={b} className="rounded-lg border border-sidebar-border bg-sidebar-accent/40 p-4">
                <div className="text-2xl font-semibold text-sidebar-primary">{a}</div>
                <div className="text-xs text-sidebar-foreground/60">{b}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative text-xs text-sidebar-foreground/50">© {new Date().getFullYear()} MILA PLASTICS</div>
      </div>

      <div className="flex items-center justify-center bg-background p-6">
        <Card className="w-full max-w-md p-8 shadow-card">
          <h2 className="text-2xl font-semibold">Welcome</h2>
          <p className="mt-1 text-sm text-muted-foreground">Sign in to your operations dashboard.</p>
          <Tabs defaultValue="signin" className="mt-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign in</TabsTrigger>
              <TabsTrigger value="signup">Create account</TabsTrigger>
            </TabsList>
            <TabsContent value="signin" className="mt-6">
              <form onSubmit={signIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" required value={email} onChange={(e)=>setEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" required value={password} onChange={(e)=>setPassword(e.target.value)} />
                </div>
                <Button type="submit" className="w-full bg-gradient-primary shadow-elegant" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</Button>
              </form>
            </TabsContent>
            <TabsContent value="signup" className="mt-6">
              <form onSubmit={signUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full name</Label>
                  <Input id="name" required value={name} onChange={(e)=>setName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email2">Email</Label>
                  <Input id="email2" type="email" required value={email} onChange={(e)=>setEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pw2">Password</Label>
                  <Input id="pw2" type="password" required minLength={6} value={password} onChange={(e)=>setPassword(e.target.value)} />
                </div>
                <Button type="submit" className="w-full bg-gradient-primary shadow-elegant" disabled={busy}>{busy ? "Creating…" : "Create account"}</Button>
                <p className="text-center text-xs text-muted-foreground">First account becomes Admin automatically.</p>
              </form>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
