import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Separator } from './ui/separator'
import { 
  Mail, 
  Lock, 
  User,
  GraduationCap,
  BookOpen,
  Calendar,
  Share2
} from 'lucide-react'

interface LoginScreenProps {
  onLogin: (user: { name: string; email: string }) => void
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [isSignUp, setIsSignUp] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (isSignUp) {
      if (formData.password !== formData.confirmPassword) {
        alert('Passwords do not match')
        return
      }
    }

    // In a real app, this would authenticate with a backend
    onLogin({
      name: formData.name || 'Student User',
      email: formData.email || 'student@university.edu'
    })
  }

  const handleDemoLogin = () => {
    onLogin({
      name: 'Demo Student',
      email: 'demo@university.edu'
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-blue-950 dark:via-background dark:to-indigo-950 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding */}
        <div className="space-y-6 text-center lg:text-left">
          <div className="space-y-4">
            <h1 className="text-4xl lg:text-6xl font-bold text-primary">
              🎓 Sylly
            </h1>
            <p className="text-xl lg:text-2xl text-muted-foreground">
              Smart Academic Organizer
            </p>
            <p className="text-lg text-muted-foreground max-w-md mx-auto lg:mx-0">
              Centralize your academic life. Manage courses, track assignments, share syllabi, and get AI-powered study assistance.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto lg:mx-0">
            <div className="bg-white/50 dark:bg-card/50 p-4 rounded-lg">
              <BookOpen className="w-8 h-8 text-blue-500 mb-2" />
              <h3 className="font-semibold">Course Management</h3>
              <p className="text-sm text-muted-foreground">Organize all your courses in one place</p>
            </div>
            <div className="bg-white/50 dark:bg-card/50 p-4 rounded-lg">
              <Calendar className="w-8 h-8 text-green-500 mb-2" />
              <h3 className="font-semibold">Assignment Tracking</h3>
              <p className="text-sm text-muted-foreground">Never miss a deadline again</p>
            </div>
            <div className="bg-white/50 dark:bg-card/50 p-4 rounded-lg">
              <Share2 className="w-8 h-8 text-purple-500 mb-2" />
              <h3 className="font-semibold">Syllabus Sharing</h3>
              <p className="text-sm text-muted-foreground">Share and discover course materials</p>
            </div>
            <div className="bg-white/50 dark:bg-card/50 p-4 rounded-lg">
              <GraduationCap className="w-8 h-8 text-orange-500 mb-2" />
              <h3 className="font-semibold">AI Assistant</h3>
              <p className="text-sm text-muted-foreground">Get personalized study help</p>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">
                {isSignUp ? 'Create Account' : 'Welcome Back'}
              </CardTitle>
              <p className="text-center text-muted-foreground">
                {isSignUp 
                  ? 'Join thousands of students organizing their academic life'
                  : 'Sign in to access your academic dashboard'
                }
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                {isSignUp && (
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="name"
                        type="text"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="student@university.edu"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                {isSignUp && (
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                )}

                <Button type="submit" className="w-full">
                  {isSignUp ? 'Create Account' : 'Sign In'}
                </Button>
              </form>

              <div className="relative">
                <Separator />
                <span className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-sm text-muted-foreground">
                  or
                </span>
              </div>

              <Button variant="outline" className="w-full" onClick={handleDemoLogin}>
                Try Demo Account
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-sm text-primary hover:underline"
                >
                  {isSignUp 
                    ? 'Already have an account? Sign in'
                    : "Don't have an account? Sign up"
                  }
                </button>
              </div>

              {!isSignUp && (
                <div className="text-center">
                  <button
                    type="button"
                    className="text-sm text-muted-foreground hover:underline"
                  >
                    Forgot your password?
                  </button>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>Secure authentication powered by industry standards</p>
            <p className="mt-1">Your academic data is protected and private</p>
          </div>
        </div>
      </div>
    </div>
  )
}