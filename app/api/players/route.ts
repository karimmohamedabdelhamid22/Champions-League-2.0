import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

// GET all players
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const players = await prisma.user.findMany({
      orderBy: {
        points: "desc",
      },
      select: {
        id: true,
        name: true,
        points: true,
        rating: true,
        image: true,
        participations: {
          select: {
            id: true,
          },
        },
      },
    })

    // Format the response
    const formattedPlayers = players.map((player) => ({
      id: player.id,
      name: player.name,
      points: player.points,
      rating: player.rating,
      image: player.image,
      gamesPlayed: player.participations.length,
    }))

    return NextResponse.json(formattedPlayers)
  } catch (error) {
    console.error("Error fetching players:", error)
    return NextResponse.json({ error: "An error occurred while fetching players" }, { status: 500 })
  }
}

