package com.panterabot.indrive;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Intent;
import android.os.Build;
import android.os.IBinder;
import android.util.Log;
import androidx.core.app.NotificationCompat;

public class BotBackgroundService extends Service {
    private static final String TAG = "PanteraBot_Service";
    private static final String CHANNEL_ID = "PanteraBotChannel";
    private static final int NOTIFICATION_ID = 1001;
    
    private boolean isRunning = false;

    @Override
    public void onCreate() {
        super.onCreate();
        Log.d(TAG, "🤖 Servicio Pantera Bot creado");
        createNotificationChannel();
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        Log.d(TAG, "🚀 Iniciando servicio Pantera Bot...");
        
        if (!isRunning) {
            startForeground(NOTIFICATION_ID, createNotification());
            isRunning = true;
            
            // Iniciar monitoreo en hilo separado
            startBotMonitoring();
        }
        
        // Reiniciar automáticamente si el sistema mata el servicio
        return START_STICKY;
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        isRunning = false;
        Log.d(TAG, "⏹️ Servicio Pantera Bot detenido");
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                CHANNEL_ID,
                "Pantera Bot Service",
                NotificationManager.IMPORTANCE_LOW
            );
            channel.setDescription("Servicio en segundo plano de Pantera Bot");
            
            NotificationManager manager = getSystemService(NotificationManager.class);
            manager.createNotificationChannel(channel);
        }
    }

    private Notification createNotification() {
        Intent notificationIntent = new Intent(this, MainActivity.class);
        PendingIntent pendingIntent = PendingIntent.getActivity(
            this, 0, notificationIntent, 
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        return new NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("🤖 Pantera Bot Activo")
            .setContentText("Monitoreando inDrive en segundo plano...")
            .setSmallIcon(R.mipmap.ic_launcher)
            .setContentIntent(pendingIntent)
            .setOngoing(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build();
    }

    private void startBotMonitoring() {
        new Thread(() -> {
            Log.d(TAG, "👀 Iniciando monitoreo de inDrive...");
            
            while (isRunning) {
                try {
                    // Verificar si inDrive está activo
                    checkInDriveStatus();
                    
                    // Esperar antes del siguiente ciclo
                    Thread.sleep(5000); // 5 segundos
                    
                } catch (InterruptedException e) {
                    Log.d(TAG, "Monitoreo interrumpido");
                    break;
                } catch (Exception e) {
                    Log.e(TAG, "Error en monitoreo: " + e.getMessage());
                }
            }
            
            Log.d(TAG, "🛑 Monitoreo detenido");
        }).start();
    }

    private void checkInDriveStatus() {
        // Aquí se implementaría la lógica para verificar
        // si inDrive está en primer plano y activo
        Log.d(TAG, "🔍 Verificando estado de inDrive...");
        
        // Por ahora solo log, la implementación real requiere
        // integración con el servicio de accesibilidad
    }

    public static void showNotification(android.content.Context context, String title, String message) {
        NotificationManager manager = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
        
        NotificationCompat.Builder builder = new NotificationCompat.Builder(context, CHANNEL_ID)
            .setContentTitle(title)
            .setContentText(message)
            .setSmallIcon(R.mipmap.ic_launcher)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setAutoCancel(true);
            
        manager.notify((int) System.currentTimeMillis(), builder.build());
    }
}