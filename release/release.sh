#!/bin/bash

# Configuración de versiones
echo "Iniciando la liberación de la versión del traductor de señas..."

# Crear una imagen Docker con la versión específica
VERSION="v1.0"
echo "Construyendo la imagen de Docker..."
docker build -t sign-language-translator:$VERSION .

# Etiquetar la imagen
echo "Etiquetando la imagen..."
docker tag sign-language-translator:$VERSION my-docker-repo/sign-language-translator:$VERSION

# Subir la imagen al repositorio
echo "Subiendo la imagen al repositorio Docker..."
docker push my-docker-repo/sign-language-translator:$VERSION

echo "Liberación completada con éxito."
