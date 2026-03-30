# Gebruik een lichte en veilige Node.js basis image
FROM node:20-alpine

# Stel de werkmap in de container in
WORKDIR /app

# Kopieer de package bestanden
COPY package*.json ./

# Installeer de dependencies
RUN npm install

# Kopieer de rest van de applicatiecode
COPY . .

# Genereer de Prisma client specifiek voor deze Linux container
RUN npx prisma generate

# Stel de poort bloot voor Cloud Run
EXPOSE 8080

# Start het script
CMD ["npx", "ts-node", "src/index.ts"]