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
        
        // Registrar plugins personalizados
        this.init(savedInstanceState, new ArrayList<Class<? extends Plugin>>() {{
            // Aquí se pueden agregar plugins personalizados si es necesario
        }});
        
        // Verificar permisos críticos al iniciar
        checkCriticalPermissions();
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
            "⚠️ Activa el servicio de accesibilidad para que Pantera Bot funcione", 
            Toast.LENGTH_LONG).show();
    }
    
    private void showOverlayPermissionDialog() {
        Toast.makeText(this, 
            "⚠️ Permite mostrar sobre otras apps para que el bot funcione correctamente", 
            Toast.LENGTH_LONG).show();
    }
    
    @Override
    protected void onResume() {
        super.onResume();
        
        // Verificar si inDrive está instalado
        if (!isInDriveInstalled()) {
            Toast.makeText(this, 
                "📱 inDrive no está instalado. Instálalo para usar Pantera Bot", 
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