# Ambiente Docker

Este projeto e uma aplicacao JavaFX desktop. O Docker aqui sobe o banco MariaDB e um Adminer para administracao visual.

## Subir o banco

Execute na raiz do projeto:

```powershell
docker compose up -d
```

O banco fica disponivel em:

- Host: `127.0.0.1`
- Porta: `3306`
- Banco: `achados_perdidos_iguatemi`
- Usuario da aplicacao: `root`
- Senha da aplicacao: vazia

O Adminer fica em `http://localhost:8081`.

## Carga inicial

Na primeira subida, o container importa o arquivo final versionado dentro do projeto:

```text
src/database/achados_perdidos_iguatemi.sql
```

Se o volume `achados_perdidos_db` ja existir, o SQL nao sera importado novamente. Para recriar o banco do zero:

```powershell
docker compose down -v
docker compose up -d
```

## Configuracao da aplicacao

O arquivo `src/resources/config.properties` ja esta apontando para o banco exposto pelo Docker em `127.0.0.1:3306`.

Se ja houver MySQL/MariaDB local usando a porta `3306`, pare o servico local antes de subir o Docker ou altere a porta no `docker-compose.yml` e no `config.properties`.

## JavaFX (rodar a aplicacao)

O projeto usa JavaFX via SDK local. Para deixar o projeto "pronto" sem caminho absoluto na sua maquina:

1) Copie/extraia seu JavaFX SDK para `third_party/javafx-sdk/` (a pasta deve conter `lib/`)
2) Rode a classe `view.Login` no IntelliJ
