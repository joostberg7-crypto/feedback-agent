# We gebruiken een lichte versie van Node.js om onze server op te draaien
FROM node:20-alpine

# We maken een mapje 'app' aan in de container waar we al ons werk in gaan doen
WORKDIR /app

# We kopiëren de lijstjes met pakketten (package.json) die onze server nodig heeft
COPY package*.json ./

# We installeren alle benodigde bouwstenen en bibliotheken voor onze backend
RUN npm install

# We kopiëren de rest van onze eigen backend-code naar het werkmapje
COPY . .

# We zetten poort 8080 open, want dat is de poort waar onze server op luistert
EXPOSE 8080

# We starten de server direct op door de TypeScript-code uit te voeren met ts-node
CMD ["npx", "ts-node", "src/index.ts"]