import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { FileText, Upload, Download, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/documents")({ component: () => <DashboardLayout><Documents/></DashboardLayout> });

const cats = [
  { name: "Invoices", count: 84, color: "from-primary/20 to-primary/0" },
  { name: "Packing Lists", count: 56, color: "from-success/20 to-success/0" },
  { name: "Contracts", count: 23, color: "from-warning/20 to-warning/0" },
  { name: "Product Photos", count: 412, color: "from-chart-4/20 to-chart-4/0" },
  { name: "Shipping Docs", count: 67, color: "from-destructive/20 to-destructive/0" },
];

type FileRow = { name: string; path: string; size: number; updated_at: string };

function Documents() {
  const { user } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<FileRow[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  const prefix = user?.id ?? "";

  async function load() {
    if (!prefix) return;
    setLoading(true);
    const { data, error } = await supabase.storage.from("documents").list(prefix, {
      sortBy: { column: "updated_at", order: "desc" },
      limit: 100,
    });
    if (error) toast.error(error.message);
    else setFiles((data ?? []).filter(f => f.name).map(f => ({
      name: f.name, path: `${prefix}/${f.name}`,
      size: (f.metadata as any)?.size ?? 0,
      updated_at: f.updated_at ?? f.created_at ?? "",
    })));
    setLoading(false);
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [prefix]);

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const list = e.target.files;
    if (!list || !list.length || !prefix) return;
    setUploading(true);
    try {
      for (const file of Array.from(list)) {
        const path = `${prefix}/${Date.now()}-${file.name}`;
        const { error } = await supabase.storage.from("documents").upload(path, file, {
          cacheControl: "3600", upsert: false, contentType: file.type || undefined,
        });
        if (error) throw error;
      }
      toast.success(`Uploaded ${list.length} file${list.length > 1 ? "s" : ""}`);
      await load();
    } catch (err: any) {
      toast.error(err.message ?? "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function download(path: string, name: string) {
    const { data, error } = await supabase.storage.from("documents").createSignedUrl(path, 60);
    if (error || !data) { toast.error(error?.message ?? "Failed"); return; }
    const a = document.createElement("a");
    a.href = data.signedUrl; a.download = name; a.click();
  }

  async function remove(path: string) {
    const { error } = await supabase.storage.from("documents").remove([path]);
    if (error) toast.error(error.message);
    else { toast.success("Deleted"); load(); }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div><h1 className="text-2xl font-semibold">Documents</h1><p className="text-sm text-muted-foreground">Invoices, packing lists, contracts and more</p></div>
        <input ref={inputRef} type="file" multiple className="hidden" onChange={onPick} />
        <Button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="bg-gradient-primary shadow-elegant"
        >
          {uploading ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Upload className="mr-1 h-4 w-4" />}
          {uploading ? "Uploading…" : "Upload"}
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
        {cats.map(d => (
          <Card key={d.name} className="relative overflow-hidden p-5 shadow-card transition-all hover:shadow-elegant">
            <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br opacity-60 ${d.color}`}/>
            <div className="relative">
              <FileText className="h-8 w-8 text-primary"/>
              <div className="mt-3 text-2xl font-semibold">{d.count}</div>
              <div className="text-sm text-muted-foreground">{d.name}</div>
            </div>
          </Card>
        ))}
      </div>
      <Card className="shadow-card">
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="font-medium">Your uploads</h2>
          <span className="text-xs text-muted-foreground">{files.length} file{files.length === 1 ? "" : "s"}</span>
        </div>
        {loading ? (
          <div className="p-12 text-center text-muted-foreground"><Loader2 className="mx-auto h-6 w-6 animate-spin"/></div>
        ) : files.length === 0 ? (
          <div
            onClick={() => inputRef.current?.click()}
            className="cursor-pointer p-12 text-center hover:bg-muted/40"
          >
            <FileText className="mx-auto h-12 w-12 text-muted-foreground/40"/>
            <p className="mt-4 text-muted-foreground">Click upload or this area to attach documents.</p>
          </div>
        ) : (
          <ul className="divide-y">
            {files.map(f => (
              <li key={f.path} className="flex items-center gap-3 px-4 py-3">
                <FileText className="h-5 w-5 text-primary"/>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{f.name}</div>
                  <div className="text-xs text-muted-foreground">{(f.size/1024).toFixed(1)} KB · {new Date(f.updated_at).toLocaleString()}</div>
                </div>
                <Button size="sm" variant="ghost" onClick={() => download(f.path, f.name)}><Download className="h-4 w-4"/></Button>
                <Button size="sm" variant="ghost" onClick={() => remove(f.path)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
