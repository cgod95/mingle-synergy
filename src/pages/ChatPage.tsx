import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import config from '@/config'
import { useToast } from '@/components/ui/use-toast'
import ExpiredMatchNotice from '@/components/ExpiredMatchNotice'
import ReconnectionPrompt from '@/components/ReconnectionPrompt'
import { mockMatches } from '@/data/mock'
import { mockUsers } from '@/data/mock'
import { mockMessages } from '@/data/mock'
import { Match, User, Message } from '@/types'
import Layout from '@/components/Layout'
import BottomNav from '@/components/BottomNav'
import { logError } from '@/utils/errorHandler'

// Helper function to check if match has expired (3 hours)
function isMatchExpired(timestamp: number): boolean {
  const now = Date.now()
  const matchAgeMs = now - timestamp
  return matchAgeMs >= 3 * 60 * 60 * 1000 // 3 hours in milliseconds
}

export default function ChatPage() {
  const { matchId } = useParams()
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const { toast } = useToast()

  const [match, setMatch] = useState<Match | null>(null)
  const [message, setMessage] = useState('')
  const [messagesLeft, setMessagesLeft] = useState(3)
  const [expired, setExpired] = useState(false)
  const [userMessageCount, setUserMessageCount] = useState(0)
  const [canSend, setCanSend] = useState(true)
  const [matchData, setMatchData] = useState<Match | null>(null)
  const [isExpired, setIsExpired] = useState(false)
  const [otherUser, setOtherUser] = useState<User | null>(null)
  const [messages, setMessages] = useState<Message[]>([])

  // Fetch match data and check expiration
  useEffect(() => {
    const fetchMatch = async () => {
      if (!matchId) return
      
      try {
        // Find match in mock data
        const foundMatch = mockMatches.find(m => m.id === matchId)
        if (!foundMatch) {
          setMatchData(null)
          setIsExpired(true)
          setExpired(true)
          return
        }
        
        setMatchData(foundMatch)
        
        // Fetch the other user's profile
        if (currentUser) {
          const otherUserId = foundMatch.userId === currentUser.uid ? foundMatch.matchedUserId : foundMatch.userId;
          const otherUserProfile = mockUsers.find(u => u.id === otherUserId);
          setOtherUser(otherUserProfile || null);
        }
        
        // Check for explicit matchExpired flag first
        if (foundMatch.isActive === false) {
          setIsExpired(true)
          setExpired(true)
          return
        }
        
        const expired = isMatchExpired(foundMatch.timestamp)
        setIsExpired(expired)
        setExpired(expired)
        
        if (expired) {
          // Mark match as expired
          foundMatch.isActive = false
          return
        }
        
        setMatch(foundMatch)
        
        // Get messages for this match
        const matchMessages = mockMessages.filter(msg => msg.matchId === matchId)
        setMessages(matchMessages)
        
        if (currentUser) {
          const sentByUser = matchMessages.filter(msg => msg.senderId === currentUser.uid).length
          setMessagesLeft(3 - sentByUser)
        }
      } catch (error) {
        logError(error instanceof Error ? error : new Error('Error fetching match'), { source: 'ChatPage', matchId })
        setExpired(true)
        setIsExpired(true)
      }
    }

    fetchMatch()
  }, [matchId, currentUser])

  // Real-time message count listener
  useEffect(() => {
    if (!matchId || !currentUser?.uid || isExpired) return

    // Simulate real-time updates
    // CRITICAL: Disabled in demo mode - messages are loaded from localStorage, no need for 1-second polling
    // This interval was causing constant re-renders
    if (config.DEMO_MODE) {
      // In demo mode, just load messages once
      const matchMessages = mockMessages.filter(msg => msg.matchId === matchId);
      const count = matchMessages.filter(msg => msg.senderId === currentUser.uid).length;
      setUserMessageCount(count);
      setCanSend(count < 3);
      setMessages(matchMessages);
      return;
    }
    
    const interval = setInterval(() => {
      const matchMessages = mockMessages.filter(msg => msg.matchId === matchId)
      const count = matchMessages.filter(msg => msg.senderId === currentUser.uid).length
      setUserMessageCount(count)
      setCanSend(count < 3)
      setMessages(matchMessages)
    }, 1000)

    return () => clearInterval(interval)
  }, [matchId, currentUser?.uid, isExpired])

  const handleSend = async () => {
    if (!match || !currentUser || message.trim() === '' || messagesLeft <= 0 || expired || isExpired) return

    if (!canSend) {
      toast({
        title: "Message limit reached",
        description: "Reconnect at the venue to chat again.",
        variant: "destructive"
      })
      return
    }

    // Add message to mock data
    const newMessage: Message = {
      id: `msg_${Date.now()}`,
      matchId: match.id,
      senderId: currentUser.uid,
      receiverId: match.matchedUserId || otherUser?.id || '',
      text: message.trim(),
      content: message.trim(),
      timestamp: Date.now()
    }

    // In a real app, this would be saved to the backend
    // For now, we'll just add it to the local state
    setMessages(prev => [...prev, newMessage])

    setMessage('')
    setMessagesLeft(prev => prev - 1)

    toast({
      title: "Message sent",
      description: "Your message has been sent successfully.",
    })
  }

  if (expired || isExpired) {
    return (
      <Layout>
        <div className="p-4 flex flex-col h-screen pb-20">
          <h1 className="text-xl font-bold mb-4">Chat</h1>
          
          {isExpired && otherUser && (
            <ExpiredMatchNotice name={otherUser.name || 'your match'} />
          )}
          
          {isExpired && matchData ? (
            <div className="flex-1 flex items-center justify-center">
              <ReconnectionPrompt name={otherUser?.name || 'your match'} />
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="text-muted-foreground">⏳ This match has expired.</div>
              </div>
            </div>
          )}
        </div>
        <BottomNav />
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="p-4 flex flex-col h-screen pb-20">
        <h1 className="text-xl font-bold mb-4">Chat</h1>

        <div className="flex-1 overflow-y-auto space-y-2">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`w-fit px-3 py-2 rounded-lg ${
                msg.senderId === currentUser?.uid ? 'ml-auto bg-blue-100' : 'bg-gray-100'
              }`}
            >
              {msg.text}
            </div>
          ))}
        </div>

        {isExpired ? (
          <div className="text-sm text-center text-muted-foreground mt-4">
            This match expired after 3 hours. You can rematch by liking them again.
          </div>
        ) : (
          <>
            {messagesLeft > 0 && (
              <div className="mt-4 flex gap-2">
                <input
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder={`Message (${messagesLeft} left)`}
                  className="flex-1 border p-2 rounded-lg"
                  disabled={isExpired}
                />
                <button 
                  onClick={handleSend} 
                  className="bg-black text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isExpired}
                >
                  Send
                </button>
              </div>
            )}

            {!canSend && (
              <p className="text-sm text-red-500 mt-2">
                You've sent 3 messages. Wait for a reply or reconnect.
              </p>
            )}
          </>
        )}
      </div>
      <BottomNav />
    </Layout>
  )
} 