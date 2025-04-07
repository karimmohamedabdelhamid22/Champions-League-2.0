import type { Metadata } from "next"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { AdminTabs } from "@/components/admin-tabs"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: "Admin",
  description: "Manage games, assign ratings, and create teams",
}

export default async function AdminPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/")
  }

  // Check if user is admin
  if (!session.user.isAdmin) {
    redirect("/dashboard")
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="Admin Panel" text="Manage games, assign ratings, and create teams" />
      <div className="grid gap-8">
        <AdminTabs />
      </div>
    </DashboardShell>
  )
}

