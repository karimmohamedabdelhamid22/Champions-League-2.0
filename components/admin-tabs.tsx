"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlayerRatings } from "@/components/player-ratings"
import { TeamGenerator } from "@/components/team-generator"
import { GameManagement } from "@/components/game-management"

export function AdminTabs() {
  const [activeTab, setActiveTab] = useState("ratings")

  return (
    <Tabs defaultValue="ratings" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="ratings" onClick={() => setActiveTab("ratings")}>
          Player Ratings
        </TabsTrigger>
        <TabsTrigger value="teams" onClick={() => setActiveTab("teams")}>
          Generate Teams
        </TabsTrigger>
        <TabsTrigger value="games" onClick={() => setActiveTab("games")}>
          Game Management
        </TabsTrigger>
      </TabsList>
      <TabsContent value="ratings">
        <PlayerRatings />
      </TabsContent>
      <TabsContent value="teams">
        <TeamGenerator />
      </TabsContent>
      <TabsContent value="games">
        <GameManagement />
      </TabsContent>
    </Tabs>
  )
}

