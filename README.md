# Actualización $(date)
# 🤖 Pantera Bot v2 - Bot Automático para inDrive

## 🚀 **Bot inteligente que automatiza ofertas en inDrive**

Pantera Bot v2 es un bot avanzado para Android que monitorea automáticamente la aplicación inDrive y coloca ofertas inteligentes según tu configuración personalizada.

## ✨ **Características Principales**

### 🎯 **Automatización Completa**
- ✅ **Detección automática** de viajes disponibles
- ✅ **Ofertas automáticas** con precios calculados inteligentemente  
- ✅ **Funcionamiento en segundo plano** 24/7
- ✅ **Auto-inicio** al arrancar el dispositivo

### 🔍 **Filtros Inteligentes**
- ✅ **Filtro por distancia** (máxima y de recogida)
- ✅ **Filtro por calificación** del pasajero
- ✅ **Rechazar clientes nuevos** (opcional)
- ✅ **Ocultar viajes con múltiples paradas**
- ✅ **Límites de precio** personalizables

### 📱 **Interfaz Moderna**
- ✅ **Diseño responsive** optimizado para móvil
- ✅ **Configuración visual** con sliders y controles
- ✅ **Notificaciones en tiempo real**
- ✅ **Gestión automática de permisos**

## 🛠️ **Instalación**

### **Opción 1: Descargar APK (Recomendado)**
1. Ve a [Releases](../../releases)
2. Descarga el archivo `pantera-bot-v2.apk`
3. Instala en tu dispositivo Android
4. Configura los permisos necesarios

### **Opción 2: Compilar desde código**
```bash
# Clonar repositorio
git clone https://github.com/tu-usuario/pantera-bot.git
cd pantera-bot

# Instalar dependencias
npm install

# Compilar para Android
npm run build:android
```

## ⚙️ **Configuración**

### **1. Permisos Requeridos**
El bot necesita los siguientes permisos para funcionar:

- 📍 **Ubicación**: Para detectar viajes cercanos
- 🔍 **Accesibilidad**: Para leer la pantalla de inDrive
- 📢 **Notificaciones**: Para alertas del bot
- 📱 **Mostrar sobre otras apps**: Para interfaz flotante
- 🔋 **Ejecutar en segundo plano**: Para funcionamiento continuo

### **2. Configuración del Bot**

#### **💰 Configuración de Ofertas**
- **Precio por KM**: Precio base por kilómetro
- **Precio Mínimo**: Oferta mínima a colocar
- **Precio Máximo**: Oferta máxima a colocar
- **Distancia de recogida**: Máxima distancia para ir a recoger
- **Distancia máxima**: Máxima distancia total del viaje

#### **🎛️ Filtros Avanzados**
- **Autobid List**: Activar/desactivar ofertas automáticas
- **Hide**: Ocultar viajes con múltiples destinos
- **Rechazar clientes nuevos**: Filtrar usuarios sin historial
- **Calificación mínima**: Filtrar por rating del pasajero
- **Refresh**: Velocidad de actualización de la lista

## 🔧 **Uso**

### **Inicio Rápido**
1. **Instala** la aplicación
2. **Configura** todos los permisos requeridos
3. **Ajusta** la configuración según tus preferencias
4. **Inicia** el bot con el botón principal
5. **Abre inDrive** y deja que el bot trabaje

### **Modos de Funcionamiento**

#### **🤖 Modo Automático (Autobid ON)**
- Detecta viajes automáticamente
- Aplica filtros configurados
- Calcula precios inteligentemente
- Coloca ofertas automáticamente

#### **👀 Modo Observador (Autobid OFF)**
- Solo detecta y filtra viajes
- Muestra notificaciones de viajes encontrados
- No coloca ofertas automáticamente
- Útil para monitorear el mercado

## 📊 **Algoritmo de Precios**

El bot calcula los precios usando la siguiente fórmula:

```
Precio = Distancia × Precio_por_KM

Si Precio < Precio_Mínimo → Precio = Precio_Mínimo
Si Precio > Precio_Máximo → Precio = Precio_Máximo
```

## 🛡️ **Seguridad y Privacidad**

- ✅ **Sin recopilación de datos**: El bot no envía información a servidores externos
- ✅ **Funcionamiento local**: Todo el procesamiento es en tu dispositivo
- ✅ **Código abierto**: Puedes revisar todo el código fuente
- ✅ **Permisos mínimos**: Solo solicita permisos necesarios para funcionar

## 🔧 **Desarrollo**

### **Tecnologías Utilizadas**
- **Frontend**: React + TypeScript + Tailwind CSS
- **Mobile**: Capacitor + Android Native
- **Animaciones**: Framer Motion
- **Build**: Vite + Android Gradle

### **Estructura del Proyecto**
```
pantera-bot/
├── src/                    # Código React/TypeScript
├── android/               # Código Android nativo
├── public/               # Assets estáticos
└── .github/workflows/    # CI/CD para builds automáticos
```

### **Scripts Disponibles**
```bash
npm run dev              # Desarrollo web
npm run build           # Build para producción
npm run android         # Ejecutar en Android
npm run build:android   # Build completo para Android
```

## 🐛 **Solución de Problemas**

### **El bot no detecta viajes**
1. Verifica que el servicio de accesibilidad esté activo
2. Asegúrate de que inDrive esté en primer plano
3. Revisa que los filtros no sean muy restrictivos

### **El bot se detiene solo**
1. Desactiva la optimización de batería para Pantera Bot
2. Permite que la app se ejecute en segundo plano
3. Verifica que todos los permisos estén concedidos

### **Las ofertas no se colocan**
1. Verifica que "Autobid List" esté activado
2. Revisa la configuración de precios
3. Asegúrate de que los viajes cumplan los filtros

## 📞 **Soporte**

- 💬 **WhatsApp**: [+1 (809) 852-2664](https://wa.me/18098522664)
- 🐛 **Issues**: [GitHub Issues](../../issues)
- 📧 **Email**: soporte@panterabot.com

## 📄 **Licencia**

Este proyecto está bajo la Licencia MIT. Ver [LICENSE](LICENSE) para más detalles.

## ⚠️ **Disclaimer**

Este bot es una herramienta de automatización para uso personal. El usuario es responsable de cumplir con los términos de servicio de inDrive y las leyes locales aplicables.

---

**🤖 Pantera Bot v2 - Automatiza tu trabajo en inDrive** 🚗💰
