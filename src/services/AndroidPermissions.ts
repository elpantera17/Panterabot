import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Device } from '@capacitor/device';

export class AndroidPermissions {
  static async requestLocationPermission(): Promise<boolean> {
    try {
      if (!Capacitor.isNativePlatform()) {
        console.log('No es plataforma nativa');
        return false;
      }

      const permissions = await Geolocation.requestPermissions();
      return permissions.location === 'granted';
    } catch (error) {
      console.error('Error requesting location permission:', error);
      return false;
    }
  }

  static async requestNotificationPermission(): Promise<boolean> {
    try {
      if (!Capacitor.isNativePlatform()) {
        return false;
      }

      const permissions = await LocalNotifications.requestPermissions();
      return permissions.display === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  static async openAccessibilitySettings(): Promise<void> {
    try {
      if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android') {
        // Usar plugin nativo para abrir configuración de accesibilidad
        await Capacitor.Plugins.App.openUrl({
          url: 'android.settings.ACCESSIBILITY_SETTINGS'
        });
      }
    } catch (error) {
      console.error('Error opening accessibility settings:', error);
    }
  }

  static async openLocationSettings(): Promise<void> {
    try {
      if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android') {
        await Capacitor.Plugins.App.openUrl({
          url: 'android.settings.LOCATION_SOURCE_SETTINGS'
        });
      }
    } catch (error) {
      console.error('Error opening location settings:', error);
    }
  }

  static async openNotificationSettings(): Promise<void> {
    try {
      if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android') {
        const info = await Device.getInfo();
        await Capacitor.Plugins.App.openUrl({
          url: `android.settings.APP_NOTIFICATION_SETTINGS?package=${info.name}`
        });
      }
    } catch (error) {
      console.error('Error opening notification settings:', error);
    }
  }

  static async openOverlaySettings(): Promise<void> {
    try {
      if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android') {
        const info = await Device.getInfo();
        await Capacitor.Plugins.App.openUrl({
          url: `android.settings.action.MANAGE_OVERLAY_PERMISSION?package=${info.name}`
        });
      }
    } catch (error) {
      console.error('Error opening overlay settings:', error);
    }
  }

  static async openBatteryOptimizationSettings(): Promise<void> {
    try {
      if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android') {
        await Capacitor.Plugins.App.openUrl({
          url: 'android.settings.IGNORE_BATTERY_OPTIMIZATION_SETTINGS'
        });
      }
    } catch (error) {
      console.error('Error opening battery settings:', error);
    }
  }

  static async checkPermissions(): Promise<{[key: string]: boolean}> {
    const results: {[key: string]: boolean} = {};

    try {
      // Verificar ubicación
      const locationStatus = await Geolocation.checkPermissions();
      results.location = locationStatus.location === 'granted';

      // Verificar notificaciones
      const notificationStatus = await LocalNotifications.checkPermissions();
      results.notifications = notificationStatus.display === 'granted';

      // Los otros permisos (accesibilidad, overlay, batería) son más complejos de verificar
      // Por ahora los marcamos como false hasta que el usuario los configure manualmente
      results.accessibility = false;
      results.overlay = false;
      results.background = false;

    } catch (error) {
      console.error('Error checking permissions:', error);
    }

    return results;
  }

  static async showNotification(title: string, body: string): Promise<void> {
    try {
      if (!Capacitor.isNativePlatform()) {
        return;
      }

      await LocalNotifications.schedule({
        notifications: [
          {
            title,
            body,
            id: Date.now(),
            schedule: { at: new Date(Date.now() + 1000) },
            sound: 'beep.wav',
            attachments: undefined,
            actionTypeId: "",
            extra: null
          }
        ]
      });
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }
}