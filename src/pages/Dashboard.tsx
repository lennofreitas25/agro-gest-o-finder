import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Users, Bug, Wheat, DollarSign, CalendarDays } from "lucide-react";

const Dashboard = () => {
  const { user } = useAuth();

  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats", user?.id],
    queryFn: async () => {
      const [properties, employees, animals, cultures, bills, events] = await Promise.all([
        supabase.from("properties").select("id", { count: "exact", head: true }),
        supabase.from("employees").select("id", { count: "exact", head: true }),
        supabase.from("animals").select("quantity"),
        supabase.from("cultures").select("id", { count: "exact", head: true }),
        supabase.from("bills").select("amount, paid").eq("paid", false),
        supabase.from("calendar_events").select("id", { count: "exact", head: true }).eq("completed", false),
      ]);
      const totalAnimals = (animals.data || []).reduce((sum, a) => sum + (a.quantity || 1), 0);
      const totalBills = (bills.data || []).reduce((sum, b) => sum + Number(b.amount), 0);
      return {
        properties: properties.count || 0,
        employees: employees.count || 0,
        animals: totalAnimals,
        cultures: cultures.count || 0,
        pendingBills: totalBills,
        pendingEvents: events.count || 0,
      };
    },
    enabled: !!user,
  });

  const cards = [
    { title: "Propriedades", value: stats?.properties ?? 0, icon: MapPin, color: "text-primary" },
    { title: "Funcionários", value: stats?.employees ?? 0, icon: Users, color: "text-blue-600" },
    { title: "Animais", value: stats?.animals ?? 0, icon: Bug, color: "text-orange-600" },
    { title: "Culturas", value: stats?.cultures ?? 0, icon: Wheat, color: "text-yellow-600" },
    { title: "Contas Pendentes", value: `R$ ${(stats?.pendingBills ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, icon: DollarSign, color: "text-red-600" },
    { title: "Eventos Pendentes", value: stats?.pendingEvents ?? 0, icon: CalendarDays, color: "text-purple-600" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold">Painel</h1>
        <p className="text-muted-foreground">Bem-vindo ao AgroGestão</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => (
          <Card key={card.title} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-heading font-bold">{card.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
