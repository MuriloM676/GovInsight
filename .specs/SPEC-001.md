# SPEC-001.md - Fundação do Projeto

## Objetivo

Desenvolver uma plataforma web denominada **GovInsight** para análise financeira e fiscal de municípios brasileiros utilizando dados públicos do SICONFI.

O MVP utilizará exclusivamente os dados do município de São Manuel (IBGE 3550100), localizados em:

```
/home/muril/GovInsight/dados_siconfi_3550100
```

A plataforma deverá ser totalmente executável via Docker.

---

## Stack

* Next.js 16
* React 19
* TypeScript
* TailwindCSS
* shadcn/ui
* PostgreSQL
* Prisma ORM
* Docker Compose
* Recharts
* TanStack Query
* React Hook Form
* Zod

---

## Arquitetura

```
Frontend
↓

API

↓

Serviços

↓

Prisma

↓

PostgreSQL

↓

CSV Importer
```

---

## Objetivos

A aplicação deverá:

* importar automaticamente todos os CSVs
* popular o banco
* construir um modelo analítico
* disponibilizar dashboards
* gerar insights automáticos
* permitir futura expansão para todos os municípios brasileiros

---

## Requisitos

* Docker obrigatório
* Banco inicializado automaticamente
* Seed automática
* Importador idempotente
* Layout responsivo
* Tema claro/escuro
* Componentização completa
