"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface LocationTrackerProps {
  onLocationUpdate: (location: string) => void
}

export default function LocationTracker({ onLocationUpdate }: LocationTrackerProps) {
  const [location, setLocation] = useState<string>("Detecting...")
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported")
      setLocation("Not Available")
      onLocationUpdate("Unknown")
      return
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setCoordinates({ lat: latitude, lng: longitude })
        setError(null)

        // Simulate location detection based on coordinates
        // In a real app, you'd use reverse geocoding
        const detectedLocation = detectLocationFromCoords(latitude, longitude)
        setLocation(detectedLocation)
        onLocationUpdate(detectedLocation)
      },
      (error) => {
        console.error("Geolocation error:", error)
        setError(error.message)
        setLocation("Permission Denied")
        onLocationUpdate("Unknown")
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      },
    )

    return () => navigator.geolocation.clearWatch(watchId)
  }, [onLocationUpdate])

  const detectLocationFromCoords = (lat: number, lng: number): string => {
    // Simulate location detection logic
    // In reality, you'd use reverse geocoding or predefined location boundaries
    const hour = new Date().getHours()

    if (hour >= 9 && hour <= 17) {
      return Math.random() > 0.5 ? "Library" : "University"
    } else if (hour >= 18 && hour <= 22) {
      return Math.random() > 0.3 ? "Home" : "Cafe"
    } else {
      return "Home"
    }
  }

  const getLocationColor = (loc: string) => {
    switch (loc) {
      case "Library":
        return "bg-green-100 text-green-800"
      case "Home":
        return "bg-blue-100 text-blue-800"
      case "Cafe":
        return "bg-orange-100 text-orange-800"
      case "University":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center space-y-0 pb-2">
        <MapPin className="h-4 w-4 text-blue-600 flex-shrink-0" />
        <CardTitle className="text-sm font-medium ml-2 truncate">Location</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {error ? (
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span className="text-sm truncate">{error}</span>
          </div>
        ) : (
          <div className="space-y-2">
            <Badge className={`${getLocationColor(location)} text-xs`}>{location}</Badge>
            {coordinates && (
              <p className="text-xs text-muted-foreground break-all">
                {coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
