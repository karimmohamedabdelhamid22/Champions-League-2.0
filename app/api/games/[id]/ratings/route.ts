import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

// POST update player ratings for a game
export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only admins can update ratings
    if (!session.user.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const gameId = params.id
    const { ratings } = await req.json()

    if (!ratings || !Array.isArray(ratings)) {
      return NextResponse.json({ error: "Ratings must be provided as an array" }, { status: 400 })
    }

    // Check if game exists
    const game = await prisma.game.findUnique({
      where: {
        id: gameId,
      },
    })

    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 })
    }

    // Update ratings for each player
    for (const rating of ratings) {
      if (!rating.userId || !rating.rating || rating.rating < 1 || rating.rating > 10) {
        continue
      }

      // Update participation rating
      await prisma.participation.updateMany({
        where: {
          userId: rating.userId,
          gameId,
        },
        data: {
          rating: rating.rating,
        },
      })

      // Calculate new average rating for the user
      const userParticipations = await prisma.participation.findMany({
        where: {
          userId: rating.userId,
          rating: {
            not: null,
          },
        },
        select: {
          rating: true,
        },
      })

      const newRatings = [...userParticipations.map((p) => p.rating as number), rating.rating]
      const averageRating = newRatings.reduce((sum, r) => sum + r, 0) / newRatings.length

      // Update user's overall rating
      await prisma.user.update({
        where: {
          id: rating.userId,
        },
        data: {
          rating: averageRating,
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating ratings:", error)
    return NextResponse.json({ error: "An error occurred while updating ratings" }, { status: 500 })
  }
}

