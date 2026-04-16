import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Navigate } from "react-router-dom";
import { Shield, Users, MapPin, Bug } from "lucide-react";

const Admin = () => {
  const { isAdmin, loading } = useAuth();

  const { data: profiles = [] } = useQuery({
    queryKey: ["admin-profiles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [props, emps, animals] = await Promise.all([
        supabase.from("properties").select("id", { count: "exact", head: true }),
        supabase.from("employees").select("id", { count: "exact", head: true }),
        supabase.from("animals").select("id", { count: "exact", head: true }),
      ]);
      return { properties: props.count || 0, employees: emps.count || 0, animals: animals.count || 0 };
    },
    enabled: isAdmin,
  });

  if (loading) return null;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold flex items-center gap-3"><Shield className="h-8 w-8 text-primary" />Painel Administrativo</h1>
        <p className="text-muted-foreground">Visão geral de todos os usuários e dados</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Propriedades</CardTitle><MapPin className="h-5 w-5 text-primary" /></CardHeader><CardContent><p className="text-2xl font-bold">{stats?.properties}</p></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Funcionários</CardTitle><Users className="h-5 w-5 text-blue-600" /></CardHeader><CardContent><p className="text-2xl font-bold">{stats?.employees}</p></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Animais</CardTitle><Bug className="h-5 w-5 text-orange-600" /></CardHeader><CardContent><p className="text-2xl font-bold">{stats?.animals}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Usuários Cadastrados</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Nome</TableHead><TableHead>Email</TableHead><TableHead>Cadastro</TableHead></TableRow></TableHeader>
            <TableBody>
              {profiles.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.full_name || "—"}</TableCell>
                  <TableCell>{p.email || "—"}</TableCell>
                  <TableCell>{new Date(p.created_at).toLocaleDateString("pt-BR")}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Admin;
