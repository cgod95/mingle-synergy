import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/components/ui/use-toast'
import { Match } from '@/types/match'
import { UserProfile } from '@/types/services'
import PrivateLayout from '@/components/PrivateLayout';
import BottomNav from '@/components/BottomNav'
import { Button } from '@/components/ui/button'
import logger from '@/utils/Logger';
import matchService from '@/services/firebase/matchService';
import { markMessagesRead } from '@/services/firebase/matchService';
import userService from '@/services/firebase/userService';
import { doc, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { db } from '@/firebase';

// Helper function to check if match has expired (3 hours)
function isMatchExpired(timestamp: number): boolean {
  const now = Date.now()
  const matchAgeMs = now - timestamp
  return matchAgeMs >= 3 * 60 * 60 * 1000 // 3 hours in milliseconds
}

interface Message {
  senderId: string;
  text: string;
  timestamp: number;
}

export default function ChatPage() {
  const { matchId } = useParams<{ matchId: string }>()
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const { toast } = useToast()

  const [match, setMatch] = useState<Match | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [message, setMessage] = useState('')
  const [messagesLeft, setMessagesLeft] = useState(3)
  const [expired, setExpired] = useState(false)
  const [userMessageCount, setUserMessageCount] = useState(0)
  const [canSend, setCanSend] = useState(true)
  const [otherUser, setOtherUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sending, setSending] = useState(false)

  // Real-time listener for match updates
  useEffect(() => {
    if (!matchId || !currentUser) return

    let unsubscribe: Unsubscribe | null = null

    const setupListener = async () => {
      try {
        setLoading(true)
        setError(null)

        // Set up real-time listener for the match document
        const matchRef = doc(db, 'matches', matchId)
        unsubscribe = onSnapshot(matchRef, async (doc) => {
          if (!doc.exists()) {
            setError('Match not found')
            setLoading(false)
            return
          }

          const matchData = doc.data() as Match
          const updatedMatch = { ...matchData, id: doc.id }
          
                     // Check if match has expired
           const matchExpired = isMatchExpired(updatedMatch.timestamp) || (updatedMatch.matchExpired ?? false)
           setExpired(matchExpired)
          setMatch(updatedMatch)
          
          // Update messages
          const sortedMessages = [...updatedMatch.messages].sort((a, b) => a.timestamp - b.timestamp)
          setMessages(sortedMessages)
          
          // Mark messages as read
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          if (sortedMessages.some(msg => msg.senderId !== currentUser.uid && (!('readBy' in msg) || !(msg as any).readBy?.includes(currentUser.uid)))) {
            markMessagesRead(matchId, currentUser.uid);
          }

          // Calculate message count for current user
          const sentByUser = sortedMessages.filter(msg => msg.senderId === currentUser.uid).length
          setUserMessageCount(sentByUser)
          setMessagesLeft(3 - sentByUser)
          setCanSend(sentByUser < 3 && !matchExpired)
          
          // Fetch other user's profile if not already loaded
          if (!otherUser && !matchExpired) {
            const otherUserId = updatedMatch.userId1 === currentUser.uid ? updatedMatch.userId2 : updatedMatch.userId1
            const otherUserProfile = await userService.getUserProfile(otherUserId)
            setOtherUser(otherUserProfile)
          }
          
          setLoading(false)
        }, (error) => {
          logger.error('Error listening to match updates:', error)
          setError('Failed to load match updates')
          setLoading(false)
        })

      } catch (error) {
        logger.error('Error setting up match listener:', error)
        setError('Failed to load match')
        setLoading(false)
      }
    }

    setupListener()

    // Cleanup listener on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [matchId, currentUser, otherUser])

  const handleSend = async () => {
    if (!message.trim() || !canSend || !matchId || !currentUser || !match) return

    try {
      setSending(true)
      setError(null)

      // Use the sendMessage method from matchService
      await matchService.sendMessage(matchId, currentUser.uid, message.trim())
      
      setMessage('')
      
      toast({
        title: "Message sent!",
        description: `You have ${messagesLeft - 1} messages left.`,
      })
    } catch (error) {
      logger.error('Error sending message:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to send message'
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setSending(false)
    }
  }

  const handleReconnect = async () => {
    if (!matchId || !currentUser) return

    try {
      // Use the requestReconnect method from matchService
      await matchService.requestReconnect(matchId, currentUser.uid)
      toast({
        title: "Reconnect requested!",
        description: "The other person will be notified of your request.",
      })
    } catch (error) {
      logger.error('Error requesting reconnect:', error)
      toast({
        title: "Error",
        description: "Failed to request reconnect. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Loading state
  if (loading) {
    return (
      <PrivateLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mingle-primary mx-auto mb-4"></div>
            <p className="text-mingle-muted">Loading chat...</p>
          </div>
        </div>
      </PrivateLayout>
    )
  }

  // Error state
  if (error && !match) {
    return (
      <PrivateLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={() => navigate('/matches')} variant="outline">
              Back to Matches
            </Button>
          </div>
        </div>
      </PrivateLayout>
    )
  }

  // Expired match state
  if (!match || expired) {
    return (
      <PrivateLayout>
        <div className="p-4">
          <div className="bg-white rounded-lg p-6 text-center">
            <h2 className="text-xl font-semibold text-mingle-text mb-2">Match Expired</h2>
            <p className="text-mingle-muted mb-4">
              This match has expired after 3 hours. You can request to reconnect with this person.
            </p>
            <Button onClick={handleReconnect} className="w-full">
              Request Reconnect
            </Button>
          </div>
        </div>
        <BottomNav />
      </PrivateLayout>
    )
  }

  return (
    <PrivateLayout>
      <div className="flex flex-col h-full">
        {/* Chat Header */}
        <div className="bg-white border-b p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              {otherUser?.photos && otherUser.photos.length > 0 ? (
                <img
                  src={otherUser.photos[0]}
                  alt={otherUser.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <span className="text-gray-500">
                  {otherUser?.name?.charAt(0).toUpperCase() || '?'}
                </span>
              )}
            </div>
            <div className="flex-1">
              <h2 className="font-semibold text-mingle-text">{otherUser?.name || 'Unknown'}</h2>
              <p className="text-sm text-mingle-muted">
                {messagesLeft} messages left • {isMatchExpired(match.timestamp) ? 'Expired' : 'Active'}
              </p>
            </div>
            <Button
              onClick={() => navigate('/matches')}
              variant="outline"
              size="sm"
            >
              Back
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-mingle-muted">No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div
                key={`${msg.senderId}-${msg.timestamp}-${index}`}
                className={`flex ${msg.senderId === currentUser?.uid ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${
                    msg.senderId === currentUser?.uid
                      ? 'bg-mingle-primary text-white'
                      : 'bg-gray-100 text-mingle-text'
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Message Input */}
        <div className="bg-white border-t p-4">
          {error && (
            <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-lg mb-3">
              {error}
            </div>
          )}
          
          <div className="flex space-x-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={canSend ? "Type a message..." : "Message limit reached"}
              disabled={!canSend || sending}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mingle-primary focus:border-transparent disabled:bg-gray-100"
            />
            <Button
              onClick={handleSend}
              loading={sending}
              disabled={!canSend || !message.trim() || sending}
              size="sm"
            >
              Send
            </Button>
          </div>
          
          <p className="text-xs text-mingle-muted mt-2 text-center">
            {messagesLeft} messages remaining
          </p>
        </div>
      </div>
      <BottomNav />
    </PrivateLayout>
  )
} 