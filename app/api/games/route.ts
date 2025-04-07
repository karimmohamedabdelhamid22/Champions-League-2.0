import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

// GET all games
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const url = new URL(req.url)
    const status = url.searchParams.get("status")

    let whereClause = {}
    if (status) {
      whereClause = {
        status,
      }
    }

    const games = await prisma.game.findMany({
      where: whereClause,
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
        teams: {
          include: {
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    rating: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    // Format the response
    const formattedGames = games.map((game) => {
      const participants = game.participations
        .filter((p) => p.status === "participant")
        .map((p) => ({
          id: p.user.id,
          name: p.user.name,
          rating: p.user.rating,
          points: p.user.points,
        }))

      const reserves = game.participations
        .filter((p) => p.status === "reserve")
        .map((p) => ({
          id: p.user.id,
          name: p.user.name,
          rating: p.user.rating,
          points: p.user.points,
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
            })),
          },
        }
      }

      return {
        id: game.id,
        date: game.date,
        time: game.time,
        location: game.location,
        status: game.status,
        participants,
        reserves,
        teams,
      }
    })

    return NextResponse.json(formattedGames)
  } catch (error) {
    console.error("Error fetching games:", error)
    return NextResponse.json({ error: "An error occurred while fetching games" }, { status: 500 })
  }
}

// POST create a new game
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only admins can create games
    if (!session.user.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { date, time, location } = await req.json()

    if (!date || !time || !location) {
      return NextResponse.json({ error: "Date, time, and location are required" }, { status: 400 })
    }

    const game = await prisma.game.create({
      data: {
        date: new Date(date),
        time,
        location,
        status: "upcoming",
      },
    })

    return NextResponse.json(game)
  } catch (error) {
    console.error("Error creating game:", error)
    return NextResponse.json({ error: "An error occurred while creating the game" }, { status: 500 })
  }
}

