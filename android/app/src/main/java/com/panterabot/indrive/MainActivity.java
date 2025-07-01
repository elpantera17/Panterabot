package com.panterabot.indrive;

import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.provider.Settings;
import android.widget.Toast;

import com.getcapacitor.BridgeActivity;
import com.getcapacitor.Plugin;

import java.util.ArrayList;

public class MainActivity extends BridgeActivity {
    
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Registrar plugins personalizados para automatización
        this.init(savedInstanceState, new ArrayList<Class<? extends Plugin>>() {{
            // Plugins de Capacitor para funciones automáticas
            add(com.capacitorjs.plugins.app.AppPlugin.class);
            add(com.capacitorjs.plugins.device.DevicePlugin.class);
            add(com.capacitorjs.plugins.geolocation.GeolocationPlugin.class);
            add(com.capacitorjs.plugins.localnotifications.LocalNotificationsPlugin.class);
        }});
        
        // Verificar permisos críticos al iniciar
        checkCriticalPermissions();
        
        // Iniciar servicio automático
        startAutomaticService();
    }
    
    private void checkCriticalPermissions() {
        // Verificar si el servicio de accesibilidad está habilitado
        if (!isAccessibilityServiceEnabled()) {
            showAccessibilityDialog();
        }
        
        // Verificar permiso de overlay
        if (!Settings.canDrawOverlays(this)) {
            showOverlayPermissionDialog();
        }
    }
    
    private void startAutomaticService() {
        // Iniciar el servicio automático en segundo plano
        Intent serviceIntent = new Intent(this, BotBackgroundService.class);
        startForegroundService(serviceIntent);
        
        Toast.makeText(this, 
            "🤖 Pantera Bot Automático iniciado en segundo plano", 
            Toast.LENGTH_LONG).show();
    }
    
    private boolean isAccessibilityServiceEnabled() {
        String service = getPackageName() + "/" + InDriveAccessibilityService.class.getCanonicalName();
        String enabledServices = Settings.Secure.getString(
            getContentResolver(),
            Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES
        );
        
        return enabledServices != null && enabledServices.contains(service);
    }
    
    private void showAccessibilityDialog() {
        Toast.makeText(this, 
            "⚠️ Activa el servicio de accesibilidad para automatización completa", 
            Toast.LENGTH_LONG).show();
    }
    
    private void showOverlayPermissionDialog() {
        Toast.makeText(this, 
            "⚠️ Permite mostrar sobre otras apps para funcionamiento automático", 
            Toast.LENGTH_LONG).show();
    }
    
    @Override
    protected void onResume() {
        super.onResume();
        
        // Verificar si inDrive está instalado
        if (!isInDriveInstalled()) {
            Toast.makeText(this, 
                "📱 inDrive no está instalado. Instálalo para usar el bot automático", 
                Toast.LENGTH_LONG).show();
        }
    }
    
    private boolean isInDriveInstalled() {
        try {
            getPackageManager().getPackageInfo("sinet.startup.inDriver", 0);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
    
    public void openAccessibilitySettings() {
        Intent intent = new Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS);
        startActivity(intent);
    }
    
    public void openOverlaySettings() {
        Intent intent = new Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION);
        intent.setData(Uri.parse("package:" + getPackageName()));
        startActivity(intent);
    }
}