import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Badge } from './ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { 
  Upload, 
  Search, 
  Download, 
  FileText, 
  Filter,
  Calendar,
  User,
  BookOpen,
  Star,
  Eye
} from 'lucide-react'

interface Syllabus {
  id: number
  title: string
  courseCode: string
  courseName: string
  instructor: string
  semester: string
  uploadedBy: string
  uploadDate: string
  downloads: number
  rating: number
  fileSize: string
  description: string
  university: string
}

export function SharedSyllabi() {
  const [syllabi, setSyllabi] = useState<Syllabus[]>([
    {
      id: 1,
      title: 'CS 101 - Introduction to Computer Science Syllabus',
      courseCode: 'CS 101',
      courseName: 'Introduction to Computer Science',
      instructor: 'Dr. Smith',
      semester: 'Fall 2025',
      uploadedBy: 'student123',
      uploadDate: '2025-09-15',
      downloads: 45,
      rating: 4.8,
      fileSize: '2.1 MB',
      description: 'Comprehensive syllabus covering programming fundamentals, algorithms, and data structures.',
      university: 'Tech University'
    },
    {
      id: 2,
      title: 'MATH 201 - Calculus II Course Outline',
      courseCode: 'MATH 201',
      courseName: 'Calculus II',
      instructor: 'Prof. Johnson',
      semester: 'Fall 2025',
      uploadedBy: 'mathstudent',
      uploadDate: '2025-09-12',
      downloads: 32,
      rating: 4.6,
      fileSize: '1.8 MB',
      description: 'Detailed syllabus for Calculus II including integration techniques and applications.',
      university: 'State University'
    },
    {
      id: 3,
      title: 'ENG 102 - English Composition Syllabus',
      courseCode: 'ENG 102',
      courseName: 'English Composition',
      instructor: 'Ms. Davis',
      semester: 'Fall 2025',
      uploadedBy: 'writewell',
      uploadDate: '2025-09-10',
      downloads: 28,
      rating: 4.7,
      fileSize: '1.5 MB',
      description: 'Academic writing course focusing on essay structure, research, and citation.',
      university: 'Liberal Arts College'
    },
    {
      id: 4,
      title: 'PHYS 201 - General Physics II',
      courseCode: 'PHYS 201',
      courseName: 'General Physics II',
      instructor: 'Dr. Wilson',
      semester: 'Spring 2025',
      uploadedBy: 'physicist2025',
      uploadDate: '2025-08-28',
      downloads: 67,
      rating: 4.9,
      fileSize: '3.2 MB',
      description: 'Covers electricity, magnetism, and wave physics with lab components.',
      university: 'Tech University'
    },
    {
      id: 5,
      title: 'HIST 150 - World History Survey',
      courseCode: 'HIST 150',
      courseName: 'World History Survey',
      instructor: 'Prof. Martinez',
      semester: 'Fall 2025',
      uploadedBy: 'historybuff',
      uploadDate: '2025-09-08',
      downloads: 19,
      rating: 4.3,
      fileSize: '2.7 MB',
      description: 'Comprehensive overview of world civilizations from ancient to modern times.',
      university: 'State University'
    }
  ])

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadForm, setUploadForm] = useState({
    title: '',
    courseCode: '',
    courseName: '',
    instructor: '',
    semester: '',
    description: '',
    university: ''
  })

  const filterOptions = [
    { value: 'all', label: 'All Syllabi' },
    { value: 'cs', label: 'Computer Science' },
    { value: 'math', label: 'Mathematics' },
    { value: 'eng', label: 'English' },
    { value: 'phys', label: 'Physics' },
    { value: 'hist', label: 'History' }
  ]

  const filteredSyllabi = syllabi.filter(syllabus => {
    const matchesSearch = searchQuery === '' || 
      syllabus.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      syllabus.courseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      syllabus.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      syllabus.instructor.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesFilter = selectedFilter === 'all' || 
      syllabus.courseCode.toLowerCase().startsWith(selectedFilter)

    return matchesSearch && matchesFilter
  })

  const handleUpload = () => {
    if (uploadForm.title && uploadForm.courseCode && uploadForm.courseName) {
      const newSyllabus: Syllabus = {
        id: syllabi.length + 1,
        title: uploadForm.title,
        courseCode: uploadForm.courseCode,
        courseName: uploadForm.courseName,
        instructor: uploadForm.instructor,
        semester: uploadForm.semester,
        uploadedBy: 'currentuser',
        uploadDate: new Date().toISOString().split('T')[0],
        downloads: 0,
        rating: 0,
        fileSize: '1.2 MB',
        description: uploadForm.description,
        university: uploadForm.university
      }

      setSyllabi([newSyllabus, ...syllabi])
      setUploadForm({
        title: '',
        courseCode: '',
        courseName: '',
        instructor: '',
        semester: '',
        description: '',
        university: ''
      })
      setIsUploading(false)
    }
  }

  const handleDownload = (syllabus: Syllabus) => {
    // In a real app, this would download the actual file
    setSyllabi(prev => prev.map(s => 
      s.id === syllabus.id 
        ? { ...s, downloads: s.downloads + 1 }
        : s
    ))
    
    // Simulate download
    const link = document.createElement('a')
    link.href = '#'
    link.download = `${syllabus.courseCode}_${syllabus.semester}_Syllabus.pdf`
    link.click()
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-3 h-3 ${
              i < Math.floor(rating) 
                ? 'text-yellow-400 fill-current' 
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className="text-xs text-muted-foreground ml-1">({rating})</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl">Shared Syllabi</h1>
          <p className="text-muted-foreground">Find and share course syllabi with your peers</p>
        </div>
        <Dialog open={isUploading} onOpenChange={setIsUploading}>
          <DialogTrigger asChild>
            <Button>
              <Upload className="w-4 h-4 mr-2" />
              Upload Syllabus
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Upload New Syllabus</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="upload-title">Syllabus Title</Label>
                <Input
                  id="upload-title"
                  placeholder="CS 101 - Introduction to Computer Science Syllabus"
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="course-code">Course Code</Label>
                  <Input
                    id="course-code"
                    placeholder="CS 101"
                    value={uploadForm.courseCode}
                    onChange={(e) => setUploadForm({ ...uploadForm, courseCode: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="semester">Semester</Label>
                  <Input
                    id="semester"
                    placeholder="Fall 2025"
                    value={uploadForm.semester}
                    onChange={(e) => setUploadForm({ ...uploadForm, semester: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="course-name">Course Name</Label>
                <Input
                  id="course-name"
                  placeholder="Introduction to Computer Science"
                  value={uploadForm.courseName}
                  onChange={(e) => setUploadForm({ ...uploadForm, courseName: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="instructor">Instructor</Label>
                <Input
                  id="instructor"
                  placeholder="Dr. Smith"
                  value={uploadForm.instructor}
                  onChange={(e) => setUploadForm({ ...uploadForm, instructor: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="university">University</Label>
                <Input
                  id="university"
                  placeholder="Tech University"
                  value={uploadForm.university}
                  onChange={(e) => setUploadForm({ ...uploadForm, university: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="Brief description of the course content..."
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                />
              </div>
              <div className="p-4 border-2 border-dashed border-muted-foreground/25 rounded-lg text-center">
                <FileText className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Click to upload PDF file</p>
                <Button variant="outline" size="sm" className="mt-2">
                  Choose File
                </Button>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsUploading(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpload}>
                  Upload Syllabus
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search syllabi by course, instructor, or title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="border border-border rounded-md px-3 py-2 bg-background text-foreground"
          >
            {filterOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <h3 className="text-2xl font-semibold">{syllabi.length}</h3>
            <p className="text-sm text-muted-foreground">Total Syllabi</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <h3 className="text-2xl font-semibold">{syllabi.reduce((sum, s) => sum + s.downloads, 0)}</h3>
            <p className="text-sm text-muted-foreground">Total Downloads</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <h3 className="text-2xl font-semibold">{new Set(syllabi.map(s => s.university)).size}</h3>
            <p className="text-sm text-muted-foreground">Universities</p>
          </CardContent>
        </Card>
      </div>

      {/* Syllabi Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSyllabi.map((syllabus) => (
          <Card key={syllabus.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg leading-tight">{syllabus.courseCode}</CardTitle>
                  <p className="text-sm text-muted-foreground">{syllabus.courseName}</p>
                </div>
                <Badge variant="secondary">{syllabus.semester}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span>{syllabus.instructor}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <BookOpen className="w-4 h-4 text-muted-foreground" />
                  <span>{syllabus.university}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>Uploaded {syllabus.uploadDate}</span>
                </div>
              </div>

              <p className="text-sm text-muted-foreground line-clamp-2">
                {syllabus.description}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {renderStars(syllabus.rating)}
                </div>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Download className="w-4 h-4" />
                  <span>{syllabus.downloads}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-sm text-muted-foreground">{syllabus.fileSize}</span>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-1" />
                    Preview
                  </Button>
                  <Button size="sm" onClick={() => handleDownload(syllabus)}>
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredSyllabi.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg mb-2">No syllabi found</h3>
          <p className="text-muted-foreground">
            {searchQuery || selectedFilter !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'Be the first to upload a syllabus!'
            }
          </p>
        </div>
      )}
    </div>
  )
}