# Deck of cards (Black Jack)
### Deployment on Azure with Wep App Service and Container Registry

#### 0. Dockerfile Erklärung
FROM node:18-alpine AS builder
- Hier wird ein temporäres Build-Image mit Node.js und einer schlanken Alpine-Linux-Basis verwendet.

WORKDIR /app
- Das Arbeitsverzeichnis wird auf /app gesetzt, damit alle weiteren Befehle dort ausgeführt werden.

COPY package.json ./*
- Nur die Paketdateien werden zuerst kopiert, damit bei späteren Änderungen am Quellcode nicht jedes Mal npm install neu ausgeführt werden muss (Docker-Caching).

RUN npm install
- Installation aller Abhängigkeiten.

COPY . .
- Kopieren des gesamten Projektcodes in das Arbeitsverzeichnis.

RUN npm run build
- Erzeugt den produktionsfertigen Build (z.B. Transpilation, Bundling).

Warum zuerst bauen?
- So wird sichergestellt, dass die Anwendung vollständig gebaut ist, bevor das finale Image erstellt wird. Außerdem können Build-Werkzeuge und -Dateien (z.B. Source Code, Dev Dependencies) aus dem finalen Image weggelassen werden, was das Image schlanker macht.


#### 1. Alte Container und Images gelöscht 
- docker images
- docker image rmi <id>
- docker ps -a
- docker container rm <id>


#### 2. Login
- az login
- az acr update -n deckofcardsregistry --admin-enabled true
- az acr login --name deckofcardsregistry


#### 3. Build and Push Image
- docker build -t deckofcardsregistry.azurecr.io/deckofcards:latest .
- docker push deckofcardsregistry.azurecr.io/deckofcards:latest
