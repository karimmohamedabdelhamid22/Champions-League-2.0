import { NextResponse } from "next/server"
import { setupDatabase } from "@/lib/db-setup"

export async function GET() {
  try {
    const result = await setupDatabase()
    return NextResponse.json(result)
  } catch (error) {
    console.error("Setup error:", error)
    return NextResponse.json({ error: "An error occurred during setup" }, { status: 500 })
  }
}

