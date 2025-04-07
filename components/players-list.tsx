"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, User } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface Player {
  id: string
  name: string
  points: number
  rating: number
  image: string | null
}

export function PlayersList() {
  const [activeTab, setActiveTab] = useState("participants")
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const response = await fetch("/api/players")
        if (!response.ok) {
          throw new Error("Failed to fetch players")
        }

        const data = await response.json()
        setPlayers(data)
      } catch (error) {
        console.error("Error fetching players:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPlayers()
  }, [])

  // Sort players by points (highest first)
  const sortedPlayers = [...players].sort((a, b) => b.points - a.points)

  // First 14 are participants
  const participants = sortedPlayers.slice(0, 14)

  // Next 4 are reserves
  const reserves = sortedPlayers.slice(14, 18)

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Players</CardTitle>
          <CardDescription>Loading player data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div>
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-16 mt-1" />
                  </div>
                </div>
                <Skeleton className="h-5 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Players</CardTitle>
        <CardDescription>
          Players are sorted by points. Top 14 players participate, next 4 are reserves.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="participants" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="participants" onClick={() => setActiveTab("participants")}>
              Participants ({participants.length})
            </TabsTrigger>
            <TabsTrigger value="reserves" onClick={() => setActiveTab("reserves")}>
              Reserves ({reserves.length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="participants">
            <div className="space-y-4 mt-4">
              {participants.map((player, index) => (
                <div key={player.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">{index + 1}</div>
                    <Avatar>
                      <AvatarImage src={player.image || ""} alt={player.name} />
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium leading-none">{player.name}</p>
                      <p className="text-sm text-muted-foreground">
                        <span className="flex items-center gap-1 mt-1">
                          <Star className="h-3 w-3" /> {player.rating.toFixed(1)}
                        </span>
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary">{player.points} points</Badge>
                </div>
              ))}
              {participants.length === 0 && (
                <div className="text-center py-4 text-muted-foreground">No participants found</div>
              )}
            </div>
          </TabsContent>
          <TabsContent value="reserves">
            <div className="space-y-4 mt-4">
              {reserves.map((player, index) => (
                <div key={player.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">{index + 1}</div>
                    <Avatar>
                      <AvatarImage src={player.image || ""} alt={player.name} />
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium leading-none">{player.name}</p>
                      <p className="text-sm text-muted-foreground">
                        <span className="flex items-center gap-1 mt-1">
                          <Star className="h-3 w-3" /> {player.rating.toFixed(1)}
                        </span>
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary">{player.points} points</Badge>
                </div>
              ))}
              {reserves.length === 0 && <div className="text-center py-4 text-muted-foreground">No reserves found</div>}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

