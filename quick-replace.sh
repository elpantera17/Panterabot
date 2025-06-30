#!/bin/bash

echo "Reemplazando proyecto Pantera Bot..."

cd ~

if [ -d "pantera-bot" ]; then
    echo "Eliminando proyecto anterior..."
    rm -rf pantera-bot
fi

echo "Creando directorio limpio..."
mkdir -p pantera-bot

echo "Copiando nuevo proyecto..."
cp -r /storage/emulated/0/backups/app3/Panteraa2/panteraav2/* ~/pantera-bot/

cd ~/pantera-bot

echo "Verificando archivos copiados:"
ls -la

echo "Configurando permisos..."
chmod +x android/gradlew 2>/dev/null

echo ""
echo "Proyecto reemplazado exitosamente!"
echo "Ubicacion: ~/pantera-bot"
