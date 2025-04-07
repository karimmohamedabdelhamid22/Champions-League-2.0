import type { Metadata } from "next"
import { GameCard } from "@/components/game-card"
import { PlayersList } from "@/components/players-list"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Manage your football games",
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/")
  }

  // Get the next upcoming game
  const upcomingGame = await prisma.game.findFirst({
    where: {
      status: "upcoming",
      date: {
        gte: new Date(),
      },
    },
    orderBy: {
      date: "asc",
    },
    include: {
      participations: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              rating: true,
              points: true,
            },
          },
        },
      },
    },
  })

  // Format the game data
  const formattedGame = upcomingGame
    ? {
        id: upcomingGame.id,
        date: upcomingGame.date,
        time: upcomingGame.time,
        location: upcomingGame.location,
        status: upcomingGame.status,
        participants: upcomingGame.participations
          .filter((p) => p.status === "participant")
          .map((p) => ({
            id: p.user.id,
            name: p.user.name,
            rating: p.user.rating,
            points: p.user.points,
          })),
        reserves: upcomingGame.participations
          .filter((p) => p.status === "reserve")
          .map((p) => ({
            id: p.user.id,
            name: p.user.name,
            rating: p.user.rating,
            points: p.user.points,
          })),
      }
    : {
        id: "0",
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
        time: "18:00",
        location: "No upcoming games",
        status: "upcoming",
        participants: [],
        reserves: [],
      }

  // Check if the current user is participating
  const isParticipating = upcomingGame?.participations.some((p) => p.userId === session.user.id) || false

  return (
    <DashboardShell>
      <DashboardHeader heading="Dashboard" text="View upcoming games and your participation status." />
      <div className="grid gap-8">
        <GameCard game={formattedGame} />
        <PlayersList />
      </div>
    </DashboardShell>
  )
}

