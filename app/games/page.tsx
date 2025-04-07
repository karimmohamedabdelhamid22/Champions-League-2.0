import type { Metadata } from "next"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { GamesList } from "@/components/games-list"

export const metadata: Metadata = {
  title: "Games",
  description: "View all upcoming and past games",
}

export default function GamesPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Games" text="View all upcoming and past games" />
      <div className="grid gap-8">
        <GamesList />
      </div>
    </DashboardShell>
  )
}

