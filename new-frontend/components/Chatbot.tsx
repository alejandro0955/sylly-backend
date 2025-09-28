import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Badge } from './ui/badge'
import { ScrollArea } from './ui/scroll-area'
import { 
  MessageSquare, 
  Send, 
  Bot, 
  User,
  Lightbulb,
  BookOpen,
  Calculator,
  PenTool
} from 'lucide-react'

interface Message {
  id: number
  content: string
  sender: 'user' | 'bot'
  timestamp: Date
  suggestions?: string[]
}

export function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      content: "Hi! I'm your academic assistant. I can help you with course planning, study tips, assignment organization, and answer academic questions. What can I help you with today?",
      sender: 'bot',
      timestamp: new Date(),
      suggestions: [
        "Help me plan my study schedule",
        "Explain calculus concepts",
        "Tips for writing essays",
        "How to organize assignments"
      ]
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const quickActions = [
    { icon: BookOpen, label: 'Study Tips', query: 'Give me study tips for better learning' },
    { icon: Calculator, label: 'Math Help', query: 'Help me understand calculus derivatives' },
    { icon: PenTool, label: 'Writing Help', query: 'How to write a good academic essay' },
    { icon: Lightbulb, label: 'Study Plan', query: 'Help me create a study schedule' },
  ]

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages, isTyping])

  const generateBotResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase()
    
    if (message.includes('study') && message.includes('schedule')) {
      return "I'd be happy to help you create a study schedule! Here are some tips:\n\n1. **Assess your workload**: List all your courses and upcoming assignments\n2. **Prioritize**: Focus on urgent and important tasks first\n3. **Time blocking**: Allocate specific time slots for each subject\n4. **Include breaks**: 25-50 minute study sessions with 5-15 minute breaks\n5. **Be realistic**: Don't overpack your schedule\n\nWould you like me to help you plan a specific study session or weekly schedule?"
    }
    
    if (message.includes('calculus') || message.includes('derivative')) {
      return "Calculus derivatives measure the rate of change! Here's a simple breakdown:\n\n**What is a derivative?**\n- It tells you how fast something is changing\n- Think of it as the slope of a curve at any point\n\n**Basic rules:**\n- d/dx(x^n) = nx^(n-1)\n- d/dx(sin x) = cos x\n- d/dx(e^x) = e^x\n\n**Example:**\nIf f(x) = x², then f'(x) = 2x\n\nWould you like me to explain a specific derivative rule or help with a particular problem?"
    }
    
    if (message.includes('essay') || message.includes('writing')) {
      return "Here's how to write a strong academic essay:\n\n**Structure:**\n1. **Introduction**: Hook + thesis statement\n2. **Body paragraphs**: Topic sentence + evidence + analysis\n3. **Conclusion**: Restate thesis + summarize main points\n\n**Tips:**\n- Start with an outline\n- Use clear topic sentences\n- Support arguments with evidence\n- Cite your sources properly\n- Proofread for grammar and clarity\n\n**Common mistakes to avoid:**\n- Weak thesis statements\n- Lack of evidence\n- Poor transitions between paragraphs\n\nWhat type of essay are you working on? I can provide more specific guidance!"
    }
    
    if (message.includes('assignment') || message.includes('organize')) {
      return "Great question! Here's how to stay organized with assignments:\n\n**Digital organization:**\n- Use a calendar app for due dates\n- Create folders for each course\n- Keep a master assignment list\n\n**Prioritization system:**\n- Urgent + Important = Do first\n- Important but not urgent = Schedule\n- Urgent but not important = Delegate if possible\n- Neither = Eliminate\n\n**Weekly planning:**\n- Review upcoming deadlines every Sunday\n- Break large projects into smaller tasks\n- Set mini-deadlines for yourself\n\nWould you like help setting up a specific organizational system?"
    }
    
    if (message.includes('stress') || message.includes('overwhelmed')) {
      return "It's completely normal to feel overwhelmed sometimes! Here are some strategies:\n\n**Immediate relief:**\n- Take 5 deep breaths\n- Step away for a 10-minute walk\n- Write down everything on your mind\n\n**Long-term strategies:**\n- Break large tasks into smaller steps\n- Use the Pomodoro Technique (25 min focus + 5 min break)\n- Prioritize self-care (sleep, exercise, healthy eating)\n- Don't hesitate to ask for help\n\n**Academic support:**\n- Visit office hours\n- Form study groups\n- Use campus resources (tutoring, counseling)\n\nRemember: You don't have to do everything perfectly. Progress over perfection!"
    }
    
    // Default responses
    const defaultResponses = [
      "That's an interesting question! Could you provide more details so I can give you a more specific answer?",
      "I'd be happy to help with that! Can you tell me more about what specific area you're struggling with?",
      "Let me help you with that. What course or subject is this related to?",
      "Great question! To give you the best answer, could you share a bit more context about what you're working on?"
    ]
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)]
  }

  const handleSendMessage = () => {
    if (!inputValue.trim()) return

    const newMessage: Message = {
      id: messages.length + 1,
      content: inputValue,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, newMessage])
    setInputValue('')
    setIsTyping(true)

    // Simulate bot typing delay
    setTimeout(() => {
      const botResponse: Message = {
        id: messages.length + 2,
        content: generateBotResponse(inputValue),
        sender: 'bot',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, botResponse])
      setIsTyping(false)
    }, 1000 + Math.random() * 2000) // Random delay between 1-3 seconds
  }

  const handleQuickAction = (query: string) => {
    setInputValue(query)
    setTimeout(() => handleSendMessage(), 100)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl">AI Academic Assistant</h1>
        <p className="text-muted-foreground">Get help with your studies, assignments, and academic questions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {quickActions.map((action, index) => {
                const Icon = action.icon
                return (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full justify-start h-auto p-3"
                    onClick={() => handleQuickAction(action.query)}
                  >
                    <Icon className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="text-sm text-left">{action.label}</span>
                  </Button>
                )
              })}
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start space-x-2">
                <Lightbulb className="w-4 h-4 mt-0.5 text-yellow-500 flex-shrink-0" />
                <p>Ask specific questions for better help</p>
              </div>
              <div className="flex items-start space-x-2">
                <MessageSquare className="w-4 h-4 mt-0.5 text-blue-500 flex-shrink-0" />
                <p>I can help with study strategies, course planning, and academic writing</p>
              </div>
              <div className="flex items-start space-x-2">
                <BookOpen className="w-4 h-4 mt-0.5 text-green-500 flex-shrink-0" />
                <p>Share your course details for personalized advice</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chat Interface */}
        <div className="lg:col-span-3">
          <Card className="h-[600px] flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bot className="w-5 h-5 text-primary" />
                <span>Academic Assistant</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  Online
                </Badge>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col p-0">
              <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`flex items-start space-x-2 max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                        <div className={`p-2 rounded-full ${message.sender === 'user' ? 'bg-primary' : 'bg-muted'}`}>
                          {message.sender === 'user' ? (
                            <User className="w-4 h-4 text-primary-foreground" />
                          ) : (
                            <Bot className="w-4 h-4 text-muted-foreground" />
                          )}
                        </div>
                        <div className={`p-3 rounded-lg ${
                          message.sender === 'user' 
                            ? 'bg-primary text-primary-foreground ml-auto' 
                            : 'bg-muted'
                        }`}>
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          <p className={`text-xs mt-1 ${
                            message.sender === 'user' 
                              ? 'text-primary-foreground/70' 
                              : 'text-muted-foreground'
                          }`}>
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                          
                          {message.suggestions && (
                            <div className="mt-3 space-y-1">
                              <p className="text-xs text-muted-foreground">Suggested questions:</p>
                              {message.suggestions.map((suggestion, index) => (
                                <Button
                                  key={index}
                                  variant="outline"
                                  size="sm"
                                  className="mr-2 mb-1 h-auto py-1 px-2 text-xs"
                                  onClick={() => handleQuickAction(suggestion)}
                                >
                                  {suggestion}
                                </Button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="flex items-center space-x-2">
                        <div className="p-2 rounded-full bg-muted">
                          <Bot className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div className="bg-muted p-3 rounded-lg">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
              
              <div className="p-4 border-t">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Ask me anything about your studies..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isTyping}
                  />
                  <Button onClick={handleSendMessage} disabled={!inputValue.trim() || isTyping}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}