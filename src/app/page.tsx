import Link from "next/link";
import { BarChart3, Landmark, TrendingUp, Lightbulb } from "lucide-react";

const dashboards = [
  {
    title: "Dashboard Executivo",
    description: "Receitas, despesas, superávit e indicadores gerais",
    icon: BarChart3,
    href: "/executivo",
    color: "bg-blue-500",
  },
  {
    title: "Gestão Fiscal",
    description: "Gasto com pessoal, limites da LRF e dívida consolidada",
    icon: Landmark,
    href: "/gestao-fiscal",
    color: "bg-amber-500",
  },
  {
    title: "Patrimônio Municipal",
    description: "Ativo, passivo, patrimônio líquido e evolução histórica",
    icon: TrendingUp,
    href: "/patrimonio",
    color: "bg-green-500",
  },
  {
    title: "Insights Inteligentes",
    description: "Análises automáticas sobre a saúde fiscal do município",
    icon: Lightbulb,
    href: "/insights",
    color: "bg-purple-500",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">GovInsight</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            São Manuel · SP
          </p>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">
            Análise Fiscal Municipal
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Plataforma de análise financeira e fiscal utilizando dados públicos do SICONFI.
            Visualize receitas, despesas, patrimônio e indicadores fiscais.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {dashboards.map((d) => {
            const Icon = d.icon;
            return (
              <Link
                key={d.href}
                href={d.href}
                className="group relative overflow-hidden rounded-lg border bg-card p-6 hover:shadow-lg transition-all"
              >
                <div className={`w-12 h-12 rounded-lg ${d.color} flex items-center justify-center mb-4`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{d.title}</h3>
                <p className="text-sm text-muted-foreground">{d.description}</p>
              </Link>
            );
          })}
        </div>
      </main>

      <footer className="border-t py-4 text-center text-sm text-muted-foreground">
        Dados: SICONFI · Secretaria do Tesouro Nacional
      </footer>
    </div>
  );
}
