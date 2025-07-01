import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Square, 
  Shield, 
  MapPin, 
  Bell, 
  Eye,
  MessageCircle,
  Check,
  X,
  Star,
  EyeOff,
  RefreshCw,
  DollarSign,
  Layers,
  ExternalLink
} from 'lucide-react';
import { AndroidPermissions } from './services/AndroidPermissions';
import { Capacitor } from '@capacitor/core';

interface BotConfig {
  autobidEnabled: boolean;
  pricePerKm: number;
  minPrice: number;
  maxPrice: number;
  pickupDistance: number;
  maxDistance: number;
  autoRefresh: number;
  minRating: number;
  filters: {
    rejectStops: boolean;
    rejectNewClients: boolean;
    rejectLowRating: boolean;
  };
}

interface Permission {
  name: string;
  icon: React.ReactNode;
  description: string;
  granted: boolean;
  action: string;
  instructions: string;
}

const App: React.FC = () => {
  const [botActive, setBotActive] = useState(false);
  const [showPermissions, setShowPermissions] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null);
  const [isNativeApp, setIsNativeApp] = useState(false);
  const [config, setConfig] = useState<BotConfig>({
    autobidEnabled: true,
    pricePerKm: 40.0,
    minPrice: 100,
    maxPrice: 600,
    pickupDistance: 4.0,
    maxDistance: 10.0,
    autoRefresh: 500,
    minRating: 4.0,
    filters: {
      rejectStops: false,
      rejectNewClients: false,
      rejectLowRating: false,
    }
  });

  const [permissions, setPermissions] = useState<Permission[]>([
    {
      name: 'Ubicación',
      icon: <MapPin className="w-5 h-5" />,
      description: 'Necesario para detectar viajes cercanos',
      granted: false,
      action: 'location',
      instructions: 'El bot solicitará automáticamente el permiso de ubicación. Si no aparece, ve a Configuración → Ubicación y activa el permiso para Pantera Bot.'
    },
    {
      name: 'Accesibilidad',
      icon: <Eye className="w-5 h-5" />,
      description: 'Permite al bot interactuar con la app inDrive',
      granted: false,
      action: 'accessibility',
      instructions: '1. Ve a Configuración → Accesibilidad\n2. Busca "Pantera Bot" en Apps descargadas\n3. Activa el servicio de accesibilidad'
    },
    {
      name: 'Notificaciones',
      icon: <Bell className="w-5 h-5" />,
      description: 'Para alertas de viajes y estado del bot',
      granted: false,
      action: 'notifications',
      instructions: 'El bot solicitará automáticamente el permiso de notificaciones.'
    },
    {
      name: 'Mostrar sobre otras apps',
      icon: <Layers className="w-5 h-5" />,
      description: 'Permite mostrar el bot sobre inDrive',
      granted: false,
      action: 'overlay',
      instructions: '1. Ve a Configuración → Apps especiales\n2. Selecciona "Mostrar sobre otras apps"\n3. Busca "Pantera Bot" y actívalo'
    },
    {
      name: 'Ejecutar en segundo plano',
      icon: <Shield className="w-5 h-5" />,
      description: 'Mantiene el bot funcionando cuando la app está cerrada',
      granted: false,
      action: 'background',
      instructions: '1. Ve a Configuración → Batería\n2. Selecciona "Optimización de batería"\n3. Busca "Pantera Bot" y selecciona "No optimizar"'
    }
  ]);

  useEffect(() => {
    // Verificar si estamos en una app nativa
    setIsNativeApp(Capacitor.isNativePlatform());

    const savedConfig = localStorage.getItem('botConfig');
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig));
    }

    // Verificar permisos al cargar
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    if (isNativeApp) {
      // Verificar permisos reales en Android
      const permissionStatus = await AndroidPermissions.checkPermissions();
      setPermissions(prev => prev.map(permission => ({
        ...permission,
        granted: permissionStatus[permission.action] || false
      })));
    } else {
      // Verificar permisos guardados en localStorage (modo web)
      const savedPermissions = localStorage.getItem('grantedPermissions');
      if (savedPermissions) {
        const granted = JSON.parse(savedPermissions);
        setPermissions(prev => prev.map(permission => ({
          ...permission,
          granted: granted.includes(permission.action)
        })));
      }
    }
  };

  const saveConfig = () => {
    localStorage.setItem('botConfig', JSON.stringify(config));
    if (isNativeApp) {
      AndroidPermissions.showNotification('Configuración guardada', 'La configuración se ha guardado exitosamente');
    } else {
      alert('Configuración guardada exitosamente');
    }
  };

  const openSystemSettings = async (permission: Permission) => {
    setSelectedPermission(permission);
    
    if (isNativeApp) {
      // Abrir configuraciones reales de Android
      try {
        switch (permission.action) {
          case 'location':
            const locationGranted = await AndroidPermissions.requestLocationPermission();
            if (locationGranted) {
              markPermissionAsGranted('location');
              return;
            }
            await AndroidPermissions.openLocationSettings();
            break;
          case 'notifications':
            const notificationGranted = await AndroidPermissions.requestNotificationPermission();
            if (notificationGranted) {
              markPermissionAsGranted('notifications');
              return;
            }
            await AndroidPermissions.openNotificationSettings();
            break;
          case 'accessibility':
            await AndroidPermissions.openAccessibilitySettings();
            break;
          case 'overlay':
            await AndroidPermissions.openOverlaySettings();
            break;
          case 'background':
            await AndroidPermissions.openBatteryOptimizationSettings();
            break;
        }
      } catch (error) {
        console.error('Error opening settings:', error);
      }
    }
    
    setShowInstructions(true);
  };

  const markPermissionAsGranted = (action: string) => {
    setPermissions(prev => prev.map(permission => 
      permission.action === action 
        ? { ...permission, granted: true }
        : permission
    ));
    
    if (!isNativeApp) {
      // Guardar en localStorage solo en modo web
      const grantedPermissions = permissions
        .filter(p => p.granted || p.action === action)
        .map(p => p.action);
      localStorage.setItem('grantedPermissions', JSON.stringify(grantedPermissions));
    }
    
    setShowInstructions(false);
    setSelectedPermission(null);
  };

  const toggleBot = async () => {
    const allPermissionsGranted = permissions.every(p => p.granted);
    
    if (!allPermissionsGranted) {
      const message = '⚠️ Necesitas configurar todos los permisos antes de iniciar el bot';
      if (isNativeApp) {
        await AndroidPermissions.showNotification('Permisos requeridos', message);
      } else {
        alert(message);
      }
      setShowPermissions(true);
      return;
    }

    setBotActive(!botActive);
    
    const message = !botActive 
      ? (config.autobidEnabled 
          ? '🤖 Pantera Bot iniciado - Buscando y ofertando viajes automáticamente'
          : '🤖 Pantera Bot iniciado - Solo funciones de filtrado activas (sin ofertar)')
      : '⏹️ Pantera Bot detenido';

    if (isNativeApp) {
      await AndroidPermissions.showNotification(
        !botActive ? 'Bot Iniciado' : 'Bot Detenido', 
        message
      );
    } else {
      alert(message);
    }
  };

  const AnimatedTitle = () => {
    const colors = ['text-orange-400', 'text-red-400', 'text-yellow-400', 'text-orange-500', 'text-red-500'];
    const [colorIndex, setColorIndex] = useState(0);

    useEffect(() => {
      const interval = setInterval(() => {
        setColorIndex((prev) => (prev + 1) % colors.length);
      }, 1000);
      return () => clearInterval(interval);
    }, []);

    return (
      <motion.h1 
        className={`text-2xl font-bold ${colors[colorIndex]} transition-colors duration-500`}
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        Pantera Bot v2 {isNativeApp && <span className="text-green-400 text-sm">📱 Android</span>}
      </motion.h1>
    );
  };

  const ContactAdmin = () => {
    const colors = ['text-red-400', 'text-blue-400', 'text-green-400', 'text-yellow-400', 'text-purple-400'];
    const [colorIndex, setColorIndex] = useState(0);

    useEffect(() => {
      const interval = setInterval(() => {
        setColorIndex((prev) => (prev + 1) % colors.length);
      }, 800);
      return () => clearInterval(interval);
    }, []);

    return (
      <motion.button
        className="flex items-center space-x-2 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 px-4 py-2 rounded-lg transition-all duration-300 shadow-lg"
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          if (isNativeApp) {
            Capacitor.Plugins.App.openUrl({ url: 'https://wa.me/18098522664' });
          } else {
            window.open('https://wa.me/18098522664', '_blank');
          }
        }}
      >
        <MessageCircle className="w-5 h-5 text-white" />
        <span className={`font-semibold ${colors[colorIndex]} transition-colors duration-500`}>
          Contactar Administrador
        </span>
      </motion.button>
    );
  };

  const BotInterface = () => (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-orange-900 to-black p-6">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-center mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-400 via-red-500 to-black rounded-2xl flex items-center justify-center shadow-xl overflow-hidden">
              <img 
                src="/png-transparent-angry-black-panther-esport-logo-thumbnail.png" 
                alt="Pantera Bot" 
                className="w-full h-full object-cover rounded-xl"
              />
            </div>
            <AnimatedTitle />
          </div>
        </div>

        {/* Contact Admin */}
        <div className="mb-6 flex justify-center">
          <ContactAdmin />
        </div>

        {/* Status de permisos */}
        <div className="mb-6">
          <div className={`p-4 rounded-lg border-2 ${
            permissions.every(p => p.granted) 
              ? 'bg-green-900 bg-opacity-30 border-green-500' 
              : 'bg-red-900 bg-opacity-30 border-red-500'
          }`}>
            <div className="flex items-center space-x-2">
              {permissions.every(p => p.granted) ? (
                <>
                  <Check className="w-5 h-5 text-green-400" />
                  <span className="text-green-300 font-semibold">✅ Todos los permisos configurados</span>
                </>
              ) : (
                <>
                  <X className="w-5 h-5 text-red-400" />
                  <span className="text-red-300 font-semibold">
                    ⚠️ {permissions.filter(p => !p.granted).length} permisos pendientes
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Autobid List - Primera opción */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-orange-800 to-red-800 rounded-lg p-4 border-2 border-orange-500 shadow-lg">
            <FilterCheckbox
              label="Autobid List - Ofertar automáticamente"
              checked={config.autobidEnabled}
              onChange={(checked) => setConfig(prev => ({
                ...prev,
                autobidEnabled: checked
              }))}
              icon={<DollarSign className="w-5 h-5" />}
            />
            <p className="text-xs text-orange-200 mt-2 ml-8">
              {config.autobidEnabled 
                ? "✅ El bot ofertará precios automáticamente" 
                : "❌ Solo funciones de filtrado (sin ofertar)"}
            </p>
          </div>
        </div>

        {/* Filtros */}
        <div className="space-y-4 mb-8">
          <FilterCheckbox
            label="Hide - Ocultar viajes con múltiples destinos"
            checked={config.filters.rejectStops}
            onChange={(checked) => setConfig(prev => ({
              ...prev,
              filters: { ...prev.filters, rejectStops: checked }
            }))}
            icon={<EyeOff className="w-5 h-5" />}
          />
          
          <FilterCheckbox
            label="Rechazar clientes nuevos"
            checked={config.filters.rejectNewClients}
            onChange={(checked) => setConfig(prev => ({
              ...prev,
              filters: { ...prev.filters, rejectNewClients: checked }
            }))}
            icon={<X className="w-5 h-5" />}
          />
          
          <div className="bg-gray-800 rounded-lg p-4 border border-orange-500">
            <FilterCheckbox
              label="Filtrar por calificación mínima del pasajero"
              checked={config.filters.rejectLowRating}
              onChange={(checked) => setConfig(prev => ({
                ...prev,
                filters: { ...prev.filters, rejectLowRating: checked }
              }))}
              icon={<Star className="w-5 h-5" />}
            />
            
            {config.filters.rejectLowRating && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4"
              >
                <div className="flex items-center space-x-3">
                  <Star className="w-5 h-5 text-yellow-400" />
                  <span className="text-white text-sm">Calificación mínima:</span>
                  <div className="flex-1">
                    <input
                      type="range"
                      min="1.0"
                      max="5.0"
                      step="0.1"
                      value={config.minRating}
                      onChange={(e) => setConfig(prev => ({ ...prev, minRating: parseFloat(e.target.value) }))}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>1.0</span>
                      <span className="text-yellow-400 font-bold">{config.minRating.toFixed(1)} ⭐</span>
                      <span>5.0</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Configuración de precios - Solo visible si Autobid está activado */}
        {config.autobidEnabled && (
          <div className="space-y-4 mb-8">
            <div className="bg-orange-900 bg-opacity-30 rounded-lg p-4 border border-orange-500">
              <h3 className="text-orange-300 font-semibold mb-4 flex items-center space-x-2">
                <DollarSign className="w-5 h-5" />
                <span>Configuración de Ofertas</span>
              </h3>
              
              <InputField
                label="Precio por KM"
                value={config.pricePerKm}
                onChange={(value) => setConfig(prev => ({ ...prev, pricePerKm: value }))}
                icon="💰"
              />
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                <InputField
                  label="Precio Mínimo"
                  value={config.minPrice}
                  onChange={(value) => setConfig(prev => ({ ...prev, minPrice: value }))}
                  icon="⬇️"
                />
                <InputField
                  label="Precio Máximo"
                  value={config.maxPrice}
                  onChange={(value) => setConfig(prev => ({ ...prev, maxPrice: value }))}
                  icon="⬆️"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <InputField
                  label="Distancia de recogida (KM)"
                  value={config.pickupDistance}
                  onChange={(value) => setConfig(prev => ({ ...prev, pickupDistance: value }))}
                  icon="📍"
                />
                <InputField
                  label="Distancia Máxima (KM)"
                  value={config.maxDistance}
                  onChange={(value) => setConfig(prev => ({ ...prev, maxDistance: value }))}
                  icon="🛣️"
                />
              </div>
            </div>
          </div>
        )}

        {/* Auto-refresh con slider */}
        <div className="mb-8">
          <div className="bg-gray-800 rounded-lg p-4 border border-cyan-500">
            <div className="flex items-center space-x-3">
              <RefreshCw className="w-5 h-5 text-cyan-400" />
              <span className="text-white text-sm">Refresh - Actualizar lista:</span>
              <div className="flex-1">
                <input
                  type="range"
                  min="300"
                  max="1200"
                  step="50"
                  value={config.autoRefresh}
                  onChange={(e) => setConfig(prev => ({ ...prev, autoRefresh: parseInt(e.target.value) }))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>300ms</span>
                  <span className="text-cyan-400 font-bold">{config.autoRefresh}ms</span>
                  <span>1200ms</span>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-2">Actualiza la lista de viajes cada {config.autoRefresh}ms</p>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="space-y-4">
          <motion.button
            onClick={() => setShowPermissions(true)}
            className={`w-full py-4 rounded-lg font-semibold transition-all duration-300 shadow-lg ${
              permissions.every(p => p.granted)
                ? 'bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-500 hover:to-teal-500 text-white'
                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white'
            }`}
            whileTap={{ scale: 0.98 }}
          >
            {permissions.every(p => p.granted) ? '✅ PERMISOS CONFIGURADOS' : '🔐 CONFIGURAR PERMISOS'}
          </motion.button>

          <motion.button
            onClick={saveConfig}
            className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-500 hover:to-teal-500 text-white py-4 rounded-lg font-semibold transition-all duration-300 shadow-lg"
            whileTap={{ scale: 0.98 }}
          >
            💾 GUARDAR CONFIGURACIÓN
          </motion.button>

          <motion.button
            onClick={toggleBot}
            className={`w-full py-4 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg ${
              botActive 
                ? 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white' 
                : 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white'
            }`}
            whileTap={{ scale: 0.98 }}
            animate={botActive ? { boxShadow: ['0 0 20px rgba(234, 88, 12, 0.5)', '0 0 40px rgba(234, 88, 12, 0.8)', '0 0 20px rgba(234, 88, 12, 0.5)'] } : {}}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            {botActive ? <Square className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            <span>{botActive ? '⏹️ DETENER PANTERA BOT' : '▶️ INICIAR PANTERA BOT'}</span>
          </motion.button>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-gray-400 text-sm">
            Pantera Bot v2.0 Pro {isNativeApp ? '📱 Android Native' : '🌐 Web Version'}
          </p>
        </div>
      </div>
    </div>
  );

  const PermissionsModal = () => (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-gradient-to-br from-gray-900 to-orange-900 rounded-xl p-6 w-full max-w-md border border-orange-500 shadow-2xl max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        <h2 className="text-xl font-bold text-white mb-6 text-center">
          🔐 Configurar Permisos {isNativeApp && <span className="text-green-400 text-sm">📱</span>}
        </h2>
        
        <div className="space-y-4 mb-6">
          {permissions.map((permission, index) => (
            <motion.div 
              key={index} 
              className="flex items-center space-x-3 p-4 bg-gray-800 rounded-lg border border-gray-700 hover:border-orange-500 transition-colors cursor-pointer"
              whileHover={{ scale: 1.02 }}
              onClick={() => openSystemSettings(permission)}
            >
              <div className="text-orange-400">
                {permission.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-white font-medium">{permission.name}</h3>
                <p className="text-gray-400 text-sm">{permission.description}</p>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                  permission.granted ? 'bg-green-500' : 'bg-gray-600'
                }`}>
                  {permission.granted && <Check className="w-4 h-4 text-white" />}
                </div>
                <ExternalLink className="w-4 h-4 text-gray-400" />
              </div>
            </motion.div>
          ))}
        </div>

        <div className="space-y-3">
          <button
            onClick={() => setShowPermissions(false)}
            className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-semibold transition-colors"
          >
            Cerrar
          </button>
        </div>

        <div className="mt-4 p-3 bg-blue-900 bg-opacity-30 rounded-lg border border-blue-500">
          <p className="text-blue-200 text-xs text-center">
            {isNativeApp 
              ? "📱 Toca cada permiso para configurarlo automáticamente" 
              : "💡 Toca cada permiso para ver las instrucciones de configuración"}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );

  const InstructionsModal = () => (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-gradient-to-br from-gray-900 to-orange-900 rounded-xl p-6 w-full max-w-md border border-orange-500 shadow-2xl"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        {selectedPermission && (
          <>
            <div className="flex items-center space-x-3 mb-4">
              <div className="text-orange-400">
                {selectedPermission.icon}
              </div>
              <h2 className="text-xl font-bold text-white">{selectedPermission.name}</h2>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4 mb-6">
              <h3 className="text-white font-semibold mb-3">📋 Instrucciones:</h3>
              <div className="text-gray-300 text-sm whitespace-pre-line">
                {selectedPermission.instructions}
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => markPermissionAsGranted(selectedPermission.action)}
                className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-500 hover:to-teal-500 text-white py-3 rounded-lg font-semibold transition-all duration-300"
              >
                ✅ Ya configuré este permiso
              </button>
              
              <button
                onClick={() => {
                  setShowInstructions(false);
                  setSelectedPermission(null);
                }}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-semibold transition-colors"
              >
                Volver
              </button>
            </div>

            <div className="mt-4 p-3 bg-yellow-900 bg-opacity-30 rounded-lg border border-yellow-500">
              <p className="text-yellow-200 text-xs text-center">
                {isNativeApp 
                  ? "📱 La configuración se abrió automáticamente. Configura el permiso y vuelve a la app."
                  : "⚠️ Sigue las instrucciones en tu dispositivo y luego marca como configurado"}
              </p>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );

  const FilterCheckbox: React.FC<{
    label: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    icon?: React.ReactNode;
  }> = ({ label, checked, onChange, icon }) => (
    <div className="flex items-center space-x-3 p-3 bg-gray-800 rounded-lg border border-gray-700 hover:border-orange-500 transition-colors">
      {icon && <div className="text-orange-400">{icon}</div>}
      <div
        onClick={() => onChange(!checked)}
        className={`w-6 h-6 border-2 rounded cursor-pointer flex items-center justify-center transition-all duration-300 ${
          checked 
            ? 'bg-gradient-to-r from-orange-500 to-red-500 border-orange-500 shadow-lg' 
            : 'border-orange-500 bg-transparent hover:bg-orange-500 hover:bg-opacity-20'
        }`}
      >
        {checked && <Check className="w-4 h-4 text-white" />}
      </div>
      <label className="text-white cursor-pointer flex-1" onClick={() => onChange(!checked)}>
        {label}
      </label>
    </div>
  );

  const InputField: React.FC<{
    label: string;
    value: number;
    onChange: (value: number) => void;
    icon?: string;
  }> = ({ label, value, onChange, icon }) => (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <label className="block text-white text-sm mb-2 flex items-center space-x-2">
        {icon && <span>{icon}</span>}
        <span>{label}</span>
      </label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        className="w-full bg-gray-900 border-2 border-orange-500 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-400 transition-colors"
        step="0.1"
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-orange-900 to-black">
      <BotInterface />
      <AnimatePresence>
        {showPermissions && <PermissionsModal />}
        {showInstructions && <InstructionsModal />}
      </AnimatePresence>
    </div>
  );
};

export default App;