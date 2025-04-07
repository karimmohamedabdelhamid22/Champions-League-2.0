"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, RefreshCw } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"

interface Game {
  id: string
  date: Date
  location: string
  participants: {
    id: string
    name: string
    rating: number
    image: string | null
  }[]
  teams: {
    teamA: {
      id: string
      name: string
      totalRating: number
      players: {
        id: string
        name: string
        rating: number
        image: string | null
      }[]
    }
    teamB: {
      id: string
      name: string
      totalRating: number
      players: {
        id: string
        name: string
        rating: number
        image: string | null
      }[]
    }
  } | null
}

export function TeamGenerator() {
  const [games, setGames] = useState<Game[]>([])
  const [selectedGameId, setSelectedGameId] = useState<string>("")
  const [selectedGame, setSelectedGame] = useState<Game | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch upcoming games
  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await fetch("/api/games?status=upcoming")
        if (!response.ok) {
          throw new Error("Failed to fetch games")
        }

        const data = await response.json()
        setGames(data)

        // Select the most recent game by default
        if (data.length > 0) {
          setSelectedGameId(data[0].id)
        }
      } catch (error) {
        console.error("Error fetching games:", error)
        toast({
          title: "Error",
          description: "Failed to fetch games",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchGames()
  }, [])

  // Fetch game details when selection changes
  useEffect(() => {
    if (!selectedGameId) return

    const fetchGameDetails = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/games/${selectedGameId}`)
        if (!response.ok) {
          throw new Error("Failed to fetch game details")
        }

        const data = await response.json()
        setSelectedGame(data)
      } catch (error) {
        console.error("Error fetching game details:", error)
        toast({
          title: "Error",
          description: "Failed to fetch game details",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchGameDetails()
  }, [selectedGameId])

  const handleGenerateTeams = async () => {
    if (!selectedGameId) return

    setIsGenerating(true)
    try {
      const response = await fetch(`/api/games/${selectedGameId}/teams`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to generate teams")
      }

      const data = await response.json()

      // Update the selected game with the new teams
      if (selectedGame) {
        setSelectedGame({
          ...selectedGame,
          teams: data,
        })
      }

      toast({
        title: "Teams generated",
        description: "Teams have been balanced based on player ratings.",
      })
    } catch (error) {
      toast({
        title: "Error generating teams",
        description: error instanceof Error ? error.message : "Please try again later",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Team Generator</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <div className="h-40 flex items-center justify-center">
              <Skeleton className="h-6 w-40" />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Generator</CardTitle>
        <CardDescription>Generate balanced teams based on player ratings</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Game</label>
            <Select value={selectedGameId} onValueChange={setSelectedGameId} disabled={games.length === 0}>
              <SelectTrigger>
                <SelectValue placeholder="Select a game" />
              </SelectTrigger>
              <SelectContent>
                {games.length > 0 ? (
                  games.map((game) => (
                    <SelectItem key={game.id} value={game.id}>
                      {new Date(game.date).toLocaleDateString()} - {game.location}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="none" disabled>
                    No upcoming games found
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {selectedGame?.teams ? (
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="font-semibold text-lg mb-2 flex items-center justify-between">
                  Team A<Badge variant="outline">Rating: {selectedGame.teams.teamA.totalRating.toFixed(1)}</Badge>
                </h3>
                <div className="space-y-3 border rounded-md p-3">
                  {selectedGame.teams.teamA.players.map((player) => (
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
                  Team B<Badge variant="outline">Rating: {selectedGame.teams.teamB.totalRating.toFixed(1)}</Badge>
                </h3>
                <div className="space-y-3 border rounded-md p-3">
                  {selectedGame.teams.teamB.players.map((player) => (
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
          ) : selectedGame ? (
            <div className="flex flex-col items-center justify-center py-8">
              <p className="text-muted-foreground mb-4">
                {selectedGame.participants.length < 14
                  ? `Not enough participants (${selectedGame.participants.length}/14) to generate teams`
                  : "Click the button below to generate balanced teams based on player ratings"}
              </p>
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">Select a game to generate teams</div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        {selectedGame?.teams && (
          <Button variant="outline" onClick={handleGenerateTeams} disabled={isGenerating}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Regenerate
          </Button>
        )}
        <Button
          onClick={handleGenerateTeams}
          disabled={isGenerating || !selectedGame || selectedGame.participants.length < 14}
          className={selectedGame?.teams ? "ml-auto" : "ml-auto"}
        >
          {isGenerating ? "Generating..." : selectedGame?.teams ? "Generate New Teams" : "Generate Teams"}
        </Button>
      </CardFooter>
    </Card>
  )
}

