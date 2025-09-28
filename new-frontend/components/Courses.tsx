import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Badge } from './ui/badge'
import { Separator } from './ui/separator'
import { 
  Plus, 
  BookOpen, 
  User, 
  Calendar, 
  FileText,
  Edit,
  Trash2,
  Upload,
  ExternalLink,
  Clock,
  Brain
} from 'lucide-react'
import { 
  generateGoogleCalendarUrl, 
  createAssignmentCalendarEvent, 
  isExamOrTest, 
  generateStudySessions, 
  createStudySessionCalendarEvent 
} from '../utils/calendar'

interface Course {
  id: number
  code: string
  name: string
  instructor: string
  semester: string
  credits: number
  color: string
  assignments: Assignment[]
  syllabusUploaded: boolean
}

interface Assignment {
  id: number
  title: string
  dueDate: string
  status: 'pending' | 'completed' | 'overdue'
  type: string
}

export function Courses() {
  const [courses, setCourses] = useState<Course[]>([
    {
      id: 1,
      code: 'CS 101',
      name: 'Introduction to Computer Science',
      instructor: 'Dr. Smith',
      semester: 'Fall 2025',
      credits: 3,
      color: 'bg-blue-500',
      syllabusUploaded: true,
      assignments: [
        { id: 1, title: 'Algorithm Analysis Report', dueDate: '2025-10-02', status: 'pending', type: 'Report' },
        { id: 2, title: 'Programming Assignment 1', dueDate: '2025-09-25', status: 'completed', type: 'Code' },
      ]
    },
    {
      id: 2,
      code: 'MATH 201',
      name: 'Calculus II',
      instructor: 'Prof. Johnson',
      semester: 'Fall 2025',
      credits: 4,
      color: 'bg-green-500',
      syllabusUploaded: false,
      assignments: [
        { id: 3, title: 'Problem Set 5', dueDate: '2025-10-03', status: 'pending', type: 'Homework' },
        { id: 4, title: 'Midterm Exam', dueDate: '2025-10-15', status: 'pending', type: 'Exam' },
      ]
    },
    {
      id: 3,
      code: 'ENG 102',
      name: 'English Composition',
      instructor: 'Ms. Davis',
      semester: 'Fall 2025',
      credits: 3,
      color: 'bg-purple-500',
      syllabusUploaded: true,
      assignments: [
        { id: 5, title: 'Essay Draft', dueDate: '2025-10-05', status: 'pending', type: 'Essay' },
      ]
    },
  ])

  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [isAddingCourse, setIsAddingCourse] = useState(false)
  const [newCourse, setNewCourse] = useState({
    code: '',
    name: '',
    instructor: '',
    semester: 'Fall 2025',
    credits: 3
  })

  const handleAddCourse = () => {
    if (newCourse.code && newCourse.name && newCourse.instructor) {
      const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-red-500', 'bg-yellow-500', 'bg-indigo-500']
      const newId = Math.max(...courses.map(c => c.id)) + 1
      
      setCourses([...courses, {
        id: newId,
        ...newCourse,
        color: colors[newId % colors.length],
        assignments: [],
        syllabusUploaded: false
      }])
      
      setNewCourse({ code: '', name: '', instructor: '', semester: 'Fall 2025', credits: 3 })
      setIsAddingCourse(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500'
      case 'overdue': return 'bg-red-500'
      default: return 'bg-yellow-500'
    }
  }

  const handleExportToCalendar = (assignment: Assignment, course: Course) => {
    const calendarEvent = createAssignmentCalendarEvent({
      title: assignment.title,
      course: course.code,
      dueDate: assignment.dueDate,
      type: assignment.type,
      description: `Assignment for ${course.name} taught by ${course.instructor}`
    })
    
    const calendarUrl = generateGoogleCalendarUrl(calendarEvent)
    window.open(calendarUrl, '_blank')
  }

  const handleCreateStudyPlan = (assignment: Assignment, course: Course) => {
    if (!isExamOrTest(assignment.title, assignment.type)) {
      alert('Study plans are typically created for exams and tests. This appears to be a regular assignment.')
      return
    }

    const examDate = new Date(assignment.dueDate)
    const studySessions = generateStudySessions(assignment.title, examDate, course.name, 7)
    
    // Open multiple calendar events for study sessions
    studySessions.forEach((session, index) => {
      setTimeout(() => {
        const calendarEvent = createStudySessionCalendarEvent(session, assignment.title)
        const calendarUrl = generateGoogleCalendarUrl(calendarEvent)
        window.open(calendarUrl, '_blank')
      }, index * 500) // Stagger the opens to avoid popup blocking
    })
    
    alert(`Created ${studySessions.length} study session reminders for ${assignment.title}!`)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl">Courses</h1>
          <p className="text-muted-foreground">Manage your courses and track assignments</p>
        </div>
        <Dialog open={isAddingCourse} onOpenChange={setIsAddingCourse}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Course
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Course</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="code">Course Code</Label>
                  <Input
                    id="code"
                    placeholder="CS 101"
                    value={newCourse.code}
                    onChange={(e) => setNewCourse({ ...newCourse, code: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="credits">Credits</Label>
                  <Input
                    id="credits"
                    type="number"
                    min="1"
                    max="6"
                    value={newCourse.credits}
                    onChange={(e) => setNewCourse({ ...newCourse, credits: parseInt(e.target.value) || 3 })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="name">Course Name</Label>
                <Input
                  id="name"
                  placeholder="Introduction to Computer Science"
                  value={newCourse.name}
                  onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="instructor">Instructor</Label>
                <Input
                  id="instructor"
                  placeholder="Dr. Smith"
                  value={newCourse.instructor}
                  onChange={(e) => setNewCourse({ ...newCourse, instructor: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="semester">Semester</Label>
                <Input
                  id="semester"
                  placeholder="Fall 2025"
                  value={newCourse.semester}
                  onChange={(e) => setNewCourse({ ...newCourse, semester: e.target.value })}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsAddingCourse(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddCourse}>
                  Add Course
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <Card key={course.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setSelectedCourse(course)}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full ${course.color}`} />
                  <div>
                    <CardTitle className="text-lg">{course.code}</CardTitle>
                    <p className="text-sm text-muted-foreground">{course.semester}</p>
                  </div>
                </div>
                <Badge variant="secondary">{course.credits} credits</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <h3 className="font-medium mb-2">{course.name}</h3>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-3">
                <User className="w-4 h-4" />
                <span>{course.instructor}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <FileText className="w-4 h-4" />
                  <span>{course.assignments.length} assignments</span>
                </div>
                <div className="flex items-center space-x-1">
                  {course.syllabusUploaded ? (
                    <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      Syllabus ✓
                    </Badge>
                  ) : (
                    <Badge variant="outline">No Syllabus</Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Course Detail Modal */}
      {selectedCourse && (
        <Dialog open={!!selectedCourse} onOpenChange={() => setSelectedCourse(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-3">
                <div className={`w-4 h-4 rounded-full ${selectedCourse.color}`} />
                <span>{selectedCourse.code} - {selectedCourse.name}</span>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Instructor</Label>
                  <p className="text-sm">{selectedCourse.instructor}</p>
                </div>
                <div>
                  <Label>Semester</Label>
                  <p className="text-sm">{selectedCourse.semester}</p>
                </div>
                <div>
                  <Label>Credits</Label>
                  <p className="text-sm">{selectedCourse.credits}</p>
                </div>
                <div>
                  <Label>Syllabus</Label>
                  <div className="flex items-center space-x-2">
                    {selectedCourse.syllabusUploaded ? (
                      <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        Uploaded ✓
                      </Badge>
                    ) : (
                      <Button variant="outline" size="sm">
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Syllabus
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3>Assignments ({selectedCourse.assignments.length})</h3>
                  <Button variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Assignment
                  </Button>
                </div>
                <div className="space-y-3">
                  {selectedCourse.assignments.map((assignment) => (
                    <div key={assignment.id} className="p-3 border rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <p className="font-medium">{assignment.title}</p>
                            {isExamOrTest(assignment.title, assignment.type) && (
                              <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                <Brain className="w-3 h-3 mr-1" />
                                Test/Exam
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span>{assignment.type}</span>
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-3 h-3" />
                              <span>Due: {assignment.dueDate}</span>
                            </div>
                          </div>
                        </div>
                        <Badge className={`${getStatusColor(assignment.status)} text-white`}>
                          {assignment.status}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleExportToCalendar(assignment, selectedCourse)}
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          Add to Calendar
                        </Button>
                        
                        {isExamOrTest(assignment.title, assignment.type) && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleCreateStudyPlan(assignment, selectedCourse)}
                            className="bg-blue-50 hover:bg-blue-100 dark:bg-blue-950 dark:hover:bg-blue-900"
                          >
                            <Clock className="w-3 h-3 mr-1" />
                            Create Study Plan
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  {selectedCourse.assignments.length === 0 && (
                    <p className="text-center text-muted-foreground py-4">No assignments yet</p>
                  )}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}