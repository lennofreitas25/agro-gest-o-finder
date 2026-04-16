import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Plus, CalendarDays } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const eventTypes = ["vacinação", "plantio", "colheita", "pagamento", "manutenção", "outro"];

const CalendarPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", event_date: "", event_type: "" });

  const { data: events = [] } = useQuery({
    queryKey: ["calendar_events"],
    queryFn: async () => { const { data, error } = await supabase.from("calendar_events").select("*").order("event_date"); if (error) throw error; return data; },
    enabled: !!user,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("calendar_events").insert({
        title: form.title, description: form.description || null,
        event_date: form.event_date, event_type: form.event_type || null, user_id: user!.id,
      });
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["calendar_events"] }); toast.success("Evento criado!"); setOpen(false); setForm({ title: "", description: "", event_date: "", event_type: "" }); },
    onError: (e: any) => toast.error(e.message),
  });

  const toggleComplete = useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      const { error } = await supabase.from("calendar_events").update({ completed }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["calendar_events"] }),
  });

  const selectedDateStr = selectedDate ? format(selectedDate, "yyyy-MM-dd") : "";
  const dayEvents = events.filter((e) => e.event_date === selectedDateStr);
  const eventDates = events.map((e) => new Date(e.event_date + "T12:00:00"));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-heading font-bold">Calendário</h1><p className="text-muted-foreground">Acompanhe seus eventos e atividades</p></div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" />Novo Evento</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Novo Evento</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(); }} className="space-y-4">
              <Input placeholder="Título" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              <Input placeholder="Descrição" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              <Input type="date" value={form.event_date} onChange={(e) => setForm({ ...form, event_date: e.target.value })} required />
              <Select value={form.event_type} onValueChange={(v) => setForm({ ...form, event_type: v })}>
                <SelectTrigger><SelectValue placeholder="Tipo de evento" /></SelectTrigger>
                <SelectContent>{eventTypes.map((t) => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}</SelectContent>
              </Select>
              <Button type="submit" className="w-full" disabled={saveMutation.isPending}>{saveMutation.isPending ? "Salvando..." : "Criar Evento"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              locale={ptBR}
              modifiers={{ hasEvent: eventDates }}
              modifiersClassNames={{ hasEvent: "bg-primary/20 font-bold" }}
              className="pointer-events-auto"
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              {selectedDate ? format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : "Selecione uma data"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dayEvents.length === 0 ? (
              <p className="text-muted-foreground text-sm">Nenhum evento nesta data</p>
            ) : (
              <div className="space-y-3">
                {dayEvents.map((ev) => (
                  <div key={ev.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <Checkbox checked={ev.completed || false} onCheckedChange={(checked) => toggleComplete.mutate({ id: ev.id, completed: !!checked })} />
                    <div className="flex-1">
                      <p className={`font-medium ${ev.completed ? "line-through text-muted-foreground" : ""}`}>{ev.title}</p>
                      {ev.description && <p className="text-sm text-muted-foreground">{ev.description}</p>}
                      {ev.event_type && <Badge variant="outline" className="mt-1 capitalize">{ev.event_type}</Badge>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CalendarPage;
