import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

// GET user profile
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only allow users to access their own profile or admins to access any profile
    if (session.user.id !== params.id && !session.user.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const user = await prisma.user.findUnique({
      where: {
        id: params.id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        points: true,
        rating: true,
        isAdmin: true,
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

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Calculate games played and reserve count
    const gamesPlayed = user.participations.filter((p) => p.status === "participant").length
    const gamesReserve = user.participations.filter((p) => p.status === "reserve").length

    // Format game history
    const gameHistory = user.participations.map((p) => ({
      id: p.game.id,
      date: p.game.date,
      status: p.status,
      rating: p.rating,
      location: p.game.location,
    }))

    return NextResponse.json({
      ...user,
      gamesPlayed,
      gamesReserve,
      gameHistory,
      participations: undefined, // Remove raw participations data
    })
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json({ error: "An error occurred while fetching user data" }, { status: 500 })
  }
}

// PATCH update user profile
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only allow users to update their own profile
    if (session.user.id !== params.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { name, email } = await req.json()

    // Check if email is already taken by another user
    if (email) {
      const existingUser = await prisma.user.findUnique({
        where: {
          email,
        },
      })

      if (existingUser && existingUser.id !== params.id) {
        return NextResponse.json({ error: "Email is already taken" }, { status: 409 })
      }
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: params.id,
      },
      data: {
        name: name,
        email: email,
      },
      select: {
        id: true,
        name: true,
        email: true,
        points: true,
        rating: true,
        isAdmin: true,
      },
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json({ error: "An error occurred while updating user data" }, { status: 500 })
  }
}

