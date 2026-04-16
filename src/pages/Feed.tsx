import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Beef } from "lucide-react";

const feedRecipes = {
  bovinos: [
    { name: "Ração de engorda", ingredients: "Milho moído (60%), Farelo de soja (25%), Sal mineral (3%), Ureia (1%), Calcário (1%), Melaço (10%)", instructions: "Misture todos os ingredientes secos primeiro, depois adicione o melaço. Forneça 1% do peso vivo do animal por dia." },
    { name: "Ração de manutenção", ingredients: "Capim picado (50%), Milho moído (30%), Farelo de soja (15%), Sal mineral (3%), Calcário (2%)", instructions: "Misture os concentrados separadamente, depois adicione ao volumoso picado. Ofereça à vontade." },
    { name: "Ração para bezerros", ingredients: "Milho moído (55%), Farelo de soja (30%), Farelo de trigo (10%), Sal mineral (3%), Calcário (2%)", instructions: "Ofereça a partir dos 15 dias de vida. Comece com 100g/dia e aumente gradualmente até 1kg/dia." },
  ],
  suinos: [
    { name: "Ração inicial (leitões)", ingredients: "Milho moído (50%), Farelo de soja (30%), Leite em pó (10%), Açúcar (5%), Premix vitamínico (3%), Sal (2%)", instructions: "Forneça do desmame até 25kg. Ofereça à vontade, mantendo comedouros limpos." },
    { name: "Ração de crescimento", ingredients: "Milho moído (65%), Farelo de soja (28%), Premix vitamínico (3%), Sal (2%), Calcário (2%)", instructions: "Para suínos de 25 a 60kg. Forneça 2 a 3kg por dia." },
    { name: "Ração de terminação", ingredients: "Milho moído (72%), Farelo de soja (22%), Premix vitamínico (3%), Sal (1.5%), Calcário (1.5%)", instructions: "Para suínos acima de 60kg até o abate. Forneça 3 a 3.5kg por dia." },
  ],
  galinhas: [
    { name: "Ração para poedeiras", ingredients: "Milho moído (60%), Farelo de soja (25%), Calcário (8%), Premix vitamínico (3%), Sal (2%), Fosfato bicálcico (2%)", instructions: "Forneça 120g por ave por dia. Mantenha água limpa sempre disponível." },
    { name: "Ração para frangos de corte", ingredients: "Milho moído (58%), Farelo de soja (32%), Óleo de soja (4%), Premix vitamínico (3%), Sal (1.5%), Calcário (1.5%)", instructions: "Forneça à vontade. Troque a ração a cada fase de crescimento (inicial, crescimento, final)." },
    { name: "Ração para pintinhos", ingredients: "Milho moído (52%), Farelo de soja (35%), Óleo de soja (5%), Premix vitamínico (4%), Sal (2%), Calcário (2%)", instructions: "Do 1º ao 21º dia de vida. Forneça à vontade em comedouros tipo bandeja." },
  ],
  peixes: [
    { name: "Ração para tilápia", ingredients: "Farelo de soja (40%), Milho moído (30%), Farinha de peixe (15%), Farelo de trigo (10%), Premix vitamínico (3%), Óleo de peixe (2%)", instructions: "Forneça 3% do peso vivo dos peixes por dia, dividido em 3 alimentações." },
    { name: "Ração para tambaqui", ingredients: "Farelo de soja (35%), Milho moído (35%), Farinha de peixe (15%), Farelo de trigo (10%), Premix vitamínico (3%), Calcário (2%)", instructions: "Forneça 2-3% do peso vivo, dividido em 2 alimentações diárias." },
    { name: "Ração para alevinos", ingredients: "Farinha de peixe (30%), Farelo de soja (35%), Milho moído (20%), Farelo de trigo (8%), Premix vitamínico (4%), Óleo de peixe (3%)", instructions: "Forneça 10% do peso vivo por dia, dividido em 4-5 alimentações." },
  ],
};

const Feed = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold flex items-center gap-3">
          <Beef className="h-8 w-8 text-primary" />
          Rações
        </h1>
        <p className="text-muted-foreground">Receitas de rações para diferentes tipos de animais</p>
      </div>

      <Tabs defaultValue="bovinos" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="bovinos">🐄 Bovinos</TabsTrigger>
          <TabsTrigger value="suinos">🐷 Suínos</TabsTrigger>
          <TabsTrigger value="galinhas">🐔 Galinhas</TabsTrigger>
          <TabsTrigger value="peixes">🐟 Peixes</TabsTrigger>
        </TabsList>

        {Object.entries(feedRecipes).map(([animal, recipes]) => (
          <TabsContent key={animal} value={animal} className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recipes.map((recipe, i) => (
                <Card key={i} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">{recipe.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Badge variant="outline" className="mb-2">Ingredientes</Badge>
                      <p className="text-sm text-muted-foreground">{recipe.ingredients}</p>
                    </div>
                    <div>
                      <Badge variant="outline" className="mb-2">Modo de preparo</Badge>
                      <p className="text-sm text-muted-foreground">{recipe.instructions}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default Feed;
