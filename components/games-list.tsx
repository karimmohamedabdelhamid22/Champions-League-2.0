"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, Users } from "lucide-react"
import Link from "next/link"

// In a real app, this would come from your API
const mockUpcomingGames = [
  {
    id: "1",
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
    time: "18:00",
    location: "Local Football Field",
    participants: 8,
    reserves: 2,
  },
  {
    id: "2",
    date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
    time: "18:00",
    location: "City Sports Center",
    participants: 5,
    reserves: 1,
  },
]

const mockPastGames = [
  {
    id: "3",
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
    time: "18:00",
    location: "Local Football Field",
    participants: 14,
    reserves: 4,
    teamA: { name: "Team A", score: 3 },
    teamB: { name: "Team B", score: 2 },
  },
  {
    id: "4",
    date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 2 weeks ago
    time: "18:00",
    location: "City Sports Center",
    participants: 14,
    reserves: 4,
    teamA: { name: "Team A", score: 1 },
    teamB: { name: "Team B", score: 1 },
  },
  {
    id: "5",
    date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000), // 3 weeks ago
    time: "18:00",
    location: "Community Park",
    participants: 14,
    reserves: 3,
    teamA: { name: "Team A", score: 4 },
    teamB: { name: "Team B", score: 2 },
  },
]

export function GamesList() {
  const [activeTab, setActiveTab] = useState("upcoming")

  return (
    <Card>
      <CardHeader>
        <CardTitle>Games</CardTitle>
        <CardDescription>View all upcoming and past games</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upcoming" onClick={() => setActiveTab("upcoming")}>
              Upcoming Games
            </TabsTrigger>
            <TabsTrigger value="past" onClick={() => setActiveTab("past")}>
              Past Games
            </TabsTrigger>
          </TabsList>
          <TabsContent value="upcoming">
            <div className="space-y-4 mt-4">
              {mockUpcomingGames.map((game) => (
                <div key={game.id} className="flex flex-col md:flex-row md:items-center justify-between border-b pb-4">
                  <div className="space-y-1">
                    <div className="font-medium">{game.location}</div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="mr-1 h-4 w-4" />
                      {game.date.toLocaleDateString()}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="mr-1 h-4 w-4" />
                      {game.time}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Users className="mr-1 h-4 w-4" />
                      {game.participants}/14 players, {game.reserves}/4 reserves
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3 md:mt-0">
                    <Button asChild>
                      <Link href={`/games/${game.id}`}>View Details</Link>
                    </Button>
                  </div>
                </div>
              ))}
              {mockUpcomingGames.length === 0 && (
                <div className="text-center py-4 text-muted-foreground">No upcoming games scheduled</div>
              )}
            </div>
          </TabsContent>
          <TabsContent value="past">
            <div className="space-y-4 mt-4">
              {mockPastGames.map((game) => (
                <div key={game.id} className="flex flex-col md:flex-row md:items-center justify-between border-b pb-4">
                  <div className="space-y-1">
                    <div className="font-medium">{game.location}</div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="mr-1 h-4 w-4" />
                      {game.date.toLocaleDateString()}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="mr-1 h-4 w-4" />
                      {game.time}
                    </div>
                    <div className="text-sm font-medium mt-1">
                      Result: {game.teamA.name} {game.teamA.score} - {game.teamB.score} {game.teamB.name}
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3 md:mt-0">
                    <Button variant="outline" asChild>
                      <Link href={`/games/${game.id}`}>View Details</Link>
                    </Button>
                  </div>
                </div>
              ))}
              {mockPastGames.length === 0 && (
                <div className="text-center py-4 text-muted-foreground">No past games found</div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

