"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"
import { Calendar, Clock, Plus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { useRouter } from "next/navigation"

interface Game {
  id: string
  date: Date
  time: string
  location: string
  status: string
}

export function GameManagement() {
  const router = useRouter()
  const [games, setGames] = useState<Game[]>([])
  const [isCreating, setIsCreating] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [newGame, setNewGame] = useState({
    date: "",
    time: "",
    location: "",
  })
  const [open, setOpen] = useState(false)

  // Fetch games
  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await fetch("/api/games")
        if (!response.ok) {
          throw new Error("Failed to fetch games")
        }

        const data = await response.json()

        // Filter upcoming games
        const upcomingGames = data.filter((game: Game) => game.status === "upcoming")

        setGames(upcomingGames)
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

  const handleCreateGame = async () => {
    setIsCreating(true)
    try {
      // Validate inputs
      if (!newGame.date || !newGame.time || !newGame.location) {
        throw new Error("All fields are required")
      }

      const response = await fetch("/api/games", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newGame),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create game")
      }

      const createdGame = await response.json()

      setGames([...games, createdGame])
      setNewGame({ date: "", time: "", location: "" })
      setOpen(false)

      toast({
        title: "Game created",
        description: "New game has been scheduled successfully.",
      })

      router.refresh()
    } catch (error) {
      toast({
        title: "Error creating game",
        description: error instanceof Error ? error.message : "Please try again later",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  const handleCancelGame = async (gameId: string) => {
    try {
      const response = await fetch(`/api/games/${gameId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to cancel game")
      }

      setGames(games.filter((g) => g.id !== gameId))

      toast({
        title: "Game cancelled",
        description: "The game has been cancelled.",
      })

      router.refresh()
    } catch (error) {
      toast({
        title: "Error cancelling game",
        description: error instanceof Error ? error.message : "Please try again later",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Game Management</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between border-b pb-4">
                <div className="space-y-1">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-9 w-16" />
                  <Skeleton className="h-9 w-16" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>Game Management</CardTitle>
          <CardDescription>Schedule and manage upcoming games</CardDescription>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              New Game
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Game</DialogTitle>
              <DialogDescription>Schedule a new football game for your team</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={newGame.date}
                  onChange={(e) => setNewGame({ ...newGame, date: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={newGame.time}
                  onChange={(e) => setNewGame({ ...newGame, time: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={newGame.location}
                  onChange={(e) => setNewGame({ ...newGame, location: e.target.value })}
                  placeholder="e.g. Local Football Field"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreateGame} disabled={isCreating}>
                {isCreating ? "Creating..." : "Create Game"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {games.length > 0 ? (
            games.map((game) => (
              <div key={game.id} className="flex items-center justify-between border-b pb-4">
                <div className="space-y-1">
                  <div className="font-medium">{game.location}</div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="mr-1 h-4 w-4" />
                    {new Date(game.date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="mr-1 h-4 w-4" />
                    {game.time}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="destructive" size="sm" onClick={() => handleCancelGame(game.id)}>
                    Cancel
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-muted-foreground">No upcoming games scheduled</div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

