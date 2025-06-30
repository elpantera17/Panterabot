#!/bin/bash

echo "🤖 Iniciando compilación de Pantera Bot APK..."

# Verificar dependencias
echo "📦 Instalando dependencias..."
npm install

# Build del proyecto web
echo "🏗️ Compilando aplicación web..."
npm run build

# Sincronizar con Capacitor
echo "🔄 Sincronizando con Capacitor..."
npx cap sync android

# Compilar APK
echo "📱 Compilando APK de Android..."
cd android
./gradlew assembleDebug

echo ""
echo "🎉 ¡APK compilado exitosamente!"
echo "📍 Ubicación: android/app/build/outputs/apk/debug/app-debug.apk"
echo ""
echo "📥 Para descargar el APK:"
echo "1. Ve al explorador de archivos (izquierda)"
echo "2. Navega a: android/app/build/outputs/apk/debug/"
echo "3. Haz clic derecho en 'app-debug.apk'"
echo "4. Selecciona 'Download'"
echo ""
echo "🤖 ¡Tu Pantera Bot está listo para instalar!"