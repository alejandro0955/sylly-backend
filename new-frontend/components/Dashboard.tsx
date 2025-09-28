import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Progress } from './ui/progress'
import { 
  BookOpen, 
  Calendar, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Plus,
  TrendingUp,
  ExternalLink,
  Brain
} from 'lucide-react'
import { 
  generateGoogleCalendarUrl, 
  createAssignmentCalendarEvent, 
  isExamOrTest, 
  generateStudySessions, 
  createStudySessionCalendarEvent 
} from '../utils/calendar'

interface DashboardProps {
  onPageChange: (page: string) => void
}

export function Dashboard({ onPageChange }: DashboardProps) {
  const stats = {
    totalCourses: 5,
    completedAssignments: 12,
    pendingAssignments: 4,
    upcomingDeadlines: 3
  }

  const recentCourses = [
    { id: 1, code: 'CS 101', name: 'Introduction to Computer Science', instructor: 'Dr. Smith', color: 'bg-blue-500' },
    { id: 2, code: 'MATH 201', name: 'Calculus II', instructor: 'Prof. Johnson', color: 'bg-green-500' },
    { id: 3, code: 'ENG 102', name: 'English Composition', instructor: 'Ms. Davis', color: 'bg-purple-500' },
  ]

  const upcomingAssignments = [
    { id: 1, title: 'Algorithm Analysis Report', course: 'CS 101', dueDate: '2025-10-02', priority: 'high' },
    { id: 2, title: 'Calculus Problem Set 5', course: 'MATH 201', dueDate: '2025-10-03', priority: 'medium' },
    { id: 3, title: 'Essay Draft', course: 'ENG 102', dueDate: '2025-10-05', priority: 'low' },
  ]

  const weeklyProgress = [
    { day: 'Mon', completed: 3, total: 4 },
    { day: 'Tue', completed: 2, total: 3 },
    { day: 'Wed', completed: 4, total: 5 },
    { day: 'Thu', completed: 1, total: 2 },
    { day: 'Fri', completed: 0, total: 3 },
  ]

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const handleExportToCalendar = (assignment: typeof upcomingAssignments[0]) => {
    const calendarEvent = createAssignmentCalendarEvent({
      title: assignment.title,
      course: assignment.course,
      dueDate: assignment.dueDate,
      type: 'Assignment'
    })
    
    const calendarUrl = generateGoogleCalendarUrl(calendarEvent)
    window.open(calendarUrl, '_blank')
  }

  const handleCreateStudyPlan = (assignment: typeof upcomingAssignments[0]) => {
    if (!isExamOrTest(assignment.title)) {
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

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 rounded-lg p-6">
        <h1 className="text-2xl mb-2">Welcome back! 👋</h1>
        <p className="text-muted-foreground">Here's what's happening with your studies today.</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Courses</p>
                <p className="text-2xl">{stats.totalCourses}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl">{stats.completedAssignments}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/50 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl">{stats.pendingAssignments}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/50 rounded-lg">
                <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Due Soon</p>
                <p className="text-2xl">{stats.upcomingDeadlines}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Courses */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Courses</CardTitle>
            <Button variant="outline" size="sm" onClick={() => onPageChange('courses')}>
              <Plus className="w-4 h-4 mr-2" />
              View All
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentCourses.map((course) => (
              <div key={course.id} className="flex items-center space-x-3 p-3 rounded-lg border">
                <div className={`w-3 h-3 rounded-full ${course.color}`} />
                <div className="flex-1">
                  <p className="font-medium">{course.code}</p>
                  <p className="text-sm text-muted-foreground">{course.name}</p>
                  <p className="text-xs text-muted-foreground">{course.instructor}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Upcoming Assignments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Upcoming Assignments</CardTitle>
            <Button variant="outline" size="sm" onClick={() => onPageChange('calendar')}>
              <Calendar className="w-4 h-4 mr-2" />
              View Calendar
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingAssignments.map((assignment) => (
              <div key={assignment.id} className="p-3 rounded-lg border space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <p className="font-medium">{assignment.title}</p>
                      {isExamOrTest(assignment.title) && (
                        <Brain className="w-3 h-3 text-blue-500" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{assignment.course}</p>
                    <p className="text-xs text-muted-foreground">Due: {assignment.dueDate}</p>
                  </div>
                  <Badge variant="secondary" className={`${getPriorityColor(assignment.priority)} text-white`}>
                    {assignment.priority}
                  </Badge>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleExportToCalendar(assignment)}
                    className="text-xs h-6 px-2"
                  >
                    <ExternalLink className="w-2 h-2 mr-1" />
                    Calendar
                  </Button>
                  
                  {isExamOrTest(assignment.title) && (
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
      </div>

      {/* Weekly Progress */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>This Week's Progress</CardTitle>
          <TrendingUp className="w-5 h-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-4">
            {weeklyProgress.map((day) => (
              <div key={day.day} className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">{day.day}</p>
                <div className="space-y-1">
                  <Progress value={(day.completed / day.total) * 100} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {day.completed}/{day.total}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}