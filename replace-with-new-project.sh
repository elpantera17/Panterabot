#!/bin/bash

echo "🔄 Reemplazando proyecto con la nueva versión de Panteraa2"
echo "========================================================="

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para mostrar mensajes con colores
show_message() {
    echo -e "${GREEN}✅ $1${NC}"
}

show_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

show_error() {
    echo -e "${RED}❌ $1${NC}"
}

show_info() {
    echo -e "${BLUE}ℹ️ $1${NC}"
}

# Verificar que estamos en Termux
if [ ! -d "$PREFIX" ]; then
    show_error "Este script debe ejecutarse en Termux"
    exit 1
fi

# Rutas
OLD_PROJECT_DIR="$HOME/pantera-bot"
NEW_PROJECT_SOURCE="/storage/emulated/0/backups/app3/Panteraa2/panteraav2"
BACKUP_DIR="$HOME/pantera-bot-backup-$(date +%Y%m%d_%H%M%S)"

echo ""
show_info "Configuración:"
echo "  📁 Proyecto anterior: $OLD_PROJECT_DIR"
echo "  📁 Nuevo proyecto: $NEW_PROJECT_SOURCE"
echo "  💾 Backup: $BACKUP_DIR"
echo ""

# Verificar que existe el nuevo proyecto
if [ ! -d "$NEW_PROJECT_SOURCE" ]; then
    show_error "No se encontró el nuevo proyecto en: $NEW_PROJECT_SOURCE"
    show_info "Verificando rutas disponibles..."
    ls -la /storage/emulated/0/backups/app3/ 2>/dev/null || echo "No se puede acceder a la carpeta"
    exit 1
fi

show_message "Nuevo proyecto encontrado!"

# Verificar acceso a storage
if [ ! -d "/storage/emulated/0" ]; then
    show_warning "Configurando acceso a almacenamiento..."
    termux-setup-storage
    sleep 2
fi

# Hacer backup del proyecto anterior si existe
if [ -d "$OLD_PROJECT_DIR" ]; then
    show_info "Haciendo backup del proyecto anterior..."
    cp -r "$OLD_PROJECT_DIR" "$BACKUP_DIR"
    if [ $? -eq 0 ]; then
        show_message "Backup creado en: $BACKUP_DIR"
    else
        show_warning "No se pudo crear backup, continuando..."
    fi
    
    # Eliminar proyecto anterior
    show_info "Eliminando proyecto anterior..."
    rm -rf "$OLD_PROJECT_DIR"
    show_message "Proyecto anterior eliminado"
else
    show_info "No hay proyecto anterior que eliminar"
fi

# Crear directorio del proyecto
show_info "Creando directorio del nuevo proyecto..."
mkdir -p "$OLD_PROJECT_DIR"

# Copiar nuevo proyecto
show_info "Copiando nuevo proyecto desde Panteraa2..."
echo "Esto puede tomar unos minutos..."

# Copiar con progreso
cp -r "$NEW_PROJECT_SOURCE"/* "$OLD_PROJECT_DIR/" 2>/dev/null

if [ $? -eq 0 ]; then
    show_message "Proyecto copiado exitosamente!"
else
    show_error "Error copiando el proyecto"
    
    # Intentar método alternativo
    show_info "Intentando método alternativo..."
    cd "$OLD_PROJECT_DIR"
    
    # Copiar archivos uno por uno para evitar errores
    for item in "$NEW_PROJECT_SOURCE"/*; do
        if [ -e "$item" ]; then
            cp -r "$item" . 2>/dev/null
            echo "Copiado: $(basename "$item")"
        fi
    done
fi

# Verificar que se copió correctamente
cd "$OLD_PROJECT_DIR"

if [ -f "package.json" ]; then
    show_message "✅ package.json encontrado"
else
    show_error "❌ package.json no encontrado"
fi

if [ -d "android" ]; then
    show_message "✅ Carpeta android encontrada"
else
    show_error "❌ Carpeta android no encontrada"
fi

if [ -d "src" ]; then
    show_message "✅ Carpeta src encontrada"
else
    show_error "❌ Carpeta src no encontrada"
fi

# Mostrar contenido del proyecto
echo ""
show_info "Contenido del nuevo proyecto:"
ls -la "$OLD_PROJECT_DIR"

# Configurar permisos
show_info "Configurando permisos..."
find "$OLD_PROJECT_DIR" -name "*.sh" -exec chmod +x {} \; 2>/dev/null
if [ -f "$OLD_PROJECT_DIR/android/gradlew" ]; then
    chmod +x "$OLD_PROJECT_DIR/android/gradlew"
    show_message "Permisos de gradlew configurados"
fi

echo ""
echo "🎉 ¡Proyecto reemplazado exitosamente!"
echo ""
show_info "Próximos pasos:"
echo "1. cd ~/pantera-bot"
echo "2. npm install"
echo "3. npm run build"
echo "4. npx cap sync android"
echo "5. cd android && ./gradlew assembleDebug"
echo ""
show_message "¿Quieres compilar automáticamente ahora? (y/n)"
read -r compile_now

if [[ $compile_now =~ ^[Yy]$ ]]; then
    echo ""
    show_info "🚀 Iniciando compilación automática..."
    
    # Instalar dependencias
    show_info "📦 Instalando dependencias..."
    npm install
    
    if [ $? -eq 0 ]; then
        show_message "Dependencias instaladas"
        
        # Build
        show_info "🏗️ Compilando aplicación web..."
        npm run build
        
        if [ $? -eq 0 ]; then
            show_message "Build completado"
            
            # Sync
            show_info "🔄 Sincronizando con Android..."
            npx cap sync android
            
            if [ $? -eq 0 ]; then
                show_message "Sincronización completada"
                
                # Compilar APK
                show_info "📱 Compilando APK..."
                cd android
                ./gradlew assembleDebug
                
                if [ $? -eq 0 ]; then
                    echo ""
                    echo "🎉 ¡APK COMPILADO EXITOSAMENTE!"
                    echo ""
                    show_message "📍 APK ubicado en:"
                    echo "   android/app/build/outputs/apk/debug/app-debug.apk"
                    echo ""
                    show_info "Para copiar a Downloads:"
                    echo "   cp android/app/build/outputs/apk/debug/app-debug.apk /storage/emulated/0/Download/pantera-bot-v2.apk"
                else
                    show_error "Error compilando APK"
                fi
            else
                show_error "Error en sincronización"
            fi
        else
            show_error "Error en build"
        fi
    else
        show_error "Error instalando dependencias"
    fi
else
    show_info "Compilación manual disponible con: ./compile-pantera-bot.sh"
fi

echo ""
show_message "¡Proceso completado!"