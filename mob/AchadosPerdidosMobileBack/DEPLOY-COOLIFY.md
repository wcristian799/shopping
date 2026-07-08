# Deploy no Coolify

## Tipo de app

Use `Dockerfile`.

## Porta

Configure a porta do servico para `3000`.

## Variaveis obrigatorias

```env
PORT=3000
NODE_ENV=production
JWT_SECRET=troque-por-uma-chave-forte
DB_HOST=seu-host
DB_PORT=3306
DB_NAME=achados_perdidos_iguatemi
DB_USER=seu-usuario
DB_PASSWORD=sua-senha
IMAGENS_PATH=/app/data/imagens
PDF_ENGINE=auto
```

## Volume persistente

Crie um volume no Coolify para:

```text
/app/data/imagens
```

## Healthcheck

Use:

```text
/health
```

## PDF de relatorios

`PDF_ENGINE=auto` tenta usar o gerador desktop so quando Java e arquivos auxiliares existirem. No Coolify, se eles nao existirem, o backend cai automaticamente no gerador PDF nativo em Node.
