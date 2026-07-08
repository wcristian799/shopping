# Deploy Mobile

## Frontend mobile

Arquivo de ambiente:

```env
EXPO_PUBLIC_API_URL=https://seu-backend.exemplo.com
```

Local:

1. Crie `AchadosPerdidosMobileFront/.env` com a URL publica do backend.
2. Rode `npm install`.
3. Rode `npx expo start`.

Build Android:

1. Instale o EAS CLI: `npm install -g eas-cli`
2. Entre na conta Expo: `eas login`
3. No diretório `AchadosPerdidosMobileFront`, rode:
   - APK interno: `npm run build:android:apk`
   - AAB para Play Store: `npm run build:android:aab`

## Backend mobile

Crie `AchadosPerdidosMobileBack/.env` baseado em `.env.example`.

Campos principais:

```env
PORT=3000
JWT_SECRET=troque-essa-chave
DB_HOST=seu-host
DB_PORT=3306
DB_NAME=achados_perdidos_iguatemi
DB_USER=seu-usuario
DB_PASSWORD=sua-senha
IMAGENS_PATH=/var/app/imagens
DESKTOP_PROJECT_ROOT=/var/app/Achados-e-Perdidos-Iguatemi
DESKTOP_JAVA_CLASSES_DIR=/var/app/tools/java-out
DESKTOP_MYSQL_CONNECTOR=/var/app/mysql-connector-j-8.4.0.jar
```

Observacoes:

1. O banco em nuvem pode ser o mesmo schema do desktop/mobile, desde que voce importe a base `achados_perdidos_iguatemi.sql`.
2. Para o PDF do relatorio sair identico ao desktop no servidor, o deploy do backend precisa incluir:
   - a pasta do projeto Java `Achados-e-Perdidos-Iguatemi`
   - a pasta `tools/java-out`
   - o arquivo `mysql-connector-j-8.4.0.jar`
   - Java 17/21 instalado no servidor
3. Se o banco exigir SSL, preencha `DB_CA`.

Start do backend:

```bash
npm install
npm run build
npm run start
```
