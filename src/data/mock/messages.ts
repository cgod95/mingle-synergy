import { Message } from '@/services/messageService';

export const mockMessages: Message[] = [
  // Match m1 (u1 <-> u2)
  {
    id: 'msg1',
    senderId: 'u1',
    text: 'Hey Jordan! Love your art photos.',
    createdAt: new Date(Date.now() - 1000 * 60 * 14)
  },
  {
    id: 'msg2',
    senderId: 'u2',
    text: 'Thanks Alex! Coffee or art talk first?',
    createdAt: new Date(Date.now() - 1000 * 60 * 13)
  },
  {
    id: 'msg3',
    senderId: 'u1',
    text: 'Let\'s do both! What\'s your go-to coffee order?',
    createdAt: new Date(Date.now() - 1000 * 60 * 12)
  },
  // Match m2 (u1 <-> u3)
  {
    id: 'msg4',
    senderId: 'u3',
    text: 'Hey Alex, seen any good live music lately?',
    createdAt: new Date(Date.now() - 1000 * 60 * 59)
  },
  {
    id: 'msg5',
    senderId: 'u1',
    text: 'Last week at Opera Bar! You?',
    createdAt: new Date(Date.now() - 1000 * 60 * 58)
  },
  // Match m3 (u2 <-> u4)
  {
    id: 'msg6',
    senderId: 'u2',
    text: 'Morgan, your travel pics are amazing!',
    createdAt: new Date(Date.now() - 1000 * 60 * 44)
  },
  {
    id: 'msg7',
    senderId: 'u4',
    text: 'Thank you! Next stop: Japan. Ever been?',
    createdAt: new Date(Date.now() - 1000 * 60 * 43)
  },
  // Match m4 (u3 <-> u5)
  {
    id: 'msg8',
    senderId: 'u5',
    text: 'Taylor, what\'s your favorite cocktail?',
    createdAt: new Date(Date.now() - 1000 * 60 * 29)
  },
  {
    id: 'msg9',
    senderId: 'u3',
    text: 'Negroni! You?',
    createdAt: new Date(Date.now() - 1000 * 60 * 28)
  },
  // Match m5 (u4 <-> u6)
  {
    id: 'msg10',
    senderId: 'u6',
    text: 'Morgan, wine or hiking this weekend?',
    createdAt: new Date(Date.now() - 1000 * 60 * 19)
  },
  {
    id: 'msg11',
    senderId: 'u4',
    text: 'Why not both? 🍷⛰️',
    createdAt: new Date(Date.now() - 1000 * 60 * 18)
  },
  // Match m6 (u5 <-> u7)
  {
    id: 'msg12',
    senderId: 'u5',
    text: 'Emma, favorite gym playlist?',
    createdAt: new Date(Date.now() - 1000 * 60 * 9)
  },
  {
    id: 'msg13',
    senderId: 'u7',
    text: 'All 80s, all the time!',
    createdAt: new Date(Date.now() - 1000 * 60 * 8)
  },
  // Match m7 (u6 <-> u8)
  {
    id: 'msg14',
    senderId: 'u8',
    text: 'Riley, best food spot in Sydney?',
    createdAt: new Date(Date.now() - 1000 * 60 * 4)
  },
  {
    id: 'msg15',
    senderId: 'u6',
    text: 'Bondi\'s vegan café! You\'d love it.',
    createdAt: new Date(Date.now() - 1000 * 60 * 3)
  },
  // Match m8 (u7 <-> u9)
  {
    id: 'msg16',
    senderId: 'u9',
    text: 'Emma, what are you reading now?',
    createdAt: new Date(Date.now() - 1000 * 60 * 24)
  },
  {
    id: 'msg17',
    senderId: 'u7',
    text: 'A mystery novel! Want a rec?',
    createdAt: new Date(Date.now() - 1000 * 60 * 23)
  },
  // Match m9 (u8 <-> u10)
  {
    id: 'msg18',
    senderId: 'u10',
    text: 'Michael, your photos are stunning.',
    createdAt: new Date(Date.now() - 1000 * 60 * 49)
  },
  {
    id: 'msg19',
    senderId: 'u8',
    text: 'Thanks! Want to shoot together sometime?',
    createdAt: new Date(Date.now() - 1000 * 60 * 48)
  },
  // Match m10 (u9 <-> u11)
  {
    id: 'msg20',
    senderId: 'u11',
    text: 'Sophia, do you sing as well as cook?',
    createdAt: new Date(Date.now() - 1000 * 60 * 34)
  },
  {
    id: 'msg21',
    senderId: 'u9',
    text: 'Only in the shower! 😂',
    createdAt: new Date(Date.now() - 1000 * 60 * 33)
  },
  // Match m11 (u10 <-> u12)
  {
    id: 'msg22',
    senderId: 'u12',
    text: 'Liam, craft beer or cocktails tonight?',
    createdAt: new Date(Date.now() - 1000 * 60 * 14)
  },
  {
    id: 'msg23',
    senderId: 'u10',
    text: 'Let\'s start with beer!',
    createdAt: new Date(Date.now() - 1000 * 60 * 13)
  },
  // Match m12 (u11 <-> u13)
  {
    id: 'msg24',
    senderId: 'u13',
    text: 'Olivia, ever performed at Opera Bar?',
    createdAt: new Date(Date.now() - 1000 * 60 * 54)
  },
  {
    id: 'msg25',
    senderId: 'u11',
    text: 'Not yet! Maybe you\'ll see me there soon.',
    createdAt: new Date(Date.now() - 1000 * 60 * 53)
  },
  // Match m13 (u12 <-> u14)
  {
    id: 'msg26',
    senderId: 'u14',
    text: 'Noah, what\'s your favorite dish to cook?',
    createdAt: new Date(Date.now() - 1000 * 60 * 39)
  },
  {
    id: 'msg27',
    senderId: 'u12',
    text: 'Homemade pizza! You?',
    createdAt: new Date(Date.now() - 1000 * 60 * 38)
  },
  // Match m14 (u13 <-> u15)
  {
    id: 'msg28',
    senderId: 'u15',
    text: 'Harper, ever run a marathon abroad?',
    createdAt: new Date(Date.now() - 1000 * 60 * 11)
  },
  {
    id: 'msg29',
    senderId: 'u13',
    text: 'Berlin! Best experience ever.',
    createdAt: new Date(Date.now() - 1000 * 60 * 10)
  },
  // Match m15 (u14 <-> u16)
  {
    id: 'msg30',
    senderId: 'u16',
    text: 'Avery, favorite vintage find?',
    createdAt: new Date(Date.now() - 1000 * 60 * 7)
  },
  {
    id: 'msg31',
    senderId: 'u14',
    text: 'A 60s leather jacket! You?',
    createdAt: new Date(Date.now() - 1000 * 60 * 6)
  },
  // Match m16 (u15 <-> u16)
  {
    id: 'msg32',
    senderId: 'u15',
    text: 'Quinn, jazz or poetry night?',
    createdAt: new Date(Date.now() - 1000 * 60 * 2)
  },
  {
    id: 'msg33',
    senderId: 'u16',
    text: 'Both! Let\'s go this Friday.',
    createdAt: new Date(Date.now() - 1000 * 60 * 1)
  }
];

export default mockMessages; 