# STAP 1: Bouwen van de Vue app
FROM node:18-alpine as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# STAP 2: Serveren met Nginx
FROM nginx:stable-alpine as production-stage
# Kopieer onze eigen Nginx configuratie naar de juiste plek
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Kopieer de 'dist' map van de vorige stap
COPY --from=build-stage /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]