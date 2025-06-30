# Deck of cards (Black Jack)
### Deployment on Azure with Wep App Service and Container Registry

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
