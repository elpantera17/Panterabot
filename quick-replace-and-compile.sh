#!/bin/bash

echo "⚡ REEMPLAZO Y COMPILACIÓN RÁPIDA"
echo "================================="

# Configurar colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

show_step() {
    echo -e "${BLUE}🔄 $1${NC}"
}

show_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Paso 1: Limpiar proyecto anterior
show_step "Limpiando proyecto anterior..."
rm -rf ~/pantera-bot
mkdir -p ~/pantera-bot
show_success "Proyecto anterior eliminado"

# Paso 2: Copiar nuevo proyecto
show_step "Copiando nuevo proyecto..."
cp -r /storage/emulated/0/backups/app3/Panteraa2/panteraav2/* ~/pantera-bot/
show_success "Nuevo proyecto copiado"

# Paso 3: Ir al directorio
cd ~/pantera-bot

# Paso 4: Configurar permisos
show_step "Configurando permisos..."
chmod +x android/gradlew 2>/dev/null
show_success "Permisos configurados"

# Paso 5: Instalar dependencias
show_step "Instalando dependencias..."
npm install

# Paso 6: Build
show_step "Compilando aplicación..."
npm run build

# Paso 7: Sync
show_step "Sincronizando Android..."
npx cap sync android

# Paso 8: Compilar APK
show_step "Compilando APK..."
cd android
./gradlew assembleDebug

# Paso 9: Copiar a Downloads
show_step "Copiando APK a Downloads..."
cp app/build/outputs/apk/debug/app-debug.apk /storage/emulated/0/Download/pantera-bot-v2-new.apk

echo ""
echo "🎉 ¡COMPLETADO!"
echo "📱 APK disponible en Downloads como: pantera-bot-v2-new.apk"