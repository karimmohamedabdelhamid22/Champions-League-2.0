import type { Metadata } from "next"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { GameDetail } from "@/components/game-detail"

export const metadata: Metadata = {
  title: "Game Details",
  description: "View details of a specific game",
}

interface GameDetailPageProps {
  params: {
    id: string
  }
}

export default function GameDetailPage({ params }: GameDetailPageProps) {
  return (
    <DashboardShell>
      <DashboardHeader heading="Game Details" text="View details of this game" />
      <div className="grid gap-8">
        <GameDetail id={params.id} />
      </div>
    </DashboardShell>
  )
}

