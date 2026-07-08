FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --include=dev

COPY tsconfig.json ./
COPY src ./src

RUN npm run build
RUN npm prune --omit=dev

ENV NODE_ENV=production
ENV PORT=3000
ENV IMAGENS_PATH=/app/data/imagens
ENV PDF_ENGINE=auto

RUN mkdir -p /app/data/imagens/itens /app/data/imagens/entregas

EXPOSE 3000

CMD ["npm", "start"]
