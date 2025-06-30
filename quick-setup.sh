#!/bin/bash

echo "⚡ Setup rápido de Pantera Bot"
echo "=============================="

# Función para verificar comandos
check_command() {
    if command -v $1 >/dev/null 2>&1; then
        echo "✅ $1 disponible"
        return 0
    else
        echo "❌ $1 no encontrado"
        return 1
    fi
}

# Verificar dependencias
echo "🔍 Verificando dependencias..."
check_command "node" || { echo "Instala Node.js primero"; exit 1; }
check_command "npm" || { echo "Instala npm primero"; exit 1; }
check_command "curl" || { echo "curl no disponible"; exit 1; }
check_command "unzip" || { echo "unzip no disponible"; exit 1; }

echo ""
echo "📥 Descargando proyecto desde GitHub..."

# URL directa del proyecto
GITHUB_URL="https://github.com/elpantera17/Panterabot/archive/refs/heads/main.zip"

# Descargar directamente
curl -L -o project.zip "$GITHUB_URL"

if [ $? -eq 0 ]; then
    echo "✅ Descarga completada"
else
    echo "❌ Error en la descarga"
    exit 1
fi

# Extraer
echo "📦 Extrayendo archivos..."
unzip -q project.zip

# Encontrar directorio
PROJECT_DIR=$(find . -name "Panterabot-*" -type d | head -1)

if [ -n "$PROJECT_DIR" ]; then
    echo "📁 Copiando desde: $PROJECT_DIR"
    
    # Copiar archivos
    cp -r "$PROJECT_DIR"/* .
    
    # Limpiar
    rm -rf "$PROJECT_DIR" project.zip
    
    echo "✅ Archivos copiados exitosamente"
else
    echo "❌ No se encontró el directorio del proyecto"
    exit 1
fi

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm install

echo ""
echo "🎉 ¡Setup completado!"
echo ""
echo "🔧 Comandos disponibles:"
echo "   npm run dev          - Desarrollo web"
echo "   npm run build        - Compilar web"
echo "   npm run android      - Ejecutar en Android"
echo "   npm run build:android - Compilar APK"
echo ""
echo "📱 Para generar APK:"
echo "   1. npm run build"
echo "   2. npx cap sync android"
echo "   3. cd android && ./gradlew assembleDebug"