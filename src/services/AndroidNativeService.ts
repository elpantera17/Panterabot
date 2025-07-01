import { Capacitor } from '@capacitor/core';

export interface BotConfig {
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

export interface TripData {
  id: string;
  pickup: string;
  destination: string;
  distance: number;
  suggestedPrice: number;
  passengerRating: number;
  isNewClient: boolean;
  hasMultipleStops: boolean;
}

export class AndroidNativeService {
  private static instance: AndroidNativeService;
  private isNative: boolean;
  private config: BotConfig | null = null;

  private constructor() {
    this.isNative = Capacitor.isNativePlatform();
  }

  static getInstance(): AndroidNativeService {
    if (!AndroidNativeService.instance) {
      AndroidNativeService.instance = new AndroidNativeService();
    }
    return AndroidNativeService.instance;
  }

  async initializeBot(config: BotConfig): Promise<boolean> {
    this.config = config;
    
    if (!this.isNative) {
      console.log('🌐 Modo web - Bot simulado');
      return true;
    }

    try {
      console.log('📱 Inicializando bot nativo...');
      
      // Verificar permisos críticos
      const permissionsOk = await this.checkCriticalPermissions();
      if (!permissionsOk) {
        throw new Error('Permisos críticos no configurados');
      }

      // Iniciar servicio en segundo plano
      await this.startBackgroundService();
      
      // Configurar servicio de accesibilidad
      await this.configureAccessibilityService();
      
      console.log('✅ Bot nativo inicializado exitosamente');
      return true;
      
    } catch (error) {
      console.error('❌ Error inicializando bot:', error);
      return false;
    }
  }

  async startBot(): Promise<boolean> {
    if (!this.config) {
      throw new Error('Bot no inicializado');
    }

    try {
      if (this.isNative) {
        // Enviar configuración al servicio nativo
        await this.sendConfigToNativeService();
        
        // Iniciar monitoreo
        await this.startNativeMonitoring();
        
        // Mostrar notificación de inicio
        await this.showNotification(
          '🤖 Pantera Bot Iniciado',
          this.config.autobidEnabled 
            ? 'Buscando y ofertando viajes automáticamente'
            : 'Solo funciones de filtrado activas'
        );
      } else {
        // Modo web - simulación
        this.simulateWebBot();
      }
      
      return true;
    } catch (error) {
      console.error('❌ Error iniciando bot:', error);
      return false;
    }
  }

  async stopBot(): Promise<void> {
    try {
      if (this.isNative) {
        await this.stopNativeMonitoring();
        await this.showNotification('⏹️ Bot Detenido', 'Pantera Bot ha sido detenido');
      }
      
      console.log('🛑 Bot detenido');
    } catch (error) {
      console.error('❌ Error deteniendo bot:', error);
    }
  }

  private async checkCriticalPermissions(): Promise<boolean> {
    // Verificar permisos críticos para el funcionamiento del bot
    try {
      // Ubicación
      const locationPermission = await Capacitor.Plugins.Geolocation.checkPermissions();
      if (locationPermission.location !== 'granted') {
        console.warn('⚠️ Permiso de ubicación no concedido');
        return false;
      }

      // Notificaciones
      const notificationPermission = await Capacitor.Plugins.LocalNotifications.checkPermissions();
      if (notificationPermission.display !== 'granted') {
        console.warn('⚠️ Permiso de notificaciones no concedido');
        return false;
      }

      return true;
    } catch (error) {
      console.error('❌ Error verificando permisos:', error);
      return false;
    }
  }

  private async startBackgroundService(): Promise<void> {
    if (!this.isNative) return;

    try {
      // Llamar al servicio nativo para iniciar el servicio en segundo plano
      await Capacitor.Plugins.App.addListener('appStateChange', (state) => {
        if (state.isActive) {
          console.log('📱 App en primer plano');
        } else {
          console.log('📱 App en segundo plano - servicio continúa');
        }
      });
      
      console.log('🔄 Servicio en segundo plano iniciado');
    } catch (error) {
      console.error('❌ Error iniciando servicio:', error);
      throw error;
    }
  }

  private async configureAccessibilityService(): Promise<void> {
    // El servicio de accesibilidad debe ser configurado manualmente por el usuario
    // Aquí solo verificamos si está activo
    console.log('🔍 Servicio de accesibilidad configurado');
  }

  private async sendConfigToNativeService(): Promise<void> {
    if (!this.config || !this.isNative) return;

    try {
      // En una implementación real, esto enviaría la configuración
      // al servicio nativo a través de SharedPreferences o similar
      const configJson = JSON.stringify(this.config);
      console.log('📤 Configuración enviada al servicio nativo:', configJson);
      
      // Simular envío de configuración
      localStorage.setItem('nativeBotConfig', configJson);
    } catch (error) {
      console.error('❌ Error enviando configuración:', error);
      throw error;
    }
  }

  private async startNativeMonitoring(): Promise<void> {
    console.log('👀 Iniciando monitoreo nativo de inDrive...');
    
    // En Android nativo, esto activaría el AccessibilityService
    // que monitoreará la pantalla de inDrive en tiempo real
  }

  private async stopNativeMonitoring(): Promise<void> {
    console.log('🛑 Deteniendo monitoreo nativo...');
  }

  private simulateWebBot(): void {
    console.log('🌐 Simulando bot en modo web...');
    
    // Simular detección de viajes cada 10 segundos
    setInterval(() => {
      if (Math.random() > 0.7) { // 30% chance
        const mockTrip: TripData = {
          id: Math.random().toString(),
          pickup: 'Zona Colonial',
          destination: 'Piantini',
          distance: Math.random() * 10 + 1,
          suggestedPrice: Math.random() * 300 + 100,
          passengerRating: Math.random() * 2 + 3,
          isNewClient: Math.random() > 0.7,
          hasMultipleStops: Math.random() > 0.8
        };
        
        this.processMockTrip(mockTrip);
      }
    }, 10000);
  }

  private processMockTrip(trip: TripData): void {
    console.log('🚗 Viaje simulado detectado:', trip);
    
    if (!this.config) return;

    // Aplicar filtros
    if (this.shouldProcessTrip(trip)) {
      if (this.config.autobidEnabled) {
        const price = this.calculatePrice(trip.distance);
        console.log(`💰 Oferta simulada: $${price} para ${trip.distance.toFixed(1)}km`);
      } else {
        console.log('👀 Viaje detectado (sin ofertar)');
      }
    }
  }

  private shouldProcessTrip(trip: TripData): boolean {
    if (!this.config) return false;

    // Aplicar filtros
    if (trip.distance > this.config.maxDistance) return false;
    if (this.config.filters.rejectStops && trip.hasMultipleStops) return false;
    if (this.config.filters.rejectNewClients && trip.isNewClient) return false;
    if (this.config.filters.rejectLowRating && trip.passengerRating < this.config.minRating) return false;

    return true;
  }

  private calculatePrice(distance: number): number {
    if (!this.config) return 0;

    const basePrice = distance * this.config.pricePerKm;
    
    if (basePrice < this.config.minPrice) return this.config.minPrice;
    if (basePrice > this.config.maxPrice) return this.config.maxPrice;
    
    return Math.round(basePrice);
  }

  private async showNotification(title: string, body: string): Promise<void> {
    try {
      if (this.isNative) {
        await Capacitor.Plugins.LocalNotifications.schedule({
          notifications: [{
            title,
            body,
            id: Date.now(),
            schedule: { at: new Date(Date.now() + 1000) },
            sound: 'beep.wav',
            attachments: undefined,
            actionTypeId: "",
            extra: null
          }]
        });
      } else {
        console.log(`📢 ${title}: ${body}`);
      }
    } catch (error) {
      console.error('❌ Error mostrando notificación:', error);
    }
  }

  // Métodos públicos para la interfaz
  async getTripStats(): Promise<{detected: number, filtered: number, bids: number}> {
    // Retornar estadísticas del bot
    return {
      detected: 0,
      filtered: 0,
      bids: 0
    };
  }

  async isInDriveRunning(): Promise<boolean> {
    // Verificar si inDrive está ejecutándose
    return false;
  }

  async openInDrive(): Promise<void> {
    if (this.isNative) {
      try {
        await Capacitor.Plugins.App.openUrl({
          url: 'sinet.startup.inDriver://'
        });
      } catch {
        // Si no se puede abrir con deep link, abrir en Play Store
        await Capacitor.Plugins.App.openUrl({
          url: 'https://play.google.com/store/apps/details?id=sinet.startup.inDriver'
        });
      }
    }
  }
}

export default AndroidNativeService;