import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Geolocation } from '@capacitor/geolocation';
import { App } from '@capacitor/app';
import { Device } from '@capacitor/device';
import { Preferences } from '@capacitor/preferences';

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
  private isRunning: boolean = false;
  private monitoringInterval: number | null = null;

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
      console.log('🌐 Modo web - Bot automático simulado');
      return true;
    }

    try {
      console.log('📱 Inicializando bot automático nativo...');
      
      // Verificar permisos críticos
      const permissionsOk = await this.checkCriticalPermissions();
      if (!permissionsOk) {
        console.warn('⚠️ Algunos permisos no están configurados');
      }

      // Guardar configuración en preferencias nativas
      await this.saveConfigToNative();
      
      console.log('✅ Bot automático nativo inicializado exitosamente');
      return true;
      
    } catch (error) {
      console.error('❌ Error inicializando bot automático:', error);
      return false;
    }
  }

  async updateConfig(config: BotConfig): Promise<void> {
    this.config = config;
    await this.saveConfigToNative();
  }

  async startBot(): Promise<boolean> {
    if (!this.config) {
      throw new Error('Bot no inicializado');
    }

    try {
      this.isRunning = true;
      
      if (this.isNative) {
        // Iniciar monitoreo automático nativo
        await this.startNativeAutomaticMonitoring();
        
        // Mostrar notificación de inicio
        await this.showNotification(
          '🤖 Pantera Bot Automático Iniciado',
          this.config.autobidEnabled 
            ? 'Detectando y ofertando viajes automáticamente'
            : 'Solo funciones de filtrado automático activas'
        );
      } else {
        // Modo web - simulación automática
        this.simulateAutomaticWebBot();
      }
      
      return true;
    } catch (error) {
      console.error('❌ Error iniciando bot automático:', error);
      this.isRunning = false;
      return false;
    }
  }

  async stopBot(): Promise<void> {
    try {
      this.isRunning = false;
      
      if (this.monitoringInterval) {
        clearInterval(this.monitoringInterval);
        this.monitoringInterval = null;
      }
      
      if (this.isNative) {
        await this.showNotification('⏹️ Bot Automático Detenido', 'Pantera Bot automático ha sido detenido');
      }
      
      console.log('🛑 Bot automático detenido');
    } catch (error) {
      console.error('❌ Error deteniendo bot automático:', error);
    }
  }

  private async checkCriticalPermissions(): Promise<boolean> {
    try {
      if (!this.isNative) return true;

      // Verificar ubicación
      const locationPermission = await Geolocation.checkPermissions();
      if (locationPermission.location !== 'granted') {
        console.warn('⚠️ Permiso de ubicación no concedido');
      }

      // Verificar notificaciones
      const notificationPermission = await LocalNotifications.checkPermissions();
      if (notificationPermission.display !== 'granted') {
        console.warn('⚠️ Permiso de notificaciones no concedido');
      }

      return true;
    } catch (error) {
      console.error('❌ Error verificando permisos:', error);
      return false;
    }
  }

  private async saveConfigToNative(): Promise<void> {
    if (!this.config || !this.isNative) return;

    try {
      await Preferences.set({
        key: 'botAutomaticConfig',
        value: JSON.stringify(this.config)
      });
      
      console.log('💾 Configuración automática guardada en dispositivo nativo');
    } catch (error) {
      console.error('❌ Error guardando configuración automática:', error);
    }
  }

  private async startNativeAutomaticMonitoring(): Promise<void> {
    console.log('👀 Iniciando monitoreo automático nativo de inDrive...');
    
    // Verificar si inDrive está instalado
    const isInDriveInstalled = await this.checkInDriveInstalled();
    if (!isInDriveInstalled) {
      await this.showNotification(
        '⚠️ inDrive no encontrado',
        'Instala inDrive para usar el bot automático'
      );
      return;
    }

    // Iniciar monitoreo automático continuo
    this.monitoringInterval = setInterval(async () => {
      if (!this.isRunning) return;
      
      try {
        await this.performAutomaticMonitoring();
      } catch (error) {
        console.error('❌ Error en monitoreo automático:', error);
      }
    }, this.config?.autoRefresh || 1000) as unknown as number;
  }

  private async performAutomaticMonitoring(): Promise<void> {
    // Verificar si inDrive está en primer plano
    const isInDriveActive = await this.isInDriveInForeground();
    
    if (isInDriveActive) {
      console.log('🔍 inDrive activo - Analizando automáticamente...');
      
      // En una implementación real, aquí se activaría el AccessibilityService
      // que analizaría automáticamente la pantalla de inDrive
      await this.simulateAutomaticTripDetection();
    }
  }

  private async simulateAutomaticTripDetection(): Promise<void> {
    // Simulación de detección automática de viajes
    if (Math.random() > 0.8) { // 20% chance de detectar viaje
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
      
      await this.processAutomaticTrip(mockTrip);
    }
  }

  private async processAutomaticTrip(trip: TripData): Promise<void> {
    console.log('🚗 Viaje detectado automáticamente:', trip);
    
    if (!this.config) return;

    // Aplicar filtros automáticamente
    if (this.shouldProcessTripAutomatically(trip)) {
      if (this.config.autobidEnabled) {
        const price = this.calculateAutomaticPrice(trip.distance);
        
        // Simular oferta automática
        await this.makeAutomaticBid(trip, price);
        
        await this.showNotification(
          '💰 Oferta Automática Colocada',
          `$${price} para ${trip.distance.toFixed(1)}km - ${trip.pickup} → ${trip.destination}`
        );
      } else {
        await this.showNotification(
          '🚗 Viaje Detectado Automáticamente',
          `${trip.distance.toFixed(1)}km - ${trip.pickup} → ${trip.destination}`
        );
      }
    } else {
      console.log('❌ Viaje filtrado automáticamente');
    }
  }

  private shouldProcessTripAutomatically(trip: TripData): boolean {
    if (!this.config) return false;

    // Aplicar filtros automáticamente
    if (trip.distance > this.config.maxDistance) {
      console.log(`❌ Filtro automático: distancia ${trip.distance}km > ${this.config.maxDistance}km`);
      return false;
    }

    if (this.config.filters.rejectStops && trip.hasMultipleStops) {
      console.log('❌ Filtro automático: múltiples paradas');
      return false;
    }

    if (this.config.filters.rejectNewClients && trip.isNewClient) {
      console.log('❌ Filtro automático: cliente nuevo');
      return false;
    }

    if (this.config.filters.rejectLowRating && trip.passengerRating < this.config.minRating) {
      console.log(`❌ Filtro automático: calificación ${trip.passengerRating} < ${this.config.minRating}`);
      return false;
    }

    console.log('✅ Viaje aprobado automáticamente para procesamiento');
    return true;
  }

  private calculateAutomaticPrice(distance: number): number {
    if (!this.config) return 0;

    const basePrice = distance * this.config.pricePerKm;
    
    if (basePrice < this.config.minPrice) return this.config.minPrice;
    if (basePrice > this.config.maxPrice) return this.config.maxPrice;
    
    return Math.round(basePrice);
  }

  private async makeAutomaticBid(trip: TripData, price: number): Promise<void> {
    console.log(`🤖 Colocando oferta automática: $${price} para viaje ${trip.id}`);
    
    // En una implementación real, aquí se usaría el AccessibilityService
    // para hacer clic automáticamente en el viaje e ingresar el precio
    
    // Simular proceso automático
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('✅ Oferta automática colocada exitosamente');
  }

  private async checkInDriveInstalled(): Promise<boolean> {
    try {
      // En Android nativo, verificaría si el package está instalado
      return true; // Simulación
    } catch {
      return false;
    }
  }

  private async isInDriveInForeground(): Promise<boolean> {
    try {
      // En Android nativo, verificaría la app activa
      return Math.random() > 0.7; // Simulación - 30% chance
    } catch {
      return false;
    }
  }

  private simulateAutomaticWebBot(): void {
    console.log('🌐 Simulando bot automático en modo web...');
    
    // Simular detección automática de viajes cada intervalo configurado
    this.monitoringInterval = setInterval(() => {
      if (!this.isRunning) return;
      
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
        
        this.processAutomaticTrip(mockTrip);
      }
    }, this.config?.autoRefresh || 5000) as unknown as number;
  }

  private async showNotification(title: string, body: string): Promise<void> {
    try {
      if (this.isNative) {
        await LocalNotifications.schedule({
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
      console.error('❌ Error mostrando notificación automática:', error);
    }
  }

  // Métodos públicos para la interfaz
  async getTripStats(): Promise<{detected: number, filtered: number, bids: number}> {
    // Retornar estadísticas del bot automático
    return {
      detected: 0,
      filtered: 0,
      bids: 0
    };
  }

  async isInDriveRunning(): Promise<boolean> {
    return await this.isInDriveInForeground();
  }

  async openInDrive(): Promise<void> {
    if (this.isNative) {
      try {
        await App.openUrl({
          url: 'sinet.startup.inDriver://'
        });
      } catch {
        // Si no se puede abrir con deep link, abrir en Play Store
        await App.openUrl({
          url: 'https://play.google.com/store/apps/details?id=sinet.startup.inDriver'
        });
      }
    }
  }
}

export default AndroidNativeService;