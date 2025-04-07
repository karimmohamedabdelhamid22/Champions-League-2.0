"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { toast } from "@/hooks/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User } from "lucide-react"
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
}

export function PlayerRatings() {
  const [games, setGames] = useState<Game[]>([])
  const [selectedGameId, setSelectedGameId] = useState<string>("")
  const [participants, setParticipants] = useState<Game["participants"]>([])
  const [ratings, setRatings] = useState<Record<string, string>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch completed games
  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await fetch("/api/games?status=completed")
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

  // Fetch participants when game selection changes
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
        setParticipants(data.participants)

        // Initialize ratings
        const initialRatings: Record<string, string> = {}
        data.participants.forEach((participant: any) => {
          initialRatings[participant.id] = participant.rating?.toString() || ""
        })
        setRatings(initialRatings)
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

  const handleRatingChange = (playerId: string, value: string) => {
    // Only allow numbers between 1 and 10
    if (value === "" || (/^\d*\.?\d*$/.test(value) && Number.parseFloat(value) <= 10)) {
      setRatings((prev) => ({
        ...prev,
        [playerId]: value,
      }))
    }
  }

  const handleSaveRatings = async () => {
    setIsSaving(true)
    try {
      // Validate all ratings are between 1 and 10
      const ratingEntries = Object.entries(ratings)
      const validRatings = ratingEntries.every(([_, value]) => {
        if (!value) return true // Allow empty ratings (will be skipped)
        const rating = Number.parseFloat(value)
        return !isNaN(rating) && rating >= 1 && rating <= 10
      })

      if (!validRatings) {
        throw new Error("All ratings must be between 1 and 10")
      }

      // Format ratings for API
      const formattedRatings = ratingEntries
        .filter(([_, value]) => value) // Skip empty ratings
        .map(([userId, value]) => ({
          userId,
          rating: Number.parseFloat(value),
        }))

      if (formattedRatings.length === 0) {
        throw new Error("No ratings to save")
      }

      const response = await fetch(`/api/games/${selectedGameId}/ratings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ratings: formattedRatings }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to save ratings")
      }

      toast({
        title: "Ratings saved",
        description: "Player ratings have been updated successfully.",
      })
    } catch (error) {
      toast({
        title: "Error saving ratings",
        description: error instanceof Error ? error.message : "Please try again later",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Player Ratings</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div>
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-16 mt-1" />
                  </div>
                </div>
                <Skeleton className="h-10 w-20" />
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
        <CardTitle>Player Ratings</CardTitle>
        <CardDescription>Assign ratings to players from completed games (1-10)</CardDescription>
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
                    No completed games found
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {selectedGameId && participants.length > 0 ? (
            <div className="space-y-4">
              {participants.map((player) => (
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
                      <p className="text-sm text-muted-foreground">Current rating: {player.rating.toFixed(1)}</p>
                    </div>
                  </div>
                  <Input
                    type="text"
                    value={ratings[player.id] || ""}
                    onChange={(e) => handleRatingChange(player.id, e.target.value)}
                    className="w-20"
                    placeholder="1-10"
                  />
                </div>
              ))}
            </div>
          ) : selectedGameId ? (
            <div className="text-center py-4 text-muted-foreground">No participants found for this game</div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">Select a game to rate players</div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleSaveRatings}
          disabled={isSaving || !selectedGameId || participants.length === 0}
          className="ml-auto"
        >
          {isSaving ? "Saving..." : "Save Ratings"}
        </Button>
      </CardFooter>
    </Card>
  )
}

