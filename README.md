# 🛠️ ID Profiles Generator

A modern full-stack application for generating ID profiles, built with **React** (Next.js), **Flask**, **Docker**, and **Kubernetes (Helm)**. Supports local development and cloud-native deployment.

---

## 📑 Table of Contents
- [Overview](#overview)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Local Installation](#local-installation)
- [Kubernetes Deployment with Helm](#kubernetes-deployment-with-helm)
- [CI/CD Pipeline](#cicd-pipeline)
- [Contributing](#contributing)
- [License](#license)

---

## 📝 Overview
This project provides a robust platform for generating and managing ID profiles. It leverages a React frontend, Flask backend, and is designed for both local and Kubernetes deployments. CI/CD is handled via GitHub Actions and DockerHub.

---

## 📁 Project Structure
```
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
```

---

## 🚦 Prerequisites
- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)
- [Node.js](https://nodejs.org/) & [npm](https://www.npmjs.com/) (for frontend development)
- [Python 3.8+](https://www.python.org/) (for backend development)
- [Helm](https://helm.sh/) & [kubectl](https://kubernetes.io/docs/tasks/tools/)
- (Optional) [Minikube](https://minikube.sigs.k8s.io/docs/) for local K8s

---

## ⚙️ Local Installation

1. **Clone Repository**
   ```bash
   git clone https://github.com/edensitko/id-profiles-generator.git
   cd id-profiles-generator
   ```
2. **Build & Run with Docker Compose**
   Ensure Docker is running.
   ```bash
   docker-compose up --build
   ```
   - Frontend: [http://localhost:3001](http://localhost:3001)
   - Backend: [http://localhost:5001](http://localhost:5001)

---

## ☘️ Kubernetes Deployment with Helm

1. **Start Minikube (or connect to your K8s cluster)**
   ```bash
   minikube start
   ```
2. **Create namespaces**
   ```bash
   kubectl create namespace dev
   kubectl create namespace prod
   ```
3. **Deploy to dev environment**
   ```bash
   cd helm
   helm upgrade --install myapp . -f values-dev.yaml -n dev --create-namespace
   ```
4. **Deploy to prod environment**
   ```bash
   helm upgrade --install myapp . -f values-prod.yaml -n prod --create-namespace
   ```
5. **Check Deployment Status**
   ```bash
   kubectl get all -n dev
   kubectl get all -n prod
   ```
6. **Enable Ingress (for local testing)**
   ```bash
   minikube addons enable ingress
   minikube tunnel
   ```
7. **Access via Ingress URL**
   Add to your `/etc/hosts`:
   ```
   127.0.0.1 dev.genrapp
   127.0.0.1 genrapp
   ```
   - Dev: [http://dev.genrapp:3001](http://dev.genrapp:3001)
   - Prod: [http://genrapp:3001](http://genrapp:3001)

**To uninstall:**
```bash
helm uninstall myapp -n dev
helm uninstall myapp -n prod
```

---

## 🚀 CI/CD Pipeline
- CI pipeline runs on push to `main`.
- Builds Docker images for frontend and backend.
- Pushes images to [DockerHub](https://hub.docker.com/r/edensit139/gener).

**CI/CD Tools Used:**
- GitHub Actions
- DockerHub

**Docker Push Steps in CI:**
```bash
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
```

---

## 🤝 Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

## 📄 License
This project is licensed under the MIT License.

---

## 🔗 Useful Links
- [DockerHub Images](https://hub.docker.com/r/edensit139/gener)
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Helm Docs](https://helm.sh/docs/)
