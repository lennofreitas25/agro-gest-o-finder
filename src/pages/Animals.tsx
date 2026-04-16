import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Plus, Trash2, Pencil, Bug } from "lucide-react";

const animalTypes = ["Bovino", "Suíno", "Galinha", "Peixe", "Outro"];

const Animals = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ type: "", breed: "", quantity: "1", identification: "", birth_date: "", notes: "", property_id: "" });

  const { data: animals = [] } = useQuery({
    queryKey: ["animals"],
    queryFn: async () => {
      const { data, error } = await supabase.from("animals").select("*, properties(name)").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: properties = [] } = useQuery({
    queryKey: ["properties"],
    queryFn: async () => { const { data } = await supabase.from("properties").select("id, name").order("name"); return data || []; },
    enabled: !!user,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        type: form.type, breed: form.breed || null, quantity: Number(form.quantity) || 1,
        identification: form.identification || null, birth_date: form.birth_date || null,
        notes: form.notes || null, property_id: form.property_id || null, user_id: user!.id,
      };
      if (editId) { const { error } = await supabase.from("animals").update(payload).eq("id", editId); if (error) throw error; }
      else { const { error } = await supabase.from("animals").insert(payload); if (error) throw error; }
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["animals"] }); toast.success(editId ? "Animal atualizado!" : "Animal cadastrado!"); resetForm(); },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("animals").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["animals"] }); toast.success("Animal removido!"); },
  });

  const resetForm = () => { setForm({ type: "", breed: "", quantity: "1", identification: "", birth_date: "", notes: "", property_id: "" }); setEditId(null); setOpen(false); };

  const startEdit = (a: any) => {
    setForm({ type: a.type, breed: a.breed || "", quantity: a.quantity?.toString() || "1", identification: a.identification || "", birth_date: a.birth_date || "", notes: a.notes || "", property_id: a.property_id || "" });
    setEditId(a.id); setOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-heading font-bold">Animais</h1><p className="text-muted-foreground">Gerencie seus animais</p></div>
        <Dialog open={open} onOpenChange={(o) => { if (!o) resetForm(); setOpen(o); }}>
          <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" />Novo Animal</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editId ? "Editar" : "Novo"} Animal</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(); }} className="space-y-4">
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger><SelectValue placeholder="Tipo de animal" /></SelectTrigger>
                <SelectContent>{animalTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
              <Input placeholder="Raça" value={form.breed} onChange={(e) => setForm({ ...form, breed: e.target.value })} />
              <Input type="number" placeholder="Quantidade" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
              <Input placeholder="Identificação (brinco, etc)" value={form.identification} onChange={(e) => setForm({ ...form, identification: e.target.value })} />
              <Input type="date" value={form.birth_date} onChange={(e) => setForm({ ...form, birth_date: e.target.value })} />
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
      {animals.length === 0 ? (
        <Card className="py-12 text-center"><CardContent><Bug className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" /><p className="text-muted-foreground">Nenhum animal cadastrado</p></CardContent></Card>
      ) : (
        <Card><Table><TableHeader><TableRow><TableHead>Tipo</TableHead><TableHead>Raça</TableHead><TableHead>Qtd</TableHead><TableHead>Identificação</TableHead><TableHead>Propriedade</TableHead><TableHead className="w-20"></TableHead></TableRow></TableHeader>
          <TableBody>{animals.map((a: any) => (
            <TableRow key={a.id}><TableCell className="font-medium">{a.type}</TableCell><TableCell>{a.breed || "—"}</TableCell><TableCell>{a.quantity}</TableCell><TableCell>{a.identification || "—"}</TableCell><TableCell>{a.properties?.name || "—"}</TableCell>
              <TableCell><div className="flex gap-1"><Button size="icon" variant="ghost" onClick={() => startEdit(a)}><Pencil className="h-4 w-4" /></Button><Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(a.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></div></TableCell>
            </TableRow>
          ))}</TableBody></Table></Card>
      )}
    </div>
  );
};

export default Animals;
