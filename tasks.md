# GovInsight — Tarefas

## 1. Análise de Dados Concluída

### Estrutura dos CSVs

| Arquivo | Linhas | Colunas | Período | Periodicidade |
|---------|--------|---------|---------|---------------|
| `entes.csv` | 5.598 | 9 | 2026 | Snapshot |
| `dca.csv` | 10.742 | 12 | 2018-2025 | Anual |
| `receitas.csv` | 23.037 | 18 | 2018-2026 | Bimestral |
| `despesas.csv` | 42.447 | 18 | 2018-2026 | Bimestral |
| `rgf.csv` | 6.771 | 17 | 2018-2026 | Quadrimestral |

### dca.csv — 12 colunas
- `exercicio`, `instituicao`, `cod_ibge`, `uf`, `anexo`, `rotulo`, `coluna`, `cod_conta`, `conta`, `valor`, `populacao`, `ano`
- 7 anexos: I-AB (Balanço Patrimonial), I-C (Variações Patrimoniais), I-D (DFC), I-E (Ativo/Passivo), I-F (Passivo Atuarial), I-G (Bens Imóveis), I-HI (DRE)
- `cod_conta` hierárquico: P1.0.0.0.0.00.00, P1.1.0.0.0.00.00, etc.
- `coluna` = data-base (31/12/XXXX) ou tipo de demonstrativo
- 804 códigos de conta, 967 descrições, 100% preenchido

### receitas.csv — 18 colunas
- `exercicio`, `demonstrativo`, `periodo`, `periodicidade`, `instituicao`, `cod_ibge`, `uf`, `populacao`, `anexo`, `esfera`, `rotulo`, `coluna`, `cod_conta`, `conta`, `valor`, `ano`, `bimestre`, `tipo`
- RREO-Anexo 01, 65 categorias de receita
- 17 colunas: PREVISÃO INICIAL, PREVISÃO ATUALIZADA (a), No Bimestre (b), Até o Bimestre (c), SALDO (a-c), etc.

### despesas.csv — 18 colunas
- Mesma estrutura de receitas, RREO-Anexo 02
- 73 funções de despesa, 13 colunas: DOTAÇÃO INICIAL, DOTAÇÃO ATUALIZADA (a), DESPESAS EMPENHADAS, LIQUIDADAS, PAGAS, RESTOS A PAGAR, SALDOS

### rgf.csv — 17 colunas
- `exercicio`, `periodo`, `periodicidade`, `instituicao`, `cod_ibge`, `uf`, `co_poder`, `populacao`, `anexo`, `esfera`, `rotulo`, `coluna`, `cod_conta`, `conta`, `valor`, `ano`, `anexo_rgf`
- 4 anexos: 01 (Despesa com Pessoal), 02 (Dívida Consolidada), 03 (Operações de Crédito), 04 (Disponibilidade de Caixa)
- 93 contas, periodicidade Q (quadrimestral), 3 períodos/ano

---

## 2. Modelo de Dados (Star Schema)

### Dimensões

| Tabela | Descrição | PK |
|--------|-----------|----|
| `dim_municipio` | Municípios brasileiros | `cod_ibge` (INT) |
| `dim_tempo` | Calendário analítico | `id` (SERIAL) |
| `dim_conta_dca` | Plano de contas DCA | `id` (SERIAL) |
| `dim_conta_rreo` | Categorias RREO (receitas/despesas) | `id` (SERIAL) |
| `dim_conta_rgf` | Contas RGF | `id` (SERIAL) |
| `dim_coluna` | Tipo de coluna/valor do demonstrativo | `id` (SERIAL) |
| `dim_anexo` | Anexos dos demonstrativos | `id` (SERIAL) |

### Fatos

| Tabela | Descrição | Granularidade |
|--------|-----------|---------------|
| `fato_dca` | Balanço Patrimonial DCA | ano + conta + coluna |
| `fato_receitas` | RREO Receitas | ano + bimestre + conta + coluna |
| `fato_despesas` | RREO Despesas | ano + bimestre + conta + coluna |
| `fato_rgf` | RGF Gestão Fiscal | ano + quadrimestre + anexo + conta |

### Relacionamentos

```
dim_municipio 1──N fato_dca / fato_receitas / fato_despesas / fato_rgf
dim_tempo     1──N fato_dca / fato_receitas / fato_despesas / fato_rgf
dim_conta_dca 1──N fato_dca
dim_conta_rreo 1──N fato_receitas / fato_despesas
dim_conta_rgf 1──N fato_rgf
dim_coluna    1──N fato_dca / fato_receitas / fato_despesas / fato_rgf
dim_anexo     1──N fato_dca / fato_rgf
```

---

## 3. Arquitetura do ETL

```
CSVs (UTF-8 BOM, separador ,)
  → Leitura com detecção de encoding
  → Normalização (BOM removal, type casting)
  → Upsert nas dimensões (evitar duplicatas)
  → Inserção nos fatos (batch insert)
  → Logging e métricas
```

Pipeline steps:
1. `entes.csv` → `dim_municipio` (upsert por cod_ibge)
2. Extrair dimensões de tempo, conta, coluna, anexo dos demais CSVs
3. `dca.csv` → `dim_conta_dca` + `dim_coluna` + `dim_anexo` + `fato_dca`
4. `receitas.csv` → `dim_conta_rreo` + `fato_receitas`
5. `despesas.csv` → `dim_conta_rreo` + `fato_despesas`
6. `rgf.csv` → `dim_conta_rgf` + `fato_rgf`

Idempotente: TRUNCATE + reinsert ou upsert por chave natural.

---

## 4. Dashboards Identificados

### 4.1 Dashboard Executivo (SPEC-003)
KPIs: Receita Total, Prevista, Arrecadada, Despesa Total, Superávit/Déficit, per capita
Gráficos: Receita por ano, bimestre; Despesa por ano, função; Receita x Despesa; Evolução patrimonial
Filtros: Ano, Demonstrativo, Bimestre, Conta

### 4.2 Gestão Fiscal (SPEC-004)
Indicadores: Gasto com pessoal (% RCL), Limite prudencial (95%), Limite legal (100%), Dívida consolidada, Operações de crédito, Disponibilidade de caixa
Alertas: Quando limites são atingidos/ultrapassados

### 4.3 Patrimônio Municipal (SPEC-005)
Indicadores: Ativo total, Passivo total, PL, Caixa, Disponibilidades, Bens móveis, Bens imóveis
Evolução histórica (2018-2025)

### 4.4 Insights Inteligentes (SPEC-006)
Análises textuais automáticas: variação % anual, crescimento despesa vs receita, superávit/déficit, alertas de pessoal, redução patrimonial

---

## 5. KPIs, Gráficos e Indicadores

### KPIs
- Receita Total Arrecadada (ano/bimestre)
- Previsão Inicial vs Atualizada vs Arrecadado
- Despesa Total Executada (empenhada/liquidada/paga)
- Superávit/Déficit (Receita - Despesa)
- Receita per capita
- Despesa per capita
- % Execução Orçamentária
- Gasto com Pessoal / RCL (%)
- Dívida Consolidada Líquida / RCL (%)
- Ativo Total / Passivo Total
- Patrimônio Líquido
- Disponibilidade de Caixa

### Gráficos
- Receita por ano (barras)
- Receita por bimestre (barras)
- Despesa por função (pizza/barras)
- Receita x Despesa acumulada (linhas)
- Evolução do PL (linha)
- Gasto com pessoal vs limites (linha + alertas)
- Dívida consolidada (linha)
- Disponibilidade de caixa (linha)

### Comparativos
- Ano atual vs anterior
- Bimestre atual vs mesmo período ano anterior
- % arrecadado vs previsto
- % executado vs dotado

---

## 6. Backlog — Priorizado

### Prioridade 1 — Fundação (P1)
| # | Tarefa | Dependência | Complexidade |
|---|--------|-------------|--------------|
| 1.1 | Inicializar Next.js 16 + Tailwind + shadcn/ui | — | Média |
| 1.2 | Docker Compose: PostgreSQL + App | — | Média |
| 1.3 | Configurar Prisma + schema dimensional | 1.2 | Alta |
| 1.4 | Script ETL: importar entes.csv → dim_municipio | 1.3 | Média |
| 1.5 | Script ETL: importar dca.csv → dimensões + fato | 1.3 | Alta |
| 1.6 | Script ETL: importar receitas.csv → dimensões + fato | 1.3 | Alta |
| 1.7 | Script ETL: importar despesas.csv → dimensões + fato | 1.3 | Alta |
| 1.8 | Script ETL: importar rgf.csv → dimensões + fato | 1.3 | Alta |
| 1.9 | Seed automática no docker-compose up | 1.4-1.8 | Média |

### Prioridade 2 — API e Backend (P2)
| # | Tarefa | Dependência | Complexidade |
|---|--------|-------------|--------------|
| 2.1 | API Route: /api/kpis/executivo | 1.9 | Média |
| 2.2 | API Route: /api/graficos/receita-ano | 1.9 | Média |
| 2.3 | API Route: /api/graficos/despesa-funcao | 1.9 | Média |
| 2.4 | API Route: /api/graficos/receita-despesa | 1.9 | Média |
| 2.5 | API Route: /api/rgf/gasto-pessoal | 1.9 | Média |
| 2.6 | API Route: /api/rgf/divida | 1.9 | Média |
| 2.7 | API Route: /api/patrimonio/evolucao | 1.9 | Média |
| 2.8 | API Route: /api/insights | 1.9 | Alta |
| 2.9 | API Route: /api/municipios (para expansão futura) | 1.9 | Baixa |

### Prioridade 3 — Frontend (P3)
| # | Tarefa | Dependência | Complexidade |
|---|--------|-------------|--------------|
| 3.1 | Layout base: Sidebar, Header, Breadcrumbs | — | Média |
| 3.2 | Tema claro/escuro (next-themes) | 3.1 | Baixa |
| 3.3 | Skeleton loading components | 3.1 | Baixa |
| 3.4 | Página: Dashboard Executivo | 2.1-2.4 | Alta |
| 3.5 | Página: Gestão Fiscal | 2.5-2.6 | Alta |
| 3.6 | Página: Patrimônio Municipal | 2.7 | Alta |
| 3.7 | Página: Insights | 2.8 | Média |
| 3.8 | Filtros globais (ano, bimestre, etc.) | 3.4 | Média |
| 3.9 | Responsividade e testes | 3.4-3.8 | Média |

---

## 7. Ordem de Implementação

```
Fase 1 (Fundação):    1.1 → 1.2 → 1.3 → 1.4 → 1.5 → 1.6 → 1.7 → 1.8 → 1.9
Fase 2 (API):         2.1 → 2.2 → 2.3 → 2.4 → 2.5 → 2.6 → 2.7 → 2.8
Fase 3 (Frontend):    3.1 → 3.2 → 3.3 → 3.4 → 3.5 → 3.6 → 3.7 → 3.8 → 3.9
```

---

## 8. Checklist Técnico

- [ ] Docker Compose com PostgreSQL 16 + pgAdmin opcional
- [ ] Next.js 16 com App Router e TypeScript strict
- [ ] Prisma com schema modular e índices
- [ ] ETL idempotente com logs e tratamento de erros
- [ ] API Routes com validação Zod
- [ ] TanStack Query para cache e loading states
- [ ] Recharts para visualizações
- [ ] shadcn/ui para componentes base
- [ ] Responsividade (mobile-first)
- [ ] Dark mode (next-themes)

## 9. Checklist Funcional

- [ ] Importar CSVs automaticamente no primeiro startup
- [ ] Dashboard Executivo com KPIs e 6+ gráficos
- [ ] Gestão Fiscal com limites LRF e alertas
- [ ] Patrimônio Municipal com evolução histórica
- [ ] Insights inteligentes com análises textuais
- [ ] Filtros por ano, bimestre, conta, anexo
- [ ] Tudo funcionando via docker-compose up

---

## 10. Estimativas de Complexidade

| Complexidade | Quantidade | Descrição |
|-------------|-----------|-----------|
| Alta | ~10 | Schema, ETL completo, dashboards complexos |
| Média | ~15 | APIs, componentes, layout, seed |
| Baixa | ~5 | Tema, skeletons, responsividade |
