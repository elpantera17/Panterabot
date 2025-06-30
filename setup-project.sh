#!/bin/bash

echo "🚀 Configurando Pantera Bot completo..."

# Hacer ejecutable el script de extracción
chmod +x extract-project.sh

# Ejecutar extracción
./extract-project.sh

# Verificar que package.json existe
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json no encontrado"
    exit 1
fi

echo "📦 Instalando dependencias..."
npm install

echo "🏗️ Compilando aplicación web..."
npm run build

echo "🔄 Sincronizando con Capacitor..."
npx cap sync android

# Verificar que gradlew existe y hacerlo ejecutable
if [ -f "android/gradlew" ]; then
    echo "🔧 Configurando permisos de Gradle..."
    chmod +x android/gradlew
else
    echo "⚠️ Advertencia: android/gradlew no encontrado"
fi

echo ""
echo "🎉 ¡Configuración completada!"
echo ""
echo "📱 Para compilar el APK ejecuta:"
echo "   cd android && ./gradlew assembleDebug"
echo ""
echo "📍 El APK se generará en:"
echo "   android/app/build/outputs/apk/debug/app-debug.apk"