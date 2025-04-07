import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

// GET a specific game
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const game = await prisma.game.findUnique({
      where: {
        id: params.id,
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
                image: true,
              },
            },
          },
        },
        teams: {
          include: {
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    rating: true,
                    image: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 })
    }

    // Format the response
    const participants = game.participations
      .filter((p) => p.status === "participant")
      .map((p) => ({
        id: p.user.id,
        name: p.user.name,
        rating: p.user.rating,
        points: p.user.points,
        image: p.user.image,
      }))

    const reserves = game.participations
      .filter((p) => p.status === "reserve")
      .map((p) => ({
        id: p.user.id,
        name: p.user.name,
        rating: p.user.rating,
        points: p.user.points,
        image: p.user.image,
      }))

    let teams = null
    if (game.teams.length === 2) {
      teams = {
        teamA: {
          id: game.teams[0].id,
          name: game.teams[0].name,
          score: game.teams[0].score,
          totalRating: game.teams[0].totalRating,
          players: game.teams[0].members.map((m) => ({
            id: m.user.id,
            name: m.user.name,
            rating: m.user.rating,
            image: m.user.image,
          })),
        },
        teamB: {
          id: game.teams[1].id,
          name: game.teams[1].name,
          score: game.teams[1].score,
          totalRating: game.teams[1].totalRating,
          players: game.teams[1].members.map((m) => ({
            id: m.user.id,
            name: m.user.name,
            rating: m.user.rating,
            image: m.user.image,
          })),
        },
      }
    }

    const formattedGame = {
      id: game.id,
      date: game.date,
      time: game.time,
      location: game.location,
      status: game.status,
      participants,
      reserves,
      teams,
    }

    return NextResponse.json(formattedGame)
  } catch (error) {
    console.error("Error fetching game:", error)
    return NextResponse.json({ error: "An error occurred while fetching the game" }, { status: 500 })
  }
}

// PATCH update a game
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only admins can update games
    if (!session.user.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { date, time, location, status } = await req.json()

    const game = await prisma.game.update({
      where: {
        id: params.id,
      },
      data: {
        ...(date && { date: new Date(date) }),
        ...(time && { time }),
        ...(location && { location }),
        ...(status && { status }),
      },
    })

    return NextResponse.json(game)
  } catch (error) {
    console.error("Error updating game:", error)
    return NextResponse.json({ error: "An error occurred while updating the game" }, { status: 500 })
  }
}

// DELETE a game
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only admins can delete games
    if (!session.user.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    await prisma.game.delete({
      where: {
        id: params.id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting game:", error)
    return NextResponse.json({ error: "An error occurred while deleting the game" }, { status: 500 })
  }
}

