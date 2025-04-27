🛠️ ID Profiles Generator - Fullstack App (React + Flask + Helm k8s + Docker)

This project is a full-stack app with a React frontend, Flask backend, and Helm charts for deploying to Kubernetes. CI/CD pipelines build and push Docker images to DockerHub. The project uses Ingress to expose services externally. It can be run locally via Docker Compose or deployed to Kubernetes using Helm.

📁 Project Structure

react-flask-app/
├── backend/                  # Flask API
├── frontend/                 # Next.js React App
├── helm/                     # Helm charts for Kubernetes
│   ├── Chart.yaml
│   ├── values.yaml           # Common values
│   ├── values-dev.yaml       # Dev environment values
│   ├── values-prod.yaml      # Prod environment values
│   └── templates/
│       ├── backend-deployment.yaml
│       ├── backend-service.yaml
│       ├── frontend-deployment.yaml
│       ├── frontend-service.yaml
│       └── ingress.yaml      # Ingress resource

⚙️ Local Installation

1. Clone Repository

git clone https://github.com/edensitko/id-profiles-generator.git
cd id-profiles-generator

2. Build & Run with Docker Compose (locally)

Ensure Docker is running.

docker-compose up --build

You can now visit:

Frontend: http://localhost:3001

Backend: http://localhost:5001

☘️ Deploy with Helm to Kubernetes

1. Start Minikube (or connect to your Kubernetes cluster)

minikube start

2. Add namespaces (if needed)

kubectl create namespace dev
kubectl create namespace prod

3. Deploy to dev environment

cd helm
helm upgrade --install myapp . -f values-dev.yaml -n dev --create-namespace

4. Deploy to prod environment

helm upgrade --install myapp . -f values-prod.yaml -n prod --create-namespace

5. Check Deployment Status

kubectl get all -n dev
kubectl get all -n prod

6. Enable Ingress (for local testing)

minikube addons enable ingress
minikube tunnel

7. Access via Ingress URL

Make sure your /etc/hosts contains:

127.0.0.1 dev.genrapp
127.0.0.1 genrapp

Then visit:

Dev: http://dev.genrapp:3001

Prod: http://genrapp:3001

To uninstall:

helm uninstall myapp -n dev
helm uninstall myapp -n prod

🚀 CI/CD: Docker Build and Push

CI pipeline runs on push to main:

Builds Docker images for frontend and backend

Pushes them to DockerHub: https://hub.docker.com/r/edensit139/gener

CI/CD Tools Used:

GitHub Actions

DockerHub

Docker Push Steps in CI:

# Backend
cd backend
docker build -t edensit139/gener:backend-dev .
docker push edensit139/gener:backend-dev

docker build -t edensit139/gener:backend-prod .
docker push edensit139/gener:backend-prod

# Frontend
cd ../frontend
docker build -t edensit139/gener:frontend-dev .
docker push edensit139/gener:frontend-dev

docker build -t edensit139/gener:frontend-prod .
docker push edensit139/gener:frontend-prod

🧪 What We Did - Full Flow Summary

Local Dev:

Built backend and frontend Docker images locally

Ran them via docker-compose up for testing on localhost

DockerHub CI/CD:

Pushed to main branch

GitHub Actions triggered

Built both images and pushed:

edensit139/gener:backend-dev

edensit139/gener:frontend-dev

edensit139/gener:backend-prod

edensit139/gener:frontend-prod

Helm on Kubernetes:

Started Minikube with minikube start

Enabled ingress: minikube addons enable ingress

Installed Helm charts for dev and prod

Dev: helm upgrade --install myapp . -f values-dev.yaml -n dev

Prod: helm upgrade --install myapp . -f values-prod.yaml -n prod

Ingress routing was configured in helm/templates/ingress.yaml

Accessed via custom host:

Dev: http://dev.genrapp:3001

Prod: http://genrapp:3001

Ingress Note:

Ingress is required to expose frontend via a nice domain

Works by mapping hostname (e.g., dev.genrapp) to service inside cluster

# id-profiles-generator
