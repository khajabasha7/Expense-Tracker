"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Wifi, WifiOff } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface NetworkMonitorProps {
  onNetworkUpdate: (networkInfo: any) => void
}

export default function NetworkMonitor({ onNetworkUpdate }: NetworkMonitorProps) {
  const [networkInfo, setNetworkInfo] = useState<any>(null)
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    const updateNetworkInfo = () => {
      // Check if Network Information API is available
      const connection =
        (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection

      if (connection) {
        const info = {
          effectiveType: connection.effectiveType,
          downlink: connection.downlink,
          rtt: connection.rtt,
          saveData: connection.saveData,
        }
        setNetworkInfo(info)
        onNetworkUpdate(info)
      } else {
        // Fallback for browsers without Network Information API
        const fallbackInfo = {
          effectiveType: isOnline ? "4g" : "offline",
          downlink: isOnline ? 10 : 0,
          rtt: isOnline ? 100 : 0,
          saveData: false,
        }
        setNetworkInfo(fallbackInfo)
        onNetworkUpdate(fallbackInfo)
      }
    }

    const handleOnline = () => {
      setIsOnline(true)
      updateNetworkInfo()
    }

    const handleOffline = () => {
      setIsOnline(false)
      updateNetworkInfo()
    }

    // Initial check
    updateNetworkInfo()

    // Listen for network changes
    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    // Listen for connection changes if supported
    const connection = (navigator as any).connection
    if (connection) {
      connection.addEventListener("change", updateNetworkInfo)
    }

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
      if (connection) {
        connection.removeEventListener("change", updateNetworkInfo)
      }
    }
  }, [isOnline, onNetworkUpdate])

  const getNetworkColor = (type: string) => {
    switch (type) {
      case "4g":
        return "bg-green-100 text-green-800"
      case "3g":
        return "bg-yellow-100 text-yellow-800"
      case "2g":
        return "bg-red-100 text-red-800"
      case "offline":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-blue-100 text-blue-800"
    }
  }

  const getSpeedDescription = (effectiveType: string) => {
    switch (effectiveType) {
      case "4g":
        return "Fast"
      case "3g":
        return "Moderate"
      case "2g":
        return "Slow"
      case "offline":
        return "No Connection"
      default:
        return "Unknown"
    }
  }

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center space-y-0 pb-2">
        {isOnline ? (
          <Wifi className="h-4 w-4 text-green-600 flex-shrink-0" />
        ) : (
          <WifiOff className="h-4 w-4 text-red-600 flex-shrink-0" />
        )}
        <CardTitle className="text-sm font-medium ml-2 truncate">Network</CardTitle>
      </CardHeader>
      <CardContent>
        {networkInfo ? (
          <div className="space-y-2">
            <Badge className={`${getNetworkColor(networkInfo.effectiveType)} text-xs`}>
              {networkInfo.effectiveType?.toUpperCase() || "Unknown"}
            </Badge>
            <p className="text-xs text-muted-foreground truncate">
              {getSpeedDescription(networkInfo.effectiveType)}
              {networkInfo.downlink && ` • ${networkInfo.downlink} Mbps`}
            </p>
            {networkInfo.saveData && (
              <Badge variant="outline" className="text-xs">
                Data Saver On
              </Badge>
            )}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">Detecting...</div>
        )}
      </CardContent>
    </Card>
  )
}
