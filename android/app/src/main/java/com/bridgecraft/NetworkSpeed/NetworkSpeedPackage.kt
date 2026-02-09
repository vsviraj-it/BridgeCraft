package com.bridgecraft

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

class NetworkSpeedPackage : ReactPackage {
  override fun createNativeModules(reactContext: ReactApplicationContext) =
    listOf(NetworkSpeedModule(reactContext))

  override fun createViewManagers(reactContext: ReactApplicationContext) =
    emptyList<ViewManager<*, *>>()
}
