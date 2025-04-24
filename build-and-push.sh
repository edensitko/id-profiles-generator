#!/bin/sh
set -e

# Backend
docker build -t edensit139/gener:backend-dev ./backend
docker push edensit139/gener:backend-dev

docker build -t edensit139/gener:backend-prod ./backend
docker push edensit139/gener:backend-prod

# Frontend
docker build -t edensit139/gener:frontend-dev ./frontend
docker push edensit139/gener:frontend-dev

docker build -t edensit139/gener:frontend-prod ./frontend
docker push edensit139/gener:frontend-prod