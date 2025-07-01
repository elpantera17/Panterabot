package com.panterabot.indrive;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.util.Log;

public class BootReceiver extends BroadcastReceiver {
    private static final String TAG = "PanteraBot_BootReceiver";

    @Override
    public void onReceive(Context context, Intent intent) {
        String action = intent.getAction();
        Log.d(TAG, "Received action: " + action);

        if (Intent.ACTION_BOOT_COMPLETED.equals(action) ||
            Intent.ACTION_MY_PACKAGE_REPLACED.equals(action) ||
            Intent.ACTION_PACKAGE_REPLACED.equals(action)) {
            
            Log.d(TAG, "🚀 Iniciando Pantera Bot automáticamente...");
            
            try {
                // Iniciar el servicio en segundo plano
                Intent serviceIntent = new Intent(context, BotBackgroundService.class);
                context.startForegroundService(serviceIntent);
                
                Log.d(TAG, "✅ Pantera Bot iniciado exitosamente");
            } catch (Exception e) {
                Log.e(TAG, "❌ Error iniciando Pantera Bot: " + e.getMessage());
            }
        }
    }
}