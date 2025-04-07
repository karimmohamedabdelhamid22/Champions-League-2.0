"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { ClubIcon as Football } from "lucide-react"

export function MainNav() {
  const pathname = usePathname()

  return (
    <div className="mr-4 flex">
      <Link href="/dashboard" className="mr-6 flex items-center space-x-2">
        <Football className="h-6 w-6" />
        <span className="font-bold">Football Game Manager</span>
      </Link>
      <nav className="flex items-center space-x-6 text-sm font-medium">
        <Link
          href="/dashboard"
          className={cn(
            "transition-colors hover:text-foreground/80",
            pathname === "/dashboard" ? "text-foreground" : "text-foreground/60",
          )}
        >
          Dashboard
        </Link>
        <Link
          href="/profile"
          className={cn(
            "transition-colors hover:text-foreground/80",
            pathname?.startsWith("/profile") ? "text-foreground" : "text-foreground/60",
          )}
        >
          Profile
        </Link>
        <Link
          href="/games"
          className={cn(
            "transition-colors hover:text-foreground/80",
            pathname?.startsWith("/games") ? "text-foreground" : "text-foreground/60",
          )}
        >
          Games
        </Link>
        {/* Admin link would only show for admin users */}
        <Link
          href="/admin"
          className={cn(
            "transition-colors hover:text-foreground/80",
            pathname?.startsWith("/admin") ? "text-foreground" : "text-foreground/60",
          )}
        >
          Admin
        </Link>
      </nav>
    </div>
  )
}

