import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Trash2, Pencil, Wheat } from "lucide-react";

const statusOptions = ["plantada", "crescendo", "colheita", "finalizada"];

const Cultures = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", area_hectares: "", planting_date: "", expected_harvest: "", status: "plantada", notes: "", property_id: "" });

  const { data: cultures = [] } = useQuery({
    queryKey: ["cultures"],
    queryFn: async () => { const { data, error } = await supabase.from("cultures").select("*, properties(name)").order("created_at", { ascending: false }); if (error) throw error; return data; },
    enabled: !!user,
  });

  const { data: properties = [] } = useQuery({
    queryKey: ["properties"],
    queryFn: async () => { const { data } = await supabase.from("properties").select("id, name").order("name"); return data || []; },
    enabled: !!user,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = { name: form.name, area_hectares: form.area_hectares ? Number(form.area_hectares) : null, planting_date: form.planting_date || null, expected_harvest: form.expected_harvest || null, status: form.status, notes: form.notes || null, property_id: form.property_id || null, user_id: user!.id };
      if (editId) { const { error } = await supabase.from("cultures").update(payload).eq("id", editId); if (error) throw error; }
      else { const { error } = await supabase.from("cultures").insert(payload); if (error) throw error; }
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["cultures"] }); toast.success(editId ? "Cultura atualizada!" : "Cultura cadastrada!"); resetForm(); },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("cultures").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["cultures"] }); toast.success("Cultura removida!"); },
  });

  const resetForm = () => { setForm({ name: "", area_hectares: "", planting_date: "", expected_harvest: "", status: "plantada", notes: "", property_id: "" }); setEditId(null); setOpen(false); };

  const startEdit = (c: any) => {
    setForm({ name: c.name, area_hectares: c.area_hectares?.toString() || "", planting_date: c.planting_date || "", expected_harvest: c.expected_harvest || "", status: c.status || "plantada", notes: c.notes || "", property_id: c.property_id || "" });
    setEditId(c.id); setOpen(true);
  };

  const statusColor = (s: string) => {
    switch (s) { case "plantada": return "bg-blue-100 text-blue-800"; case "crescendo": return "bg-green-100 text-green-800"; case "colheita": return "bg-yellow-100 text-yellow-800"; case "finalizada": return "bg-gray-100 text-gray-800"; default: return ""; }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-heading font-bold">Culturas</h1><p className="text-muted-foreground">Gerencie suas culturas agrícolas</p></div>
        <Dialog open={open} onOpenChange={(o) => { if (!o) resetForm(); setOpen(o); }}>
          <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" />Nova Cultura</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editId ? "Editar" : "Nova"} Cultura</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(); }} className="space-y-4">
              <Input placeholder="Nome da cultura" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              <Input type="number" step="0.01" placeholder="Área (hectares)" value={form.area_hectares} onChange={(e) => setForm({ ...form, area_hectares: e.target.value })} />
              <Input type="date" placeholder="Data de plantio" value={form.planting_date} onChange={(e) => setForm({ ...form, planting_date: e.target.value })} />
              <Input type="date" placeholder="Previsão de colheita" value={form.expected_harvest} onChange={(e) => setForm({ ...form, expected_harvest: e.target.value })} />
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{statusOptions.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}</SelectContent>
              </Select>
              <Input placeholder="Observações" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              <Select value={form.property_id} onValueChange={(v) => setForm({ ...form, property_id: v })}>
                <SelectTrigger><SelectValue placeholder="Propriedade (opcional)" /></SelectTrigger>
                <SelectContent>{properties.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
              </Select>
              <Button type="submit" className="w-full" disabled={saveMutation.isPending}>{saveMutation.isPending ? "Salvando..." : "Salvar"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      {cultures.length === 0 ? (
        <Card className="py-12 text-center"><CardContent><Wheat className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" /><p className="text-muted-foreground">Nenhuma cultura cadastrada</p></CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cultures.map((c: any) => (
            <Card key={c.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-start justify-between">
                <div><CardTitle className="text-lg">{c.name}</CardTitle>{c.properties?.name && <p className="text-sm text-muted-foreground">{c.properties.name}</p>}</div>
                <div className="flex gap-1"><Button size="icon" variant="ghost" onClick={() => startEdit(c)}><Pencil className="h-4 w-4" /></Button><Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(c.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <Badge className={statusColor(c.status || "")}>{c.status}</Badge>
                {c.area_hectares && <p><span className="font-medium">Área:</span> {c.area_hectares} ha</p>}
                {c.planting_date && <p><span className="font-medium">Plantio:</span> {new Date(c.planting_date).toLocaleDateString("pt-BR")}</p>}
                {c.expected_harvest && <p><span className="font-medium">Colheita:</span> {new Date(c.expected_harvest).toLocaleDateString("pt-BR")}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Cultures;
