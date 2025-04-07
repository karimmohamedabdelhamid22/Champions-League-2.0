/**
 * Calculate points for a player based on participation
 * @param isParticipant Whether the player participated in the game
 * @param isReserve Whether the player was on the reserve list
 * @returns Points earned (1 for participant, 0.5 for reserve, 0 otherwise)
 */
export function calculatePoints(isParticipant: boolean, isReserve: boolean): number {
  if (isParticipant) {
    return 1
  } else if (isReserve) {
    return 0.5
  }
  return 0
}

/**
 * Update player points after a game
 * @param currentPoints Current player points
 * @param isParticipant Whether the player participated in the game
 * @param isReserve Whether the player was on the reserve list
 * @returns Updated points
 */
export function updatePlayerPoints(currentPoints: number, isParticipant: boolean, isReserve: boolean): number {
  return currentPoints + calculatePoints(isParticipant, isReserve)
}

