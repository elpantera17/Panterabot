package com.panterabot.indrive;

import android.accessibilityservice.AccessibilityService;
import android.accessibilityservice.AccessibilityServiceInfo;
import android.content.Intent;
import android.util.Log;
import android.view.accessibility.AccessibilityEvent;
import android.view.accessibility.AccessibilityNodeInfo;

public class InDriveAccessibilityService extends AccessibilityService {
    private static final String TAG = "PanteraBot_Accessibility";
    private static final String INDRIVE_PACKAGE = "sinet.startup.inDriver";
    
    private boolean isMonitoring = false;

    @Override
    public void onServiceConnected() {
        super.onServiceConnected();
        Log.d(TAG, "🔍 Servicio de Accesibilidad conectado");
        
        // Configurar el servicio
        AccessibilityServiceInfo info = new AccessibilityServiceInfo();
        info.eventTypes = AccessibilityEvent.TYPE_WINDOW_CONTENT_CHANGED |
                         AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED |
                         AccessibilityEvent.TYPE_VIEW_CLICKED;
        info.feedbackType = AccessibilityServiceInfo.FEEDBACK_GENERIC;
        info.flags = AccessibilityServiceInfo.FLAG_REPORT_VIEW_IDS |
                    AccessibilityServiceInfo.FLAG_RETRIEVE_INTERACTIVE_WINDOWS;
        info.packageNames = new String[]{INDRIVE_PACKAGE};
        
        setServiceInfo(info);
        isMonitoring = true;
        
        Log.d(TAG, "✅ Configuración completada - Monitoreando inDrive");
    }

    @Override
    public void onAccessibilityEvent(AccessibilityEvent event) {
        if (!isMonitoring) return;
        
        String packageName = event.getPackageName() != null ? event.getPackageName().toString() : "";
        
        // Solo procesar eventos de inDrive
        if (!INDRIVE_PACKAGE.equals(packageName)) {
            return;
        }

        Log.d(TAG, "📱 Evento detectado en inDrive: " + event.getEventType());
        
        try {
            switch (event.getEventType()) {
                case AccessibilityEvent.TYPE_WINDOW_CONTENT_CHANGED:
                    analyzeInDriveScreen();
                    break;
                    
                case AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED:
                    Log.d(TAG, "🔄 Pantalla de inDrive cambió");
                    break;
                    
                case AccessibilityEvent.TYPE_VIEW_CLICKED:
                    Log.d(TAG, "👆 Click detectado en inDrive");
                    break;
            }
        } catch (Exception e) {
            Log.e(TAG, "❌ Error procesando evento: " + e.getMessage());
        }
    }

    @Override
    public void onInterrupt() {
        Log.d(TAG, "⚠️ Servicio de accesibilidad interrumpido");
        isMonitoring = false;
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        isMonitoring = false;
        Log.d(TAG, "🛑 Servicio de accesibilidad destruido");
    }

    private void analyzeInDriveScreen() {
        try {
            AccessibilityNodeInfo rootNode = getRootInActiveWindow();
            if (rootNode == null) {
                return;
            }

            Log.d(TAG, "🔍 Analizando pantalla de inDrive...");
            
            // Buscar elementos de viajes
            findTripElements(rootNode);
            
            rootNode.recycle();
            
        } catch (Exception e) {
            Log.e(TAG, "❌ Error analizando pantalla: " + e.getMessage());
        }
    }

    private void findTripElements(AccessibilityNodeInfo node) {
        if (node == null) return;
        
        try {
            // Buscar textos que indiquen viajes disponibles
            CharSequence text = node.getText();
            if (text != null) {
                String textStr = text.toString().toLowerCase();
                
                // Detectar elementos relacionados con viajes
                if (textStr.contains("km") || 
                    textStr.contains("$") || 
                    textStr.contains("precio") ||
                    textStr.contains("destino")) {
                    
                    Log.d(TAG, "🚗 Posible viaje detectado: " + textStr);
                    
                    // Aquí se implementaría la lógica para extraer
                    // información del viaje y decidir si ofertar
                    processDetectedTrip(textStr, node);
                }
            }
            
            // Buscar recursivamente en nodos hijos
            for (int i = 0; i < node.getChildCount(); i++) {
                AccessibilityNodeInfo child = node.getChild(i);
                if (child != null) {
                    findTripElements(child);
                    child.recycle();
                }
            }
            
        } catch (Exception e) {
            Log.e(TAG, "❌ Error buscando elementos: " + e.getMessage());
        }
    }

    private void processDetectedTrip(String tripText, AccessibilityNodeInfo node) {
        Log.d(TAG, "💰 Procesando viaje detectado: " + tripText);
        
        try {
            // Aquí se implementaría la lógica para:
            // 1. Extraer información del viaje (distancia, precio, etc.)
            // 2. Aplicar filtros configurados
            // 3. Calcular precio de oferta
            // 4. Hacer clic automáticamente si cumple criterios
            
            // Por ahora solo notificar
            BotBackgroundService.showNotification(
                this,
                "🚗 Viaje Detectado",
                "Nuevo viaje encontrado: " + tripText
            );
            
        } catch (Exception e) {
            Log.e(TAG, "❌ Error procesando viaje: " + e.getMessage());
        }
    }

    // Método para hacer clic automático en elementos
    private boolean performClick(AccessibilityNodeInfo node) {
        if (node == null) return false;
        
        try {
            if (node.isClickable()) {
                return node.performAction(AccessibilityNodeInfo.ACTION_CLICK);
            }
            
            // Si no es clickeable, buscar padre clickeable
            AccessibilityNodeInfo parent = node.getParent();
            if (parent != null) {
                boolean result = performClick(parent);
                parent.recycle();
                return result;
            }
            
        } catch (Exception e) {
            Log.e(TAG, "❌ Error haciendo clic: " + e.getMessage());
        }
        
        return false;
    }
}