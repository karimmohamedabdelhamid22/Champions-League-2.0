"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"
import { Calendar, MapPin } from "lucide-react"
import { useRouter } from "next/navigation"

interface Game {
  id: string
  date: Date
  location: string
  status: "upcoming" | "completed" | "cancelled"
  participants: any[]
  reserves: any[]
}

interface GameCardProps {
  game: Game
}

export function GameCard({ game }: GameCardProps) {
  const router = useRouter()
  const [isJoining, setIsJoining] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)
  const [hasJoined, setHasJoined] = useState(false)

  const handleJoinGame = async () => {
    setIsJoining(true)
    try {
      const response = await fetch(`/api/games/${game.id}/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to join game")
      }

      const data = await response.json()

      setHasJoined(true)
      toast({
        title: "Success!",
        description: data.message || "You have joined the game.",
      })

      router.refresh()
    } catch (error) {
      toast({
        title: "Failed to join game",
        description: error instanceof Error ? error.message : "Please try again later",
        variant: "destructive",
      })
    } finally {
      setIsJoining(false)
    }
  }

  const handleLeaveGame = async () => {
    setIsLeaving(true)
    try {
      const response = await fetch(`/api/games/${game.id}/join`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to leave game")
      }

      setHasJoined(false)
      toast({
        title: "Success!",
        description: "You have left the game.",
      })

      router.refresh()
    } catch (error) {
      toast({
        title: "Failed to leave game",
        description: error instanceof Error ? error.message : "Please try again later",
        variant: "destructive",
      })
    } finally {
      setIsLeaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Next Game</CardTitle>
        <CardDescription>Join the upcoming football game</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>
              {new Date(game.date).toLocaleDateString()} at {game.time}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>{game.location}</span>
          </div>
          <div className="mt-2">
            <p className="text-sm text-muted-foreground">
              {hasJoined
                ? "You're registered for this game!"
                : "Join now to secure your spot. Remember, the first 14 players get to play, and 4 more can be on the reserve list."}
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        {!hasJoined ? (
          <Button onClick={handleJoinGame} disabled={isJoining} className="w-full">
            {isJoining ? "Joining..." : "Join Game"}
          </Button>
        ) : (
          <Button variant="outline" onClick={handleLeaveGame} disabled={isLeaving} className="w-full">
            {isLeaving ? "Leaving..." : "Leave Game"}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

