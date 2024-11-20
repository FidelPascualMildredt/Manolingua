#!/bin/bash

echo "Desplegando la aplicación de traductor de señas..."

# Detener cualquier contenedor previo
docker stop sign-language-translator-container || true
docker rm sign-language-translator-container || true

# Descargar la última versión de la imagen
docker pull my-docker-repo/sign-language-translator:v1.0

# Ejecutar el contenedor
docker run -d --name sign-language-translator-container \
  -p 5000:5000 my-docker-repo/sign-language-translator:v1.0

echo "Despliegue completado con éxito."
