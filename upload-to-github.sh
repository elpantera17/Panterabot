#!/bin/bash

echo "🚀 Subiendo Pantera Bot a GitHub desde Replit"
echo "=============================================="

# Verificar que estamos en Replit
if [ -z "$REPL_SLUG" ]; then
    echo "⚠️ Este script está diseñado para ejecutarse en Replit"
fi

# Configurar Git si no está configurado
echo "🔧 Configurando Git..."
git config --global user.name "Pantera Bot Developer"
git config --global user.email "panterabot@replit.com"

# Inicializar repositorio si no existe
if [ ! -d ".git" ]; then
    echo "📁 Inicializando repositorio Git..."
    git init
fi

# Agregar todos los archivos
echo "📦 Agregando archivos al repositorio..."
git add .

# Hacer commit
echo "💾 Creando commit..."
git commit -m "🤖 Pantera Bot v2 - Proyecto completo

✨ Características:
- Bot automático para inDrive
- Interfaz React moderna
- Código Android nativo
- Sistema de filtros inteligente
- Configuración personalizable

📱 Compilación:
- npm run build:android para generar APK
- Todos los permisos Android configurados
- Servicio de accesibilidad incluido

🔧 Tecnologías:
- React + TypeScript + Tailwind
- Capacitor + Android Native
- Framer Motion para animaciones"

echo ""
echo "📋 Próximos pasos:"
echo "1. Ve a GitHub.com y crea un nuevo repositorio"
echo "2. Copia la URL del repositorio (ej: https://github.com/usuario/pantera-bot.git)"
echo "3. Ejecuta estos comandos en la terminal de Replit:"
echo ""
echo "   git remote add origin TU_URL_DE_GITHUB"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "4. Una vez subido, usa el script de extracción en cualquier lugar:"
echo "   curl -L https://raw.githubusercontent.com/USUARIO/REPO/main/quick-setup.sh | bash"
echo ""
echo "🎉 ¡Tu proyecto estará disponible en GitHub!"