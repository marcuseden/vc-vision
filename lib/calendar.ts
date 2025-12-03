// Google Calendar integration for follow-up scheduling

interface CalendarEvent {
  summary: string
  description?: string
  startTime: Date
  endTime: Date
  attendees?: string[]
}

export async function createCalendarEvent(event: CalendarEvent): Promise<string | null> {
  // This is a placeholder for Google Calendar integration
  // Implement OAuth flow and calendar API calls based on your setup
  
  console.log('Calendar event creation requested:', event)
  
  // TODO: Implement Google Calendar API
  // 1. Authenticate using OAuth 2.0
  // 2. Create event using Calendar API v3
  // 3. Return event ID
  
  return null
}

export async function suggestFollowUpTimes(
  durationMinutes: number = 30,
  daysFromNow: number = 7
): Promise<Date[]> {
  // Generate suggested meeting times
  const suggestions: Date[] = []
  const now = new Date()
  
  // Suggest times: 10am, 2pm, 4pm over the next week (excluding weekends)
  for (let day = 1; day <= daysFromNow; day++) {
    const date = new Date(now)
    date.setDate(date.getDate() + day)
    
    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue
    
    // 10am
    const morning = new Date(date)
    morning.setHours(10, 0, 0, 0)
    suggestions.push(morning)
    
    // 2pm
    const afternoon = new Date(date)
    afternoon.setHours(14, 0, 0, 0)
    suggestions.push(afternoon)
    
    // 4pm
    const lateAfternoon = new Date(date)
    lateAfternoon.setHours(16, 0, 0, 0)
    suggestions.push(lateAfternoon)
  }
  
  return suggestions.slice(0, 5) // Return top 5 suggestions
}

export function formatTimeOptions(dates: Date[]): string[] {
  return dates.map(date => {
    return date.toLocaleString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short',
    })
  })
}

