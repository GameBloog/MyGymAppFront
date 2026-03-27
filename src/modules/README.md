# Modulos Novos Do Frontend

Use `src/modules/` para novas features orientadas a dominio.

## Estrutura Base

```text
src/modules/<feature>/
  api/
  components/
  hooks/
  pages/
```

## Regra Pratica

- `api`: contratos e clients.
- `hooks`: orchestration da feature.
- `components`: UI da feature.
- `pages`: entrada de rota fina.
- comece simples e crie subpastas so quando a feature realmente precisar.

Artefatos realmente compartilhados continuam fora do modulo.
