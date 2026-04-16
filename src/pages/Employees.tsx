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
import { Plus, Trash2, Pencil, Users } from "lucide-react";

const Employees = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", role: "", phone: "", salary: "", hire_date: "", property_id: "" });

  const { data: employees = [] } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      const { data, error } = await supabase.from("employees").select("*, properties(name)").order("name");
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: properties = [] } = useQuery({
    queryKey: ["properties"],
    queryFn: async () => {
      const { data } = await supabase.from("properties").select("id, name").order("name");
      return data || [];
    },
    enabled: !!user,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: form.name,
        role: form.role || null,
        phone: form.phone || null,
        salary: form.salary ? Number(form.salary) : null,
        hire_date: form.hire_date || null,
        property_id: form.property_id || null,
        user_id: user!.id,
      };
      if (editId) {
        const { error } = await supabase.from("employees").update(payload).eq("id", editId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("employees").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast.success(editId ? "Funcionário atualizado!" : "Funcionário cadastrado!");
      resetForm();
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("employees").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast.success("Funcionário removido!");
    },
  });

  const resetForm = () => {
    setForm({ name: "", role: "", phone: "", salary: "", hire_date: "", property_id: "" });
    setEditId(null);
    setOpen(false);
  };

  const startEdit = (e: any) => {
    setForm({
      name: e.name, role: e.role || "", phone: e.phone || "",
      salary: e.salary?.toString() || "", hire_date: e.hire_date || "", property_id: e.property_id || "",
    });
    setEditId(e.id);
    setOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold">Funcionários</h1>
          <p className="text-muted-foreground">Gerencie seus funcionários</p>
        </div>
        <Dialog open={open} onOpenChange={(o) => { if (!o) resetForm(); setOpen(o); }}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" />Novo Funcionário</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editId ? "Editar" : "Novo"} Funcionário</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(); }} className="space-y-4">
              <Input placeholder="Nome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              <Input placeholder="Função" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
              <Input placeholder="Telefone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              <Input type="number" step="0.01" placeholder="Salário" value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} />
              <Input type="date" placeholder="Data de contratação" value={form.hire_date} onChange={(e) => setForm({ ...form, hire_date: e.target.value })} />
              <Select value={form.property_id} onValueChange={(v) => setForm({ ...form, property_id: v })}>
                <SelectTrigger><SelectValue placeholder="Propriedade (opcional)" /></SelectTrigger>
                <SelectContent>
                  {properties.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button type="submit" className="w-full" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? "Salvando..." : "Salvar"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {employees.length === 0 ? (
        <Card className="py-12 text-center">
          <CardContent><Users className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" /><p className="text-muted-foreground">Nenhum funcionário cadastrado</p></CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead><TableHead>Função</TableHead><TableHead>Telefone</TableHead>
                <TableHead>Salário</TableHead><TableHead>Propriedade</TableHead><TableHead className="w-20"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((e: any) => (
                <TableRow key={e.id}>
                  <TableCell className="font-medium">{e.name}</TableCell>
                  <TableCell>{e.role || "—"}</TableCell>
                  <TableCell>{e.phone || "—"}</TableCell>
                  <TableCell>{e.salary ? `R$ ${Number(e.salary).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "—"}</TableCell>
                  <TableCell>{e.properties?.name || "—"}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => startEdit(e)}><Pencil className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(e.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
};

export default Employees;
