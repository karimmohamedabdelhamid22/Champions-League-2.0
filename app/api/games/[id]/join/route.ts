import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

// POST join a game
export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const gameId = params.id

    // Check if game exists and is upcoming
    const game = await prisma.game.findUnique({
      where: {
        id: gameId,
      },
      include: {
        participations: true,
      },
    })

    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 })
    }

    if (game.status !== "upcoming") {
      return NextResponse.json({ error: "Cannot join a game that is not upcoming" }, { status: 400 })
    }

    // Check if user is already participating
    const existingParticipation = await prisma.participation.findFirst({
      where: {
        userId,
        gameId,
      },
    })

    if (existingParticipation) {
      return NextResponse.json({ error: "You are already participating in this game" }, { status: 400 })
    }

    // Get all users with their points to determine participation status
    const users = await prisma.user.findMany({
      orderBy: {
        points: "desc",
      },
      select: {
        id: true,
        points: true,
      },
    })

    // Get current participants and reserves
    const participants = game.participations.filter((p) => p.status === "participant")
    const reserves = game.participations.filter((p) => p.status === "reserve")

    // Determine if user should be participant or reserve
    let status = "reserve"
    if (participants.length < 14) {
      status = "participant"
    } else if (reserves.length >= 4) {
      return NextResponse.json({ error: "Game is full (14 participants and 4 reserves)" }, { status: 400 })
    }

    // Create participation
    const participation = await prisma.participation.create({
      data: {
        userId,
        gameId,
        status,
      },
    })

    return NextResponse.json({
      id: participation.id,
      status,
      message: `You have joined the game as a ${status}`,
    })
  } catch (error) {
    console.error("Error joining game:", error)
    return NextResponse.json({ error: "An error occurred while joining the game" }, { status: 500 })
  }
}

// DELETE leave a game
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const gameId = params.id

    // Check if participation exists
    const participation = await prisma.participation.findFirst({
      where: {
        userId,
        gameId,
      },
    })

    if (!participation) {
      return NextResponse.json({ error: "You are not participating in this game" }, { status: 404 })
    }

    // Delete participation
    await prisma.participation.delete({
      where: {
        id: participation.id,
      },
    })

    // If a participant leaves, promote the first reserve to participant
    if (participation.status === "participant") {
      const firstReserve = await prisma.participation.findFirst({
        where: {
          gameId,
          status: "reserve",
        },
        orderBy: {
          createdAt: "asc",
        },
      })

      if (firstReserve) {
        await prisma.participation.update({
          where: {
            id: firstReserve.id,
          },
          data: {
            status: "participant",
          },
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error leaving game:", error)
    return NextResponse.json({ error: "An error occurred while leaving the game" }, { status: 500 })
  }
}

