package com.bridgecraft

import android.net.TrafficStats
import android.os.Handler
import android.os.Looper
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule

class NetworkSpeedModule(
  private val reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {

  private var handler: Handler? = null
  private var lastRxBytes = 0L
  private var lastTxBytes = 0L

  override fun getName(): String = "NetworkSpeed"

  @ReactMethod
  fun startMonitoring() {
    lastRxBytes = TrafficStats.getTotalRxBytes()
    lastTxBytes = TrafficStats.getTotalTxBytes()

    handler = Handler(Looper.getMainLooper())
    handler?.postDelayed(object : Runnable {
      override fun run() {
        val currentRx = TrafficStats.getTotalRxBytes()
        val currentTx = TrafficStats.getTotalTxBytes()

        val downloadSpeed = currentRx - lastRxBytes
        val uploadSpeed = currentTx - lastTxBytes

        lastRxBytes = currentRx
        lastTxBytes = currentTx

        sendSpeedToJS(downloadSpeed, uploadSpeed)
        handler?.postDelayed(this, 1000)
      }
    }, 1000)
  }

  @ReactMethod
  fun stopMonitoring() {
    handler?.removeCallbacksAndMessages(null)
  }

  private fun sendSpeedToJS(download: Long, upload: Long) {
    val params = Arguments.createMap()
    params.putDouble("download", download / 1024.0)
    params.putDouble("upload", upload / 1024.0)

    reactContext
      .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
      .emit("NetworkSpeedUpdate", params)
  }
}
