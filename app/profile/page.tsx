import type { Metadata } from "next"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { ProfileForm } from "@/components/profile-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star } from "lucide-react"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"

export const metadata: Metadata = {
  title: "Profile",
  description: "Manage your profile and view your stats",
}

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/")
  }

  // Get user data with game history
  const userData = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    include: {
      participations: {
        include: {
          game: true,
        },
        orderBy: {
          game: {
            date: "desc",
          },
        },
      },
    },
  })

  if (!userData) {
    redirect("/")
  }

  // Calculate games played and reserve count
  const gamesPlayed = userData.participations.filter((p) => p.status === "participant").length
  const gamesReserve = userData.participations.filter((p) => p.status === "reserve").length

  // Format game history
  const gameHistory = userData.participations.map((p) => ({
    id: p.game.id,
    date: p.game.date,
    status: p.status,
    rating: p.rating,
    location: p.game.location,
  }))

  const user = {
    id: userData.id,
    name: userData.name,
    email: userData.email,
    points: userData.points,
    rating: userData.rating,
    gamesPlayed,
    gamesReserve,
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="Profile" text="Manage your profile and view your stats" />
      <div className="grid gap-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Points</CardTitle>
              <Badge variant="outline">{user.points}</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{user.points}</div>
              <p className="text-xs text-muted-foreground">+1 point for each game played, +0.5 for reserve</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{user.rating.toFixed(1)}/10</div>
              <p className="text-xs text-muted-foreground">Based on {user.gamesPlayed} games played</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Games Played</CardTitle>
              <Badge variant="outline">{user.gamesPlayed}</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{user.gamesPlayed}</div>
              <p className="text-xs text-muted-foreground">{user.gamesReserve} times as reserve</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Game History</CardTitle>
            <CardDescription>Your participation and ratings from previous games</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {gameHistory.length > 0 ? (
                gameHistory.map((game) => (
                  <div key={game.id} className="flex items-center justify-between border-b pb-4">
                    <div>
                      <p className="font-medium">{new Date(game.date).toLocaleDateString()}</p>
                      <p className="text-sm text-muted-foreground">
                        Status: {game.status === "participant" ? "Played" : "Reserve"}
                      </p>
                      <p className="text-sm text-muted-foreground">Location: {game.location}</p>
                    </div>
                    {game.rating ? (
                      <div className="flex items-center">
                        <Star className="mr-1 h-4 w-4 text-yellow-500" />
                        <span>{game.rating}/10</span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">No rating</span>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground">No game history yet</div>
              )}
            </div>
          </CardContent>
        </Card>

        <ProfileForm user={user} />
      </div>
    </DashboardShell>
  )
}

