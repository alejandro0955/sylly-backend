import { useState } from 'react'
import { Navigation } from './components/Navigation'
import { Dashboard } from './components/Dashboard'
import { Courses } from './components/Courses'
import { CalendarView } from './components/CalendarView'
import { Chatbot } from './components/Chatbot'
import { SharedSyllabi } from './components/SharedSyllabi'
import { LoginScreen } from './components/LoginScreen'

interface User {
  name: string
  email: string
}

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [user, setUser] = useState<User | null>(null)

  const handleLogin = (userData: User) => {
    setUser(userData)
  }

  const handleLogout = () => {
    setUser(null)
    setCurrentPage('dashboard')
  }

  // If user is not logged in, show login screen
  if (!user) {
    return <LoginScreen onLogin={handleLogin} />
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onPageChange={setCurrentPage} />
      case 'courses':
        return <Courses />
      case 'calendar':
        return <CalendarView />
      case 'chatbot':
        return <Chatbot />
      case 'syllabi':
        return <SharedSyllabi />
      default:
        return <Dashboard onPageChange={setCurrentPage} />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        user={user}
        onLogin={handleLogin}
        onLogout={handleLogout}
      />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderPage()}
      </main>
    </div>
  )
}