import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar,
  Clock,
  BookOpen,
  ExternalLink,
  Brain,
  Plus
} from 'lucide-react'
import { 
  generateGoogleCalendarUrl, 
  createAssignmentCalendarEvent, 
  isExamOrTest, 
  generateStudySessions, 
  createStudySessionCalendarEvent 
} from '../utils/calendar'

interface Assignment {
  id: number
  title: string
  course: string
  courseColor: string
  dueDate: string
  type: string
  priority: 'high' | 'medium' | 'low'
}

export function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<'month' | 'week'>('month')

  const assignments: Assignment[] = [
    { id: 1, title: 'Algorithm Analysis Report', course: 'CS 101', courseColor: 'bg-blue-500', dueDate: '2025-10-02', type: 'Report', priority: 'high' },
    { id: 2, title: 'Calculus Problem Set 5', course: 'MATH 201', courseColor: 'bg-green-500', dueDate: '2025-10-03', type: 'Homework', priority: 'medium' },
    { id: 3, title: 'Essay Draft', course: 'ENG 102', courseColor: 'bg-purple-500', dueDate: '2025-10-05', type: 'Essay', priority: 'low' },
    { id: 4, title: 'Midterm Exam', course: 'MATH 201', courseColor: 'bg-green-500', dueDate: '2025-10-15', type: 'Exam', priority: 'high' },
    { id: 5, title: 'Programming Project', course: 'CS 101', courseColor: 'bg-blue-500', dueDate: '2025-10-08', type: 'Project', priority: 'high' },
    { id: 6, title: 'Literature Review', course: 'ENG 102', courseColor: 'bg-purple-500', dueDate: '2025-10-12', type: 'Paper', priority: 'medium' },
  ]

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    
    // Previous month's trailing days
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevMonthDay = new Date(year, month, -i)
      days.push({
        date: prevMonthDay.getDate(),
        isCurrentMonth: false,
        fullDate: prevMonthDay
      })
    }

    // Current month's days
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        date: day,
        isCurrentMonth: true,
        fullDate: new Date(year, month, day)
      })
    }

    // Next month's leading days
    const totalCells = Math.ceil(days.length / 7) * 7
    for (let day = 1; days.length < totalCells; day++) {
      days.push({
        date: day,
        isCurrentMonth: false,
        fullDate: new Date(year, month + 1, day)
      })
    }

    return days
  }

  const getAssignmentsForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0]
    return assignments.filter(assignment => assignment.dueDate === dateString)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const handleExportToCalendar = (assignment: Assignment) => {
    const calendarEvent = createAssignmentCalendarEvent({
      title: assignment.title,
      course: assignment.course,
      dueDate: assignment.dueDate,
      type: assignment.type
    })
    
    const calendarUrl = generateGoogleCalendarUrl(calendarEvent)
    window.open(calendarUrl, '_blank')
  }

  const handleCreateStudyPlan = (assignment: Assignment) => {
    if (!isExamOrTest(assignment.title, assignment.type)) {
      alert('Study plans are typically created for exams and tests.')
      return
    }

    const examDate = new Date(assignment.dueDate)
    const studySessions = generateStudySessions(assignment.title, examDate, assignment.course, 7)
    
    studySessions.forEach((session, index) => {
      setTimeout(() => {
        const calendarEvent = createStudySessionCalendarEvent(session, assignment.title)
        const calendarUrl = generateGoogleCalendarUrl(calendarEvent)
        window.open(calendarUrl, '_blank')
      }, index * 500)
    })
    
    alert(`Created ${studySessions.length} study session reminders!`)
  }

  const days = getDaysInMonth(currentDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl">Calendar</h1>
          <p className="text-muted-foreground">View your assignments and deadlines</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant={view === 'month' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setView('month')}
          >
            Month
          </Button>
          <Button
            variant={view === 'week' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setView('week')}
          >
            Week
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</span>
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
                    Today
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1 mb-4">
                {daysOfWeek.map(day => (
                  <div key={day} className="p-2 text-center text-sm text-muted-foreground font-medium">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {days.map((day, index) => {
                  const dayAssignments = getAssignmentsForDate(day.fullDate)
                  const isToday = day.fullDate.getTime() === today.getTime()
                  
                  return (
                    <div
                      key={index}
                      className={`min-h-[100px] p-2 border rounded-lg ${
                        day.isCurrentMonth 
                          ? 'bg-card' 
                          : 'bg-muted/50'
                      } ${
                        isToday 
                          ? 'ring-2 ring-primary' 
                          : ''
                      }`}
                    >
                      <div className={`text-sm mb-1 ${
                        day.isCurrentMonth 
                          ? isToday 
                            ? 'font-semibold text-primary' 
                            : 'text-foreground'
                          : 'text-muted-foreground'
                      }`}>
                        {day.date}
                      </div>
                      <div className="space-y-1">
                        {dayAssignments.map(assignment => (
                          <div
                            key={assignment.id}
                            className={`text-xs p-1 rounded truncate ${assignment.courseColor} text-white`}
                            title={assignment.title}
                          >
                            {assignment.title}
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Assignments Sidebar */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="w-5 h-5" />
                <span>Upcoming Assignments</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {assignments
                .filter(assignment => new Date(assignment.dueDate) >= today)
                .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
                .slice(0, 8)
                .map(assignment => (
                  <div key={assignment.id} className="p-3 border rounded-lg space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium text-sm leading-tight">{assignment.title}</h4>
                          {isExamOrTest(assignment.title, assignment.type) && (
                            <Brain className="w-3 h-3 text-blue-500" />
                          )}
                        </div>
                        <Badge variant="secondary" className={getPriorityColor(assignment.priority)}>
                          {assignment.priority}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${assignment.courseColor}`} />
                        <span className="text-xs text-muted-foreground">{assignment.course}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        <span>{assignment.dueDate}</span>
                        <span>•</span>
                        <span>{assignment.type}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleExportToCalendar(assignment)}
                        className="text-xs h-6 px-2"
                      >
                        <ExternalLink className="w-2 h-2 mr-1" />
                        Export
                      </Button>
                      
                      {isExamOrTest(assignment.title, assignment.type) && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleCreateStudyPlan(assignment)}
                          className="text-xs h-6 px-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950 dark:hover:bg-blue-900"
                        >
                          <Plus className="w-2 h-2 mr-1" />
                          Study Plan
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>This Month</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full" />
                  <span className="text-sm">High Priority</span>
                </div>
                <span className="text-sm font-medium">
                  {assignments.filter(a => a.priority === 'high').length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                  <span className="text-sm">Medium Priority</span>
                </div>
                <span className="text-sm font-medium">
                  {assignments.filter(a => a.priority === 'medium').length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                  <span className="text-sm">Low Priority</span>
                </div>
                <span className="text-sm font-medium">
                  {assignments.filter(a => a.priority === 'low').length}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}