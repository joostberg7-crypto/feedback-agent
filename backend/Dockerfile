# Gebruik een lichte en veilige Node.js basis image
FROM node:20-alpine

# Stel de werkmap in de container in
WORKDIR /app

# Kopieer package.json en package-lock.json (als die er is)
COPY package*.json ./

# Installeer de dependencies
RUN npm install

# Kopieer de rest van de applicatiecode (zoals index.ts en tsconfig.json)
COPY . .

# Stel de poort bloot (Cloud Run verwacht standaard 8080)
EXPOSE 8080

# Start het script
CMD ["npx", "ts-node", "src/index.ts"]