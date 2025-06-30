#!/bin/bash

echo "🤖 Extrayendo Pantera Bot desde GitHub..."

# Crear directorio temporal
mkdir -p /tmp/pantera-extract
cd /tmp/pantera-extract

# Descargar el proyecto desde GitHub
echo "📥 Descargando proyecto..."
curl -L -o pantera-bot.zip https://github.com/elpantera17/Panterabot/archive/refs/heads/main.zip

# Verificar que se descargó correctamente
if [ ! -f "pantera-bot.zip" ]; then
    echo "❌ Error: No se pudo descargar el proyecto"
    exit 1
fi

# Extraer el archivo ZIP
echo "📦 Extrayendo archivos..."
unzip -q pantera-bot.zip

# Encontrar el directorio extraído
EXTRACTED_DIR=$(find . -name "Panterabot-*" -type d | head -1)

if [ -z "$EXTRACTED_DIR" ]; then
    echo "❌ Error: No se encontró el directorio extraído"
    exit 1
fi

echo "📁 Directorio encontrado: $EXTRACTED_DIR"

# Copiar archivos al directorio del proyecto
echo "📋 Copiando archivos al proyecto..."
cd "$EXTRACTED_DIR"

# Copiar todos los archivos al directorio actual del proyecto
cp -r * /home/project/

# Volver al directorio del proyecto
cd /home/project

# Limpiar archivos temporales
echo "🧹 Limpiando archivos temporales..."
rm -rf /tmp/pantera-extract

echo "✅ Proyecto extraído exitosamente!"
echo ""
echo "📋 Próximos pasos:"
echo "1. Instalar dependencias: npm install"
echo "2. Compilar proyecto: npm run build"
echo "3. Sincronizar Android: npx cap sync android"
echo "4. Compilar APK: cd android && ./gradlew assembleDebug"