"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BookOpen, Video, FileText, Download, Eye, Play } from "lucide-react"
import materials from "@/data/materials"

interface StudyMaterial {
  id: string
  title: string
  type: "video" | "text" | "interactive"
  size: "small" | "medium" | "large"
  subject: string
  description: string
  viewed: boolean
  videoUrl?: string
}

interface StudyMaterialsProps {
  networkQuality?: string
  onVideoOpen?: (url: string, title: string) => void
  onStudyComplete?: (title: string, duration: number) => void
}

export default function StudyMaterials({ networkQuality, onVideoOpen, onStudyComplete }: StudyMaterialsProps) {
  const [visibleMaterials, setVisibleMaterials] = useState<StudyMaterial[]>([])
  const [viewedMaterials, setViewedMaterials] = useState<Set<string>>(new Set())
  const [downloadedMaterials, setDownloadedMaterials] = useState<Set<string>>(new Set())
  const [studyingSessions, setStudyingSessions] = useState<Set<string>>(new Set())
  const observerRef = useRef<IntersectionObserver | null>(null)
  const materialRefs = useRef<Map<string, HTMLDivElement>>(new Map())

  useEffect(() => {
    // Filter materials based on network quality
    const filteredMaterials = materials.filter((material) => {
      if (networkQuality === "2g" && material.size === "large") return false
      if (networkQuality === "offline") return material.type === "text"
      return true
    })

    setVisibleMaterials(filteredMaterials)
  }, [networkQuality])

  useEffect(() => {
    // Set up Intersection Observer to track which materials are viewed
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
            const materialId = entry.target.getAttribute("data-material-id")
            if (materialId) {
              setViewedMaterials((prev) => new Set([...prev, materialId]))

              // Use requestIdleCallback for background processing
              if ("requestIdleCallback" in window) {
                requestIdleCallback(() => {
                  console.log(`Material ${materialId} viewed - updating analytics`)
                })
              }
            }
          }
        })
      },
      {
        threshold: [0.5],
        rootMargin: "0px 0px -50px 0px",
      },
    )

    // Observe all material cards
    materialRefs.current.forEach((element) => {
      if (observerRef.current) {
        observerRef.current.observe(element)
      }
    })

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [visibleMaterials])

  const setMaterialRef = (id: string, element: HTMLDivElement | null) => {
    if (element) {
      materialRefs.current.set(id, element)
    } else {
      materialRefs.current.delete(id)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="h-4 w-4" />
      case "text":
        return <FileText className="h-4 w-4" />
      case "interactive":
        return <BookOpen className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "video":
        return "bg-red-100 text-red-800"
      case "text":
        return "bg-blue-100 text-blue-800"
      case "interactive":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getSizeColor = (size: string) => {
    switch (size) {
      case "small":
        return "bg-green-100 text-green-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "large":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getNetworkRecommendation = () => {
    switch (networkQuality) {
      case "4g":
        return "All materials available - excellent connection!"
      case "3g":
        return "Most materials available - videos may load slowly"
      case "2g":
        return "Text materials recommended - videos filtered out"
      case "offline":
        return "Only offline text materials available"
      default:
        return "Loading materials based on your connection..."
    }
  }

  const handleDownload = (material: StudyMaterial) => {
    setDownloadedMaterials((prev) => new Set([...prev, material.id]))

    const downloadTime = getDownloadTime(material.size, networkQuality)

    setTimeout(() => {
      console.log(`Downloaded: ${material.title}`)
      const blob = new Blob([`Study Material: ${material.title}\n\n${material.description}`], { type: "text/plain" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${material.title.replace(/\s+/g, "_")}.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }, downloadTime)
  }

  const handleStudy = (material: StudyMaterial) => {
    setStudyingSessions((prev) => new Set([...prev, material.id]))
    setViewedMaterials((prev) => new Set([...prev, material.id]))

    // Handle video materials
    if (material.type === "video" && material.videoUrl) {
      if (onVideoOpen) {
        onVideoOpen(material.videoUrl, material.title)
      } else {
        window.open(material.videoUrl, "_blank", "noopener,noreferrer")
      }
    }

    // Simulate realistic study session duration
    const studyDuration =
      material.type === "video" ? Math.floor(Math.random() * 20) + 10 : Math.floor(Math.random() * 10) + 5

    setTimeout(() => {
      setStudyingSessions((prev) => {
        const newSet = new Set(prev)
        newSet.delete(material.id)
        return newSet
      })

      if (onStudyComplete) {
        onStudyComplete(material.title, studyDuration)
      }
    }, 3000)
  }

  const getDownloadTime = (size: string, quality?: string) => {
    const baseTime = { small: 500, medium: 1500, large: 3000 }
    const multiplier = { "4g": 1, "3g": 2, "2g": 4, offline: 0 }
    return baseTime[size] * (multiplier[quality as keyof typeof multiplier] || 1)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Study Materials</CardTitle>
        <CardDescription>{getNetworkRecommendation()}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-2 gap-4">
          {visibleMaterials.map((material) => (
            <div
              key={material.id}
              ref={(el) => setMaterialRef(material.id, el)}
              data-material-id={material.id}
              className="border rounded-lg p-4 space-y-3 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {getTypeIcon(material.type)}
                  <h3 className="font-medium text-sm">{material.title}</h3>
                  {material.type === "video" && material.videoUrl && <Play className="h-3 w-3 text-red-500" />}
                </div>
                {viewedMaterials.has(material.id) && <Eye className="h-4 w-4 text-green-600" />}
              </div>

              <p className="text-xs text-gray-600">{material.description}</p>

              <div className="flex flex-wrap gap-2">
                <Badge className={getTypeColor(material.type)} variant="secondary">
                  {material.type}
                </Badge>
                <Badge className={getSizeColor(material.size)} variant="secondary">
                  {material.size}
                </Badge>
                <Badge variant="outline">{material.subject}</Badge>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={studyingSessions.has(material.id) ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => handleStudy(material)}
                  disabled={studyingSessions.has(material.id)}
                >
                  {material.type === "video" ? (
                    <Play className="h-3 w-3 mr-1" />
                  ) : (
                    <BookOpen className="h-3 w-3 mr-1" />
                  )}
                  {studyingSessions.has(material.id) ? "Studying..." : material.type === "video" ? "Watch" : "Study"}
                </Button>
                <Button
                  size="sm"
                  variant={downloadedMaterials.has(material.id) ? "default" : "outline"}
                  onClick={() => handleDownload(material)}
                  disabled={downloadedMaterials.has(material.id) || networkQuality === "offline"}
                >
                  {downloadedMaterials.has(material.id) ? (
                    <Eye className="h-3 w-3" />
                  ) : (
                    <Download className="h-3 w-3" />
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {visibleMaterials.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No materials available for current network conditions.</p>
            <p className="text-sm">Try switching to a better connection.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
