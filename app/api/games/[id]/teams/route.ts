import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { balanceTeams } from "@/lib/team-balancer"

// POST generate teams for a game
export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only admins can generate teams
    if (!session.user.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const gameId = params.id

    // Check if game exists
    const game = await prisma.game.findUnique({
      where: {
        id: gameId,
      },
      include: {
        participations: {
          where: {
            status: "participant",
          },
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
        teams: true,
      },
    })

    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 })
    }

    // Check if we have enough participants
    if (game.participations.length < 14) {
      return NextResponse.json({ error: "Not enough participants to generate teams (need 14)" }, { status: 400 })
    }

    // Delete existing teams if any
    if (game.teams.length > 0) {
      // First delete team members
      for (const team of game.teams) {
        await prisma.teamMember.deleteMany({
          where: {
            teamId: team.id,
          },
        })
      }

      // Then delete teams
      await prisma.team.deleteMany({
        where: {
          gameId,
        },
      })
    }

    // Format players for team balancing
    const players = game.participations.map((p) => ({
      id: p.user.id,
      name: p.user.name,
      rating: p.user.rating,
      image: p.user.image,
    }))

    // Generate balanced teams
    const { teamA: teamAPlayers, teamB: teamBPlayers } = balanceTeams(players)

    // Calculate total ratings
    const teamATotalRating = teamAPlayers.reduce((sum, p) => sum + p.rating, 0)
    const teamBTotalRating = teamBPlayers.reduce((sum, p) => sum + p.rating, 0)

    // Create teams in database
    const teamA = await prisma.team.create({
      data: {
        gameId,
        name: "Team A",
        totalRating: teamATotalRating,
      },
    })

    const teamB = await prisma.team.create({
      data: {
        gameId,
        name: "Team B",
        totalRating: teamBTotalRating,
      },
    })

    // Create team members
    for (const player of teamAPlayers) {
      await prisma.teamMember.create({
        data: {
          teamId: teamA.id,
          userId: player.id,
        },
      })
    }

    for (const player of teamBPlayers) {
      await prisma.teamMember.create({
        data: {
          teamId: teamB.id,
          userId: player.id,
        },
      })
    }

    // Get the teams with members for response
    const [updatedTeamA, updatedTeamB] = await Promise.all([
      prisma.team.findUnique({
        where: { id: teamA.id },
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
      }),
      prisma.team.findUnique({
        where: { id: teamB.id },
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
      }),
    ])

    if (!updatedTeamA || !updatedTeamB) {
      throw new Error("Failed to retrieve updated teams")
    }

    // Format response
    const formattedTeams = {
      teamA: {
        id: updatedTeamA.id,
        name: updatedTeamA.name,
        totalRating: updatedTeamA.totalRating,
        players: updatedTeamA.members.map((m) => ({
          id: m.user.id,
          name: m.user.name,
          rating: m.user.rating,
          image: m.user.image,
        })),
      },
      teamB: {
        id: updatedTeamB.id,
        name: updatedTeamB.name,
        totalRating: updatedTeamB.totalRating,
        players: updatedTeamB.members.map((m) => ({
          id: m.user.id,
          name: m.user.name,
          rating: m.user.rating,
          image: m.user.image,
        })),
      },
    }

    return NextResponse.json(formattedTeams)
  } catch (error) {
    console.error("Error generating teams:", error)
    return NextResponse.json({ error: "An error occurred while generating teams" }, { status: 500 })
  }
}

// PATCH update team scores
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only admins can update scores
    if (!session.user.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const gameId = params.id
    const { teamAScore, teamBScore } = await req.json()

    if (typeof teamAScore !== "number" || typeof teamBScore !== "number") {
      return NextResponse.json({ error: "Team scores must be numbers" }, { status: 400 })
    }

    // Get teams for this game
    const teams = await prisma.team.findMany({
      where: {
        gameId,
      },
      orderBy: {
        createdAt: "asc",
      },
    })

    if (teams.length !== 2) {
      return NextResponse.json({ error: "Teams not found for this game" }, { status: 404 })
    }

    // Update team scores
    await prisma.team.update({
      where: {
        id: teams[0].id,
      },
      data: {
        score: teamAScore,
      },
    })

    await prisma.team.update({
      where: {
        id: teams[1].id,
      },
      data: {
        score: teamBScore,
      },
    })

    // Update game status to completed
    await prisma.game.update({
      where: {
        id: gameId,
      },
      data: {
        status: "completed",
      },
    })

    // Update player points based on participation
    const participations = await prisma.participation.findMany({
      where: {
        gameId,
      },
      include: {
        user: true,
      },
    })

    for (const p of participations) {
      const pointsToAdd = p.status === "participant" ? 1 : p.status === "reserve" ? 0.5 : 0
      await prisma.user.update({
        where: {
          id: p.userId,
        },
        data: {
          points: {
            increment: pointsToAdd,
          },
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating team scores:", error)
    return NextResponse.json({ error: "An error occurred while updating team scores" }, { status: 500 })
  }
}

