# STAP 1: We bouwen hier onze Vue-app
# We gebruiken een lichte versie van Node.js om onze code om te zetten naar een echte website
FROM node:20-alpine as build-stage

# We maken een mapje 'app' aan waar we in gaan werken
WORKDIR /app

# We kopiëren eerst alleen de lijstjes met pakketten die we nodig hebben
COPY package*.json ./

# We installeren alle benodigde pakketten voor ons project
RUN npm install

# Nu kopiëren we de rest van onze broncode naar de container
COPY . .

# We geven het commando om de website te bouwen (dit maakt de 'dist' map aan)
RUN npm run build


# STAP 2: We gaan de website nu echt serveren met Nginx
# We stappen over naar een hele snelle en lichte webserver
FROM nginx:stable-alpine as production-stage

# We kopiëren onze eigen instellingen voor de webserver naar de juiste plek
COPY nginx.conf /etc/nginx/conf.d/default.conf

# We pakken alleen de kant-en-klare website uit de vorige stap en zetten die in de webserver
COPY --from=build-stage /app/dist /usr/share/nginx/html

# We zetten poort 80 open zodat mensen onze website kunnen bezoeken
EXPOSE 80

# We starten de webserver op en zorgen dat deze netjes blijft draaien
CMD ["nginx", "-g", "daemon off;"]