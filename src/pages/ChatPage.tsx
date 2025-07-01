import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { collection, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore'
import { firestore } from '@/firebase/config'
import { FirestoreMatch } from '@/types/match'
import matchService, { expireMatch } from '@/services/firebase/matchService'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/components/ui/use-toast'
import ExpiredMatchNotice from '@/components/ExpiredMatchNotice'
import ReconnectionPrompt from '@/components/ReconnectionPrompt'
import userService from '@/services/firebase/userService'
import { UserProfile } from '@/types/UserProfile'

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

  const [match, setMatch] = useState<FirestoreMatch | null>(null)
  const [message, setMessage] = useState('')
  const [messagesLeft, setMessagesLeft] = useState(3)
  const [expired, setExpired] = useState(false)
  const [userMessageCount, setUserMessageCount] = useState(0)
  const [canSend, setCanSend] = useState(true)
  const [matchData, setMatchData] = useState<FirestoreMatch | null>(null)
  const [isExpired, setIsExpired] = useState(false)
  const [otherUser, setOtherUser] = useState<UserProfile | null>(null)

  // Fetch match data and check expiration
  useEffect(() => {
    const fetchMatch = async () => {
      if (!matchId) return
      
      try {
        const docSnap = await getDoc(doc(firestore, "matches", matchId))
        if (!docSnap.exists()) {
          setMatchData(null)
          setIsExpired(true)
          setExpired(true)
          return
        }
        
        const data = docSnap.data() as FirestoreMatch
        setMatchData(data)
        
        // Fetch the other user's profile
        if (currentUser) {
          const otherUserId = data.userId1 === currentUser.uid ? data.userId2 : data.userId1;
          try {
            const userProfile = await userService.getUserProfile(otherUserId);
            setOtherUser(userProfile);
          } catch (error) {
            console.error('Error fetching other user profile:', error);
          }
        }
        
        // Check for explicit matchExpired flag first
        if (data.matchExpired) {
          setIsExpired(true)
          setExpired(true)
          return
        }
        
        const expired = isMatchExpired(data.timestamp)
        setIsExpired(expired)
        setExpired(expired)
        
        if (expired) {
          // Mark match as expired instead of deleting
          await expireMatch(matchId)
          return
        }
        
        setMatch(data)
        
        if (currentUser) {
          const sentByUser = data.messages.filter(msg => msg.senderId === currentUser.uid).length
          setMessagesLeft(3 - sentByUser)
        }
      } catch (error) {
        console.error('Error fetching match:', error)
        setExpired(true)
        setIsExpired(true)
      }
    }

    fetchMatch()
  }, [matchId, currentUser])

  // Real-time message count listener
  useEffect(() => {
    if (!matchId || !currentUser?.uid || isExpired) return

    const q = query(
      collection(firestore, "messages"),
      where("matchId", "==", matchId),
      where("senderId", "==", currentUser.uid)
    )

    const unsub = onSnapshot(q, snapshot => {
      const count = snapshot.size
      setUserMessageCount(count)
      setCanSend(count < 3)
    })

    return () => unsub()
  }, [matchId, currentUser.uid, isExpired])

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

    await matchService.sendMessage(match.id, currentUser.uid, message.trim())

    setMessage('')
    setMessagesLeft(prev => prev - 1)

    const updated = await matchService.getMatchById(match.id)
    if (updated) setMatch(updated)
  }

  if (expired || isExpired) {
    return (
      <div className="p-4 flex flex-col h-screen">
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
    )
  }

  return (
    <div className="p-4 flex flex-col h-screen">
      <h1 className="text-xl font-bold mb-4">Chat</h1>

      <div className="flex-1 overflow-y-auto space-y-2">
        {match?.messages.map((msg, index) => (
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
  )
} 