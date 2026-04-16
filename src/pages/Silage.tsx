import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { FileText, CheckCircle2, AlertTriangle, Leaf } from "lucide-react";

const Silage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold flex items-center gap-3">
          <FileText className="h-8 w-8 text-primary" />
          Silagem
        </h1>
        <p className="text-muted-foreground">Guia completo para produção e conservação de silagem</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Leaf className="h-5 w-5 text-primary" />O que é Silagem?</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-3 text-muted-foreground">
            <p>A silagem é um alimento volumoso produzido pela fermentação controlada de plantas forrageiras em condições anaeróbicas (sem ar). É uma das principais fontes de alimentação para bovinos, especialmente na época seca.</p>
            <p>As plantas mais utilizadas são o milho, o sorgo e o capim, sendo o milho o mais indicado por seu alto valor nutritivo e facilidade de ensilagem.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-primary" />Ponto Ideal de Colheita</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-3 text-muted-foreground">
            <p><strong>Milho:</strong> Quando o grão estiver no estágio farináceo-duro (30-35% de matéria seca).</p>
            <p><strong>Sorgo:</strong> Quando os grãos estiverem no estágio pastoso.</p>
            <p><strong>Capim:</strong> Entre 60-90 dias de crescimento, antes do florescimento.</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Passo a Passo para Fazer Silagem</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="1">
              <AccordionTrigger>1. Escolha do silo</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground space-y-2">
                <p><strong>Silo trincheira:</strong> Mais comum, feito escavado no chão. Ideal para grandes volumes.</p>
                <p><strong>Silo de superfície:</strong> Montado sobre o solo. Mais prático e econômico.</p>
                <p><strong>Silo bag:</strong> Sacos especiais. Boa vedação, menor desperdício.</p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="2">
              <AccordionTrigger>2. Corte e picagem</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground space-y-2">
                <p>O tamanho ideal das partículas é de 1 a 2 cm. Partículas muito grandes dificultam a compactação e a fermentação.</p>
                <p>Use ensiladeira bem regulada com facas afiadas.</p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="3">
              <AccordionTrigger>3. Compactação</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground space-y-2">
                <p>A compactação é fundamental! Quanto mais ar for expulso, melhor será a fermentação.</p>
                <p>Use trator pesado em camadas de 20 cm. Compacte por pelo menos 30 minutos por carga.</p>
                <p>Densidade ideal: 600-700 kg/m³ de matéria natural.</p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="4">
              <AccordionTrigger>4. Vedação</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground space-y-2">
                <p>Use lona plástica de boa qualidade (mínimo 200 micras).</p>
                <p>Coloque terra, pneus ou sacos de areia sobre a lona para garantir vedação total.</p>
                <p>Feche o silo no mesmo dia em que finalizar o enchimento.</p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="5">
              <AccordionTrigger>5. Fermentação e abertura</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground space-y-2">
                <p>A fermentação leva de 21 a 30 dias. Não abra o silo antes deste período.</p>
                <p>Silagem de boa qualidade tem cor amarelo-esverdeada, cheiro agradável (avinagrado) e pH entre 3,8 e 4,2.</p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      <Card className="border-yellow-200 bg-yellow-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-yellow-600" />Sinais de Silagem Estragada</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2 text-muted-foreground">
          <p>🔴 <strong>Cor escura ou preta:</strong> Indica aquecimento excessivo. Descarte essa parte.</p>
          <p>🔴 <strong>Cheiro de podre ou butírico:</strong> Fermentação inadequada. Não oferecer aos animais.</p>
          <p>🔴 <strong>Presença de fungos:</strong> Remova pelo menos 30 cm ao redor da área afetada.</p>
          <p>🔴 <strong>pH acima de 4,5:</strong> Conservação inadequada. Pode causar problemas digestivos.</p>
          <p className="pt-2 font-medium text-foreground">⚠️ Nunca ofereça silagem estragada aos animais. Pode causar intoxicação e até morte.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Silage;
