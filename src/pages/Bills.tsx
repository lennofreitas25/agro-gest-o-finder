import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Trash2, DollarSign, Check } from "lucide-react";

const Bills = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ description: "", amount: "", due_date: "", category: "", notes: "" });

  const { data: bills = [] } = useQuery({
    queryKey: ["bills"],
    queryFn: async () => { const { data, error } = await supabase.from("bills").select("*").order("due_date"); if (error) throw error; return data; },
    enabled: !!user,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("bills").insert({
        description: form.description, amount: Number(form.amount), due_date: form.due_date,
        category: form.category || null, notes: form.notes || null, user_id: user!.id,
      });
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["bills"] }); toast.success("Conta cadastrada!"); setOpen(false); setForm({ description: "", amount: "", due_date: "", category: "", notes: "" }); },
    onError: (e: any) => toast.error(e.message),
  });

  const payMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("bills").update({ paid: true, paid_date: new Date().toISOString().split("T")[0] }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["bills"] }); toast.success("Conta marcada como paga!"); },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("bills").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["bills"] }); toast.success("Conta removida!"); },
  });

  const pending = bills.filter((b) => !b.paid);
  const paid = bills.filter((b) => b.paid);
  const totalPending = pending.reduce((s, b) => s + Number(b.amount), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold">Contas a Pagar</h1>
          <p className="text-muted-foreground">Total pendente: <span className="font-bold text-destructive">R$ {totalPending.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span></p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" />Nova Conta</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nova Conta a Pagar</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(); }} className="space-y-4">
              <Input placeholder="Descrição" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
              <Input type="number" step="0.01" placeholder="Valor (R$)" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
              <Input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} required />
              <Input placeholder="Categoria" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
              <Input placeholder="Observações" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              <Button type="submit" className="w-full" disabled={saveMutation.isPending}>{saveMutation.isPending ? "Salvando..." : "Cadastrar"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {bills.length === 0 ? (
        <Card className="py-12 text-center"><CardContent><DollarSign className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" /><p className="text-muted-foreground">Nenhuma conta cadastrada</p></CardContent></Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descrição</TableHead><TableHead>Valor</TableHead><TableHead>Vencimento</TableHead>
                <TableHead>Categoria</TableHead><TableHead>Status</TableHead><TableHead className="w-28"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...pending, ...paid].map((b) => {
                const isOverdue = !b.paid && new Date(b.due_date) < new Date();
                return (
                  <TableRow key={b.id} className={b.paid ? "opacity-60" : ""}>
                    <TableCell className="font-medium">{b.description}</TableCell>
                    <TableCell>R$ {Number(b.amount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</TableCell>
                    <TableCell className={isOverdue ? "text-destructive font-medium" : ""}>{new Date(b.due_date).toLocaleDateString("pt-BR")}</TableCell>
                    <TableCell>{b.category || "—"}</TableCell>
                    <TableCell>
                      {b.paid ? <Badge className="bg-green-100 text-green-800">Paga</Badge>
                        : isOverdue ? <Badge variant="destructive">Vencida</Badge>
                        : <Badge variant="outline">Pendente</Badge>}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {!b.paid && <Button size="icon" variant="ghost" onClick={() => payMutation.mutate(b.id)} title="Marcar como paga"><Check className="h-4 w-4 text-green-600" /></Button>}
                        <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(b.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
};

export default Bills;
