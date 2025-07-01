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
    private boolean autobidEnabled = true;

    @Override
    public void onServiceConnected() {
        super.onServiceConnected();
        Log.d(TAG, "🔍 Servicio de Accesibilidad AUTOMÁTICO conectado");
        
        // Configurar el servicio para automatización completa
        AccessibilityServiceInfo info = new AccessibilityServiceInfo();
        info.eventTypes = AccessibilityEvent.TYPE_WINDOW_CONTENT_CHANGED |
                         AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED |
                         AccessibilityEvent.TYPE_VIEW_CLICKED |
                         AccessibilityEvent.TYPE_VIEW_TEXT_CHANGED;
        info.feedbackType = AccessibilityServiceInfo.FEEDBACK_GENERIC;
        info.flags = AccessibilityServiceInfo.FLAG_REPORT_VIEW_IDS |
                    AccessibilityServiceInfo.FLAG_RETRIEVE_INTERACTIVE_WINDOWS |
                    AccessibilityServiceInfo.FLAG_REQUEST_ENHANCED_WEB_ACCESSIBILITY;
        info.packageNames = new String[]{INDRIVE_PACKAGE};
        
        setServiceInfo(info);
        isMonitoring = true;
        
        Log.d(TAG, "✅ Configuración AUTOMÁTICA completada - Monitoreando inDrive");
        
        // Notificar que el servicio automático está activo
        BotBackgroundService.showNotification(
            this,
            "🤖 Bot Automático Activo",
            "Detectando y ofertando viajes automáticamente"
        );
    }

    @Override
    public void onAccessibilityEvent(AccessibilityEvent event) {
        if (!isMonitoring) return;
        
        String packageName = event.getPackageName() != null ? event.getPackageName().toString() : "";
        
        // Solo procesar eventos de inDrive
        if (!INDRIVE_PACKAGE.equals(packageName)) {
            return;
        }

        Log.d(TAG, "📱 Evento AUTOMÁTICO detectado en inDrive: " + event.getEventType());
        
        try {
            switch (event.getEventType()) {
                case AccessibilityEvent.TYPE_WINDOW_CONTENT_CHANGED:
                    // Analizar automáticamente la pantalla de inDrive
                    analyzeInDriveScreenAutomatically();
                    break;
                    
                case AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED:
                    Log.d(TAG, "🔄 Pantalla de inDrive cambió - Analizando automáticamente");
                    analyzeInDriveScreenAutomatically();
                    break;
                    
                case AccessibilityEvent.TYPE_VIEW_CLICKED:
                    Log.d(TAG, "👆 Click detectado en inDrive");
                    break;
            }
        } catch (Exception e) {
            Log.e(TAG, "❌ Error procesando evento automático: " + e.getMessage());
        }
    }

    @Override
    public void onInterrupt() {
        Log.d(TAG, "⚠️ Servicio de accesibilidad automático interrumpido");
        isMonitoring = false;
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        isMonitoring = false;
        Log.d(TAG, "🛑 Servicio de accesibilidad automático destruido");
    }

    private void analyzeInDriveScreenAutomatically() {
        try {
            AccessibilityNodeInfo rootNode = getRootInActiveWindow();
            if (rootNode == null) {
                return;
            }

            Log.d(TAG, "🔍 Analizando pantalla de inDrive AUTOMÁTICAMENTE...");
            
            // Buscar elementos de viajes automáticamente
            findAndProcessTripsAutomatically(rootNode);
            
            rootNode.recycle();
            
        } catch (Exception e) {
            Log.e(TAG, "❌ Error analizando pantalla automáticamente: " + e.getMessage());
        }
    }

    private void findAndProcessTripsAutomatically(AccessibilityNodeInfo node) {
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
                    textStr.contains("destino") ||
                    textStr.contains("pickup") ||
                    textStr.contains("recoger")) {
                    
                    Log.d(TAG, "🚗 Viaje detectado AUTOMÁTICAMENTE: " + textStr);
                    
                    // Procesar automáticamente el viaje detectado
                    processDetectedTripAutomatically(textStr, node);
                }
            }
            
            // Buscar recursivamente en nodos hijos
            for (int i = 0; i < node.getChildCount(); i++) {
                AccessibilityNodeInfo child = node.getChild(i);
                if (child != null) {
                    findAndProcessTripsAutomatically(child);
                    child.recycle();
                }
            }
            
        } catch (Exception e) {
            Log.e(TAG, "❌ Error buscando elementos automáticamente: " + e.getMessage());
        }
    }

    private void processDetectedTripAutomatically(String tripText, AccessibilityNodeInfo node) {
        Log.d(TAG, "💰 Procesando viaje AUTOMÁTICAMENTE: " + tripText);
        
        try {
            // Extraer información del viaje automáticamente
            TripInfo tripInfo = extractTripInfo(tripText);
            
            // Aplicar filtros automáticamente
            if (shouldProcessTrip(tripInfo)) {
                
                if (autobidEnabled) {
                    // Hacer oferta automática
                    makeAutomaticBid(tripInfo, node);
                } else {
                    // Solo notificar del viaje encontrado
                    BotBackgroundService.showNotification(
                        this,
                        "🚗 Viaje Detectado",
                        "Nuevo viaje encontrado: " + tripText
                    );
                }
            } else {
                Log.d(TAG, "❌ Viaje filtrado automáticamente");
            }
            
        } catch (Exception e) {
            Log.e(TAG, "❌ Error procesando viaje automáticamente: " + e.getMessage());
        }
    }

    private TripInfo extractTripInfo(String tripText) {
        // Extraer información del viaje usando regex y análisis de texto
        TripInfo info = new TripInfo();
        
        // Buscar distancia (ej: "5.2 km", "3km")
        if (tripText.matches(".*\\d+\\.?\\d*\\s*km.*")) {
            // Extraer distancia
            info.distance = 5.0; // Placeholder - implementar regex real
        }
        
        // Buscar precio (ej: "$200", "200 pesos")
        if (tripText.matches(".*\\$\\d+.*") || tripText.matches(".*\\d+\\s*peso.*")) {
            // Extraer precio sugerido
            info.suggestedPrice = 200; // Placeholder - implementar regex real
        }
        
        return info;
    }

    private boolean shouldProcessTrip(TripInfo tripInfo) {
        // Aplicar filtros configurados
        // Por ahora aceptar todos los viajes
        return true;
    }

    private void makeAutomaticBid(TripInfo tripInfo, AccessibilityNodeInfo node) {
        Log.d(TAG, "🤖 Haciendo oferta AUTOMÁTICA...");
        
        try {
            // Calcular precio automáticamente
            int bidPrice = calculateBidPrice(tripInfo);
            
            // Hacer clic automático en el viaje
            if (performAutomaticClick(node)) {
                Log.d(TAG, "✅ Click automático realizado");
                
                // Esperar un momento para que cargue la pantalla
                Thread.sleep(1000);
                
                // Buscar campo de precio e ingresar oferta
                enterBidAutomatically(bidPrice);
                
                // Confirmar oferta automáticamente
                confirmBidAutomatically();
                
                // Notificar éxito
                BotBackgroundService.showNotification(
                    this,
                    "💰 Oferta Automática Colocada",
                    "Oferta de $" + bidPrice + " colocada automáticamente"
                );
                
            } else {
                Log.w(TAG, "⚠️ No se pudo hacer click automático");
            }
            
        } catch (Exception e) {
            Log.e(TAG, "❌ Error haciendo oferta automática: " + e.getMessage());
        }
    }

    private int calculateBidPrice(TripInfo tripInfo) {
        // Calcular precio basado en distancia y configuración
        double pricePerKm = 40.0; // Obtener de configuración
        int minPrice = 100;
        int maxPrice = 600;
        
        int calculatedPrice = (int) (tripInfo.distance * pricePerKm);
        
        if (calculatedPrice < minPrice) return minPrice;
        if (calculatedPrice > maxPrice) return maxPrice;
        
        return calculatedPrice;
    }

    private boolean performAutomaticClick(AccessibilityNodeInfo node) {
        if (node == null) return false;
        
        try {
            if (node.isClickable()) {
                return node.performAction(AccessibilityNodeInfo.ACTION_CLICK);
            }
            
            // Si no es clickeable, buscar padre clickeable
            AccessibilityNodeInfo parent = node.getParent();
            if (parent != null) {
                boolean result = performAutomaticClick(parent);
                parent.recycle();
                return result;
            }
            
        } catch (Exception e) {
            Log.e(TAG, "❌ Error haciendo clic automático: " + e.getMessage());
        }
        
        return false;
    }

    private void enterBidAutomatically(int bidPrice) {
        try {
            // Buscar campo de entrada de precio
            AccessibilityNodeInfo rootNode = getRootInActiveWindow();
            if (rootNode != null) {
                AccessibilityNodeInfo priceField = findPriceInputField(rootNode);
                if (priceField != null) {
                    // Ingresar precio automáticamente
                    Bundle arguments = new Bundle();
                    arguments.putCharSequence(AccessibilityNodeInfo.ACTION_ARGUMENT_SET_TEXT_CHARSEQUENCE, 
                                            String.valueOf(bidPrice));
                    priceField.performAction(AccessibilityNodeInfo.ACTION_SET_TEXT, arguments);
                    
                    Log.d(TAG, "💵 Precio ingresado automáticamente: $" + bidPrice);
                    priceField.recycle();
                }
                rootNode.recycle();
            }
        } catch (Exception e) {
            Log.e(TAG, "❌ Error ingresando precio automáticamente: " + e.getMessage());
        }
    }

    private void confirmBidAutomatically() {
        try {
            // Buscar botón de confirmar y hacer clic automáticamente
            AccessibilityNodeInfo rootNode = getRootInActiveWindow();
            if (rootNode != null) {
                AccessibilityNodeInfo confirmButton = findConfirmButton(rootNode);
                if (confirmButton != null) {
                    confirmButton.performAction(AccessibilityNodeInfo.ACTION_CLICK);
                    Log.d(TAG, "✅ Oferta confirmada automáticamente");
                    confirmButton.recycle();
                }
                rootNode.recycle();
            }
        } catch (Exception e) {
            Log.e(TAG, "❌ Error confirmando oferta automáticamente: " + e.getMessage());
        }
    }

    private AccessibilityNodeInfo findPriceInputField(AccessibilityNodeInfo node) {
        // Buscar campo de entrada de precio
        if (node == null) return null;
        
        if (node.getClassName() != null && 
            node.getClassName().toString().contains("EditText")) {
            return node;
        }
        
        for (int i = 0; i < node.getChildCount(); i++) {
            AccessibilityNodeInfo child = node.getChild(i);
            if (child != null) {
                AccessibilityNodeInfo result = findPriceInputField(child);
                if (result != null) {
                    child.recycle();
                    return result;
                }
                child.recycle();
            }
        }
        
        return null;
    }

    private AccessibilityNodeInfo findConfirmButton(AccessibilityNodeInfo node) {
        // Buscar botón de confirmar
        if (node == null) return null;
        
        CharSequence text = node.getText();
        if (text != null) {
            String textStr = text.toString().toLowerCase();
            if (textStr.contains("confirmar") || 
                textStr.contains("enviar") || 
                textStr.contains("ofertar")) {
                return node;
            }
        }
        
        for (int i = 0; i < node.getChildCount(); i++) {
            AccessibilityNodeInfo child = node.getChild(i);
            if (child != null) {
                AccessibilityNodeInfo result = findConfirmButton(child);
                if (result != null) {
                    child.recycle();
                    return result;
                }
                child.recycle();
            }
        }
        
        return null;
    }

    // Clase para almacenar información del viaje
    private static class TripInfo {
        double distance = 0.0;
        int suggestedPrice = 0;
        String pickup = "";
        String destination = "";
        boolean hasMultipleStops = false;
        boolean isNewClient = false;
        double passengerRating = 5.0;
    }
}