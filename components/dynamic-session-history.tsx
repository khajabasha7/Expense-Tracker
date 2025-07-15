"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Calendar, Clock, Trash2 } from "lucide-react"

interface StudySession {
  id: string
  subject: string
  duration: number
  location: string
  networkQuality: string
  completed: boolean
  timestamp: Date
}

interface DynamicSessionHistoryProps {
  sessions: StudySession[]
  onDeleteSession?: (sessionId: string) => void
}

export default function DynamicSessionHistory({ sessions, onDeleteSession }: DynamicSessionHistoryProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterBy, setFilterBy] = useState<"all" | "subject" | "location" | "network">("all")
  const [sortBy, setSortBy] = useState<"date" | "duration" | "subject">("date")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  const filteredAndSortedSessions = useMemo(() => {
    let filtered = sessions.filter((session) => {
      if (!searchTerm) return true
      return (
        session.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.networkQuality.toLowerCase().includes(searchTerm.toLowerCase())
      )
    })

    // Apply additional filters
    if (filterBy !== "all") {
      // Group by filter type for better organization
      const grouped = filtered.reduce(
        (acc, session) => {
          const key = session[filterBy as keyof StudySession] as string
          if (!acc[key]) acc[key] = []
          acc[key].push(session)
          return acc
        },
        {} as Record<string, StudySession[]>,
      )

      filtered = Object.values(grouped).flat()
    }

    // Sort sessions
    filtered.sort((a, b) => {
      let comparison = 0

      switch (sortBy) {
        case "date":
          comparison = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          break
        case "duration":
          comparison = a.duration - b.duration
          break
        case "subject":
          comparison = a.subject.localeCompare(b.subject)
          break
      }

      return sortOrder === "asc" ? comparison : -comparison
    })

    return filtered
  }, [sessions, searchTerm, filterBy, sortBy, sortOrder])

  const getSessionStats = () => {
    const completed = sessions.filter((s) => s.completed)
    const totalTime = completed.reduce((acc, s) => acc + s.duration, 0)
    const subjects = [...new Set(completed.map((s) => s.subject))]
    const locations = [...new Set(completed.map((s) => s.location))]

    return {
      total: completed.length,
      totalTime,
      subjects: subjects.length,
      locations: locations.length,
      avgDuration: completed.length > 0 ? Math.round(totalTime / completed.length) : 0,
    }
  }

  const formatDate = (date: Date) => {
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 1) {
      return "Just now"
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`
    } else if (diffInHours < 48) {
      return "Yesterday"
    } else {
      return date.toLocaleDateString()
    }
  }

  const getLocationIcon = (location: string) => {
    switch (location.toLowerCase()) {
      case "library":
        return "📚"
      case "home":
        return "🏠"
      case "cafe":
        return "☕"
      case "university":
        return "🎓"
      default:
        return "📍"
    }
  }

  const getNetworkIcon = (quality: string) => {
    switch (quality) {
      case "4g":
        return "📶"
      case "3g":
        return "📶"
      case "2g":
        return "📱"
      default:
        return "📡"
    }
  }

  const stats = getSessionStats()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Study Session History</span>
          <Badge variant="outline">{sessions.length} total</Badge>
        </CardTitle>
        <CardDescription>Track and analyze your study patterns over time</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center">
            <div className="bg-blue-50 p-2 rounded text-xs">
              <div className="font-bold text-blue-600">{stats.total}</div>
              <div className="text-gray-600">Sessions</div>
            </div>
            <div className="bg-green-50 p-2 rounded text-xs">
              <div className="font-bold text-green-600">{stats.totalTime}m</div>
              <div className="text-gray-600">Total Time</div>
            </div>
            <div className="bg-purple-50 p-2 rounded text-xs">
              <div className="font-bold text-purple-600">{stats.subjects}</div>
              <div className="text-gray-600">Subjects</div>
            </div>
            <div className="bg-orange-50 p-2 rounded text-xs">
              <div className="font-bold text-orange-600">{stats.locations}</div>
              <div className="text-gray-600">Locations</div>
            </div>
            <div className="bg-red-50 p-2 rounded text-xs">
              <div className="font-bold text-red-600">{stats.avgDuration}m</div>
              <div className="text-gray-600">Avg Duration</div>
            </div>
          </div>

          {/* Search and Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search sessions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterBy} onValueChange={(value: any) => setFilterBy(value)}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="subject">Subject</SelectItem>
                <SelectItem value="location">Location</SelectItem>
                <SelectItem value="network">Network</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="duration">Duration</SelectItem>
                <SelectItem value="subject">Subject</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}>
              {sortOrder === "asc" ? "↑" : "↓"}
            </Button>
          </div>

          {/* Session List */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredAndSortedSessions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {sessions.length === 0 ? (
                  <>
                    <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No study sessions yet</p>
                    <p className="text-sm">Start your first session to see your history!</p>
                  </>
                ) : (
                  <>
                    <Search className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p>No sessions match your search</p>
                  </>
                )}
              </div>
            ) : (
              filteredAndSortedSessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm">{session.subject}</h4>
                      <Badge variant={session.completed ? "default" : "secondary"} className="text-xs">
                        {session.completed ? "Completed" : "Incomplete"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-600">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {session.duration} min
                      </span>
                      <span className="flex items-center gap-1">
                        <span>{getLocationIcon(session.location)}</span>
                        {session.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <span>{getNetworkIcon(session.networkQuality)}</span>
                        {session.networkQuality.toUpperCase()}
                      </span>
                      <span className="text-gray-400">{formatDate(new Date(session.timestamp))}</span>
                    </div>
                  </div>
                  {onDeleteSession && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteSession(session.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
