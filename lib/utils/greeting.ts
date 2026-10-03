/**
 * Returns a time-appropriate greeting based on the current local hour:
 * - 05:00 - 11:59: "Good morning"
 * - 12:00 - 16:59: "Good afternoon"
 * - 17:00 - 04:59: "Good evening"
 */
export function getTimeGreeting(date: Date = new Date()): string {
  const hour = date.getHours()
  if (hour >= 5 && hour < 12) {
    return 'Good morning'
  }
  if (hour >= 12 && hour < 17) {
    return 'Good afternoon'
  }
  return 'Good evening'
}
