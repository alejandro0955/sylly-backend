// Utility functions for Google Calendar integration

export interface CalendarEvent {
  title: string
  description?: string
  startDate: Date
  endDate?: Date
  location?: string
}

export interface StudySession {
  title: string
  date: Date
  duration: number // in hours
  subject: string
  type: 'review' | 'practice' | 'deep-study'
}

// Generate Google Calendar URL for an event
export function generateGoogleCalendarUrl(event: CalendarEvent): string {
  const baseUrl = 'https://calendar.google.com/calendar/render?action=TEMPLATE'
  
  const params = new URLSearchParams({
    text: event.title,
    dates: formatDateRange(event.startDate, event.endDate),
    details: event.description || '',
    location: event.location || ''
  })

  return `${baseUrl}&${params.toString()}`
}

// Format date range for Google Calendar
function formatDateRange(startDate: Date, endDate?: Date): string {
  const start = formatGoogleCalendarDate(startDate)
  const end = endDate ? formatGoogleCalendarDate(endDate) : formatGoogleCalendarDate(new Date(startDate.getTime() + 60 * 60 * 1000)) // 1 hour default
  return `${start}/${end}`
}

// Format date for Google Calendar (YYYYMMDDTHHMMSSZ)
function formatGoogleCalendarDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
}

// Generate study sessions for an exam
export function generateStudySessions(examTitle: string, examDate: Date, subject: string, daysToStudy: number = 7): StudySession[] {
  const sessions: StudySession[] = []
  const examDateTime = new Date(examDate)
  
  // Generate study sessions leading up to the exam
  for (let i = daysToStudy; i > 0; i--) {
    const sessionDate = new Date(examDateTime)
    sessionDate.setDate(examDateTime.getDate() - i)
    
    let sessionType: StudySession['type']
    let duration: number
    let title: string
    
    if (i > 5) {
      // Early sessions: deep study
      sessionType = 'deep-study'
      duration = 2
      title = `${subject} - Deep Study Session`
    } else if (i > 2) {
      // Middle sessions: practice
      sessionType = 'practice'
      duration = 1.5
      title = `${subject} - Practice Problems`
    } else {
      // Final sessions: review
      sessionType = 'review'
      duration = 1
      title = `${subject} - Final Review`
    }
    
    sessions.push({
      title,
      date: sessionDate,
      duration,
      subject,
      type: sessionType
    })
  }
  
  return sessions
}

// Check if an assignment is likely an exam/test
export function isExamOrTest(assignmentTitle: string, assignmentType?: string): boolean {
  const examKeywords = ['exam', 'test', 'midterm', 'final', 'quiz', 'assessment']
  const title = assignmentTitle.toLowerCase()
  const type = assignmentType?.toLowerCase() || ''
  
  return examKeywords.some(keyword => title.includes(keyword) || type.includes(keyword))
}

// Generate calendar event for assignment
export function createAssignmentCalendarEvent(assignment: {
  title: string
  course: string
  dueDate: string
  type?: string
  description?: string
}): CalendarEvent {
  const dueDate = new Date(assignment.dueDate)
  
  // Set due time to end of day if no time specified
  if (dueDate.getHours() === 0 && dueDate.getMinutes() === 0) {
    dueDate.setHours(23, 59, 0, 0)
  }
  
  // Create reminder 1 hour before due time
  const reminderDate = new Date(dueDate.getTime() - 60 * 60 * 1000)
  
  return {
    title: `📚 ${assignment.title} - ${assignment.course}`,
    description: `Course: ${assignment.course}\nType: ${assignment.type || 'Assignment'}\nDue: ${dueDate.toLocaleString()}\n\n${assignment.description || 'Complete and submit this assignment.'}`,
    startDate: reminderDate,
    endDate: dueDate
  }
}

// Generate calendar event for study session
export function createStudySessionCalendarEvent(session: StudySession, examTitle: string): CalendarEvent {
  const endDate = new Date(session.date.getTime() + session.duration * 60 * 60 * 1000)
  
  const description = `Study session for: ${examTitle}
Subject: ${session.subject}
Session type: ${session.type.replace('-', ' ')}
Duration: ${session.duration} hour${session.duration > 1 ? 's' : ''}

📋 Study tips:
${getStudyTips(session.type)}`

  return {
    title: `📖 ${session.title}`,
    description,
    startDate: session.date,
    endDate
  }
}

// Get study tips based on session type
function getStudyTips(sessionType: StudySession['type']): string {
  switch (sessionType) {
    case 'deep-study':
      return `• Focus on understanding core concepts
• Take detailed notes
• Work through examples step by step
• Take breaks every 45 minutes`
    
    case 'practice':
      return `• Solve practice problems
• Time yourself on sample questions
• Identify areas needing more work
• Review mistakes carefully`
    
    case 'review':
      return `• Review notes and key concepts
• Do quick practice questions
• Focus on weak areas
• Get a good night's sleep`
    
    default:
      return '• Stay focused and take breaks as needed'
  }
}