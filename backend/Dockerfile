# lichte Node.js versie
FROM node:18-alpine

# Stel de werkmap in de container in
WORKDIR /app

# Kopieer de package bestanden
COPY package*.json ./

# Installeer de dependencies
RUN npm install

# Kopieer de rest van de backend code naar de container
COPY . .

# Zet de poort open
EXPOSE 8080

# Start de server direct via ts-node
CMD ["npx", "ts-node", "src/index.ts"]