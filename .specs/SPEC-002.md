# SPEC-002.md - ETL e Banco de Dados

## Origem dos dados

```
dca.csv
despesas.csv
receitas.csv
rgf.csv
```

Local:

```
/home/muril/GovInsight/dados_siconfi_3550100
```

---

## Processo ETL

1. Ler CSVs
2. Detectar encoding
3. Detectar separador
4. Validar colunas
5. Remover duplicados
6. Converter tipos
7. Inserir no PostgreSQL
8. Registrar logs

---

## Modelo

Dimensões

* Município
* Tempo
* Conta
* Demonstrativo

Fatos

* Receitas
* Despesas
* DCA
* RGF

---

## Índices

Criar índices para:

* ano
* município
* conta
* bimestre
* tipo

---

## Performance

Todas as consultas principais devem responder em menos de 500 ms.
