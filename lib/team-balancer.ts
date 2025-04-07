interface Player {
  id: string
  name: string
  rating: number
}

interface Team {
  players: Player[]
  totalRating: number
}

/**
 * Balances two teams based on player ratings
 * @param players Array of players with ratings
 * @returns Two balanced teams
 */
export function balanceTeams(players: Player[]): { teamA: Player[]; teamB: Player[] } {
  // Sort players by rating (highest to lowest)
  const sortedPlayers = [...players].sort((a, b) => b.rating - a.rating)

  const teamA: Team = { players: [], totalRating: 0 }
  const teamB: Team = { players: [], totalRating: 0 }

  // Distribute players to balance teams
  // Using a "snake draft" approach for balanced teams
  sortedPlayers.forEach((player) => {
    if (teamA.totalRating <= teamB.totalRating) {
      teamA.players.push(player)
      teamA.totalRating += player.rating
    } else {
      teamB.players.push(player)
      teamB.totalRating += player.rating
    }
  })

  return {
    teamA: teamA.players,
    teamB: teamB.players,
  }
}

