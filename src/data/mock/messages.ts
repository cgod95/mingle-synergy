import type { Message } from '@/types';

export const mockMessages: Message[] = [
  // Conversation for match m1 (u1 <-> u2)
  {
    id: 'msg1',
    matchId: 'm1',
    senderId: 'u1',
    receiverId: 'u2',
    text: 'Hey! I love the plants here 🌱',
    content: 'Hey! I love the plants here 🌱',
    timestamp: Date.now() - 1000 * 60 * 60 * 2
  },
  {
    id: 'msg2',
    matchId: 'm1',
    senderId: 'u2',
    receiverId: 'u1',
    text: 'Me too! Have you tried the matcha latte?',
    content: 'Me too! Have you tried the matcha latte?',
    timestamp: Date.now() - 1000 * 60 * 60 * 2 + 1000 * 60 * 2
  },
  // Conversation for match m2 (u1 <-> u3)
  {
    id: 'msg3',
    matchId: 'm2',
    senderId: 'u1',
    receiverId: 'u3',
    text: 'Surf\'s up! 🏄',
    content: 'Surf\'s up! 🏄',
    timestamp: Date.now() - 1000 * 60 * 60 * 24
  },
  {
    id: 'msg4',
    matchId: 'm2',
    senderId: 'u3',
    receiverId: 'u1',
    text: 'Always! What\'s your go-to drink here?',
    content: 'Always! What\'s your go-to drink here?',
    timestamp: Date.now() - 1000 * 60 * 60 * 24 + 1000 * 60 * 3
  },
  // Conversation for match m4 (u1 <-> u5) - fizzled
  {
    id: 'msg5',
    matchId: 'm4',
    senderId: 'u1',
    receiverId: 'u5',
    text: 'Did you catch the jazz set?',
    content: 'Did you catch the jazz set?',
    timestamp: Date.now() - 1000 * 60 * 60 * 48
  },
  {
    id: 'msg6',
    matchId: 'm4',
    senderId: 'u5',
    receiverId: 'u1',
    text: 'Yes! The saxophonist was amazing.',
    content: 'Yes! The saxophonist was amazing.',
    timestamp: Date.now() - 1000 * 60 * 60 * 48 + 1000 * 60 * 5
  },
  // Conversation for match m5 (u1 <-> u6) - typo
  {
    id: 'msg7',
    matchId: 'm5',
    senderId: 'u1',
    receiverId: 'u6',
    text: 'Croisant buddies?',
    content: 'Croisant buddies?',
    timestamp: Date.now() - 1000 * 60 * 60 * 3
  },
  {
    id: 'msg8',
    matchId: 'm5',
    senderId: 'u6',
    receiverId: 'u1',
    text: 'Absolutely! Next time, pain au chocolat.',
    content: 'Absolutely! Next time, pain au chocolat.',
    timestamp: Date.now() - 1000 * 60 * 60 * 3 + 1000 * 60 * 2
  },
  // Conversation for match m6 (u1 <-> u7) - late night
  {
    id: 'msg9',
    matchId: 'm6',
    senderId: 'u1',
    receiverId: 'u7',
    text: 'If you could buy any piece here, which would it be?',
    content: 'If you could buy any piece here, which would it be?',
    timestamp: Date.now() - 1000 * 60 * 60 * 6
  },
  {
    id: 'msg10',
    matchId: 'm6',
    senderId: 'u7',
    receiverId: 'u1',
    text: 'The neon cat sculpture, hands down.',
    content: 'The neon cat sculpture, hands down.',
    timestamp: Date.now() - 1000 * 60 * 60 * 6 + 1000 * 60 * 1
  },
  // Rapid-fire exchange for match m2
  {
    id: 'msg11',
    matchId: 'm2',
    senderId: 'u1',
    receiverId: 'u3',
    text: 'Are you here now?',
    content: 'Are you here now?',
    timestamp: Date.now() - 1000 * 60 * 60 * 24 + 1000 * 60 * 4
  },
  {
    id: 'msg12',
    matchId: 'm2',
    senderId: 'u3',
    receiverId: 'u1',
    text: 'Just left! Next time?',
    content: 'Just left! Next time?',
    timestamp: Date.now() - 1000 * 60 * 60 * 24 + 1000 * 60 * 5
  },
  // Edge case: empty conversation for match m3
  // No messages for m3
];

export default mockMessages; 