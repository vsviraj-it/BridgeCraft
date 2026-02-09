package com.bridgecraft

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.net.TrafficStats
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.widget.RemoteViews
import androidx.core.app.NotificationCompat

class NetworkSpeedService : Service() {

    private val handler = Handler(Looper.getMainLooper())
    private var lastRx = -1L
    private var lastTx = -1L
    private var isUpdating = false

    override fun onCreate() {
        super.onCreate()
        lastRx = TrafficStats.getTotalRxBytes()
        lastTx = TrafficStats.getTotalTxBytes()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val notification = createNotification()
        
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            startForeground(1, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_DATA_SYNC)
        } else {
            startForeground(1, notification)
        }

        if (!isUpdating) {
            startSpeedUpdates()
        }

        return START_STICKY
    }

    private fun startSpeedUpdates() {
        isUpdating = true
        handler.postDelayed(object : Runnable {
            override fun run() {
                val rx = TrafficStats.getTotalRxBytes()
                val tx = TrafficStats.getTotalTxBytes()

                if (rx != TrafficStats.UNSUPPORTED.toLong() && tx != TrafficStats.UNSUPPORTED.toLong()) {
                    val downBytes = if (lastRx != -1L && rx >= lastRx) rx - lastRx else 0L
                    val upBytes = if (lastTx != -1L && tx >= lastTx) tx - lastTx else 0L

                    lastRx = rx
                    lastTx = tx

                    updateWidget(downBytes, upBytes)
                }
                
                handler.postDelayed(this, 1000)
            }
        }, 1000)
    }

    private fun formatSpeed(bytes: Long): String {
        if (bytes < 0) return "0 B/s"
        if (bytes < 1024) return "$bytes B/s"
        val kb = bytes / 1024.0
        if (kb < 1024) return String.format("%.2f KB/s", kb)
        val mb = kb / 1024.0
        return String.format("%.2f MB/s", mb)
    }

    private fun updateWidget(downloadBytes: Long, uploadBytes: Long) {
        val views = RemoteViews(packageName, R.layout.widget_network_speed)

        views.setTextViewText(R.id.tvDownload,   formatSpeed(downloadBytes))
        views.setTextViewText(R.id.tvUpload, formatSpeed(uploadBytes))

        val manager = AppWidgetManager.getInstance(this)
        val widgetIds = manager.getAppWidgetIds(ComponentName(this, NetworkSpeedWidget::class.java))
        for (id in widgetIds) {
            manager.updateAppWidget(id, views)
        }
    }

    private fun createNotification(): Notification {
        val channelId = "network_speed"

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                channelId,
                "Network Speed",
                NotificationManager.IMPORTANCE_LOW
            )
            getSystemService(NotificationManager::class.java)
                ?.createNotificationChannel(channel)
        }

        return NotificationCompat.Builder(this, channelId)
            .setContentTitle("Network Speed Monitor")
            .setContentText("Monitoring real-time network speed")
            .setSmallIcon(android.R.drawable.stat_sys_download)
            .setOngoing(true)
            .build()
    }

    override fun onBind(intent: Intent?) = null

    override fun onDestroy() {
        isUpdating = false
        handler.removeCallbacksAndMessages(null)
        super.onDestroy()
    }
}
