"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, Clock, MapPin, User, Users } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface GameDetailProps {
  id: string
}

// Mock game data - in a real app, this would come from your API
const mockGame = {
  id: "1",
  date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
  time: "18:00",
  location: "Local Football Field",
  status: "upcoming",
  participants: [
    { id: "1", name: "John Doe", points: 10, rating: 8.5, image: null },
    { id: "2", name: "Jane Smith", points: 9, rating: 8.2, image: null },
    { id: "3", name: "Mike Johnson", points: 8, rating: 7.8, image: null },
    { id: "4", name: "Sarah Williams", points: 7, rating: 7.5, image: null },
    { id: "5", name: "David Brown", points: 7, rating: 7.2, image: null },
    { id: "6", name: "Emily Davis", points: 6, rating: 7.0, image: null },
    { id: "7", name: "Chris Wilson", points: 6, rating: 6.8, image: null },
    { id: "8", name: "Alex Taylor", points: 5, rating: 6.5, image: null },
    { id: "9", name: "Sam Anderson", points: 5, rating: 6.3, image: null },
    { id: "10", name: "Jordan Lee", points: 4, rating: 6.0, image: null },
    { id: "11", name: "Casey Martin", points: 4, rating: 5.8, image: null },
    { id: "12", name: "Jamie Garcia", points: 3, rating: 5.5, image: null },
    { id: "13", name: "Taylor Rodriguez", points: 3, rating: 5.3, image: null },
    { id: "14", name: "Riley Martinez", points: 2, rating: 5.0, image: null },
  ],
  reserves: [
    { id: "15", name: "Morgan Lopez", points: 2, rating: 4.8, image: null },
    { id: "16", name: "Avery Gonzalez", points: 1, rating: 4.5, image: null },
    { id: "17", name: "Quinn Perez", points: 1, rating: 4.3, image: null },
    { id: "18", name: "Reese Sanchez", points: 0.5, rating: 4.0, image: null },
  ],
  teams: {
    teamA: {
      name: "Team A",
      players: [
        { id: "1", name: "John Doe", rating: 8.5, image: null },
        { id: "4", name: "Sarah Williams", rating: 7.5, image: null },
        { id: "5", name: "David Brown", rating: 7.2, image: null },
        { id: "8", name: "Alex Taylor", rating: 6.5, image: null },
        { id: "9", name: "Sam Anderson", rating: 6.3, image: null },
        { id: "12", name: "Jamie Garcia", rating: 5.5, image: null },
        { id: "13", name: "Taylor Rodriguez", rating: 5.3, image: null },
      ],
      totalRating: 46.8,
    },
    teamB: {
      name: "Team B",
      players: [
        { id: "2", name: "Jane Smith", rating: 8.2, image: null },
        { id: "3", name: "Mike Johnson", rating: 7.8, image: null },
        { id: "6", name: "Emily Davis", rating: 7.0, image: null },
        { id: "7", name: "Chris Wilson", rating: 6.8, image: null },
        { id: "10", name: "Jordan Lee", rating: 6.0, image: null },
        { id: "11", name: "Casey Martin", rating: 5.8, image: null },
        { id: "14", name: "Riley Martinez", rating: 5.0, image: null },
      ],
      totalRating: 46.6,
    },
  },
}

export function GameDetail({ id }: GameDetailProps) {
  const [game, setGame] = useState<typeof mockGame | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // In a real app, you would fetch the game data from your API
    const fetchGame = async () => {
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000))
        setGame(mockGame)
      } catch (error) {
        console.error("Error fetching game:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchGame()
  }, [id])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!game) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Game Not Found</CardTitle>
          <CardDescription>The game you are looking for does not exist or has been removed.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Game Information</CardTitle>
          <CardDescription>Details about the upcoming game</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{game.date.toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{game.time}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{game.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>
                {game.participants.length} participants, {game.reserves.length} reserves
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Players</CardTitle>
          <CardDescription>Participants and reserves for this game</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="participants" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="participants">Participants ({game.participants.length})</TabsTrigger>
              <TabsTrigger value="reserves">Reserves ({game.reserves.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="participants">
              <div className="space-y-4 mt-4">
                {game.participants.map((player) => (
                  <div key={player.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={player.image || ""} alt={player.name} />
                        <AvatarFallback>
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium leading-none">{player.name}</p>
                        <p className="text-sm text-muted-foreground">Rating: {player.rating.toFixed(1)}</p>
                      </div>
                    </div>
                    <Badge variant="secondary">{player.points} points</Badge>
                  </div>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="reserves">
              <div className="space-y-4 mt-4">
                {game.reserves.map((player) => (
                  <div key={player.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={player.image || ""} alt={player.name} />
                        <AvatarFallback>
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium leading-none">{player.name}</p>
                        <p className="text-sm text-muted-foreground">Rating: {player.rating.toFixed(1)}</p>
                      </div>
                    </div>
                    <Badge variant="secondary">{player.points} points</Badge>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {game.teams && (
        <Card>
          <CardHeader>
            <CardTitle>Teams</CardTitle>
            <CardDescription>Balanced teams for this game</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="font-semibold text-lg mb-2 flex items-center justify-between">
                  Team A<Badge variant="outline">Rating: {game.teams.teamA.totalRating.toFixed(1)}</Badge>
                </h3>
                <div className="space-y-3 border rounded-md p-3">
                  {game.teams.teamA.players.map((player) => (
                    <div key={player.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={player.image || ""} alt={player.name} />
                          <AvatarFallback>
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        <p className="text-sm font-medium">{player.name}</p>
                      </div>
                      <Badge variant="secondary">{player.rating.toFixed(1)}</Badge>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2 flex items-center justify-between">
                  Team B<Badge variant="outline">Rating: {game.teams.teamB.totalRating.toFixed(1)}</Badge>
                </h3>
                <div className="space-y-3 border rounded-md p-3">
                  {game.teams.teamB.players.map((player) => (
                    <div key={player.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={player.image || ""} alt={player.name} />
                          <AvatarFallback>
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        <p className="text-sm font-medium">{player.name}</p>
                      </div>
                      <Badge variant="secondary">{player.rating.toFixed(1)}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

