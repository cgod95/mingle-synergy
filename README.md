# Mingle - Meet People Nearby

Mingle is a location-based social connection app that facilitates real-world meetings between people at the same venues. The app focuses on immediate, in-person interactions rather than extended digital conversations.

## Core Features

- **Venue-Based Discovery:** Find people checked into the same venues as you
- **Minimal Digital Interaction:** Limited to initial interest expression and optional contact sharing
- **Time-Limited Matches:** Matches expire in 3 hours to encourage prompt meetings
- **Venue Zone Indicators:** Specify your location within large venues for easier meetings
- **Selfie Verification:** Ensures user authenticity and safety

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Firebase account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/mingle.git
cd mingle
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the project root with your Firebase configuration:
```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

> **Note:** You can copy `.env.example` to `.env` and replace the placeholder values with your actual Firebase configuration.

4. Start the development server:
```bash
npm run dev
```

### Deployment

To deploy the app to Firebase Hosting:

1. Build the production version:
```bash
npm run build
```

2. Deploy to Firebase:
```bash
npm run deploy
```

## Technology Stack

- **Frontend:** React, TypeScript, Tailwind CSS, shadcn/ui
- **State Management:** React Context API
- **Backend:** Firebase (Authentication, Firestore, Storage)
- **Deployment:** Firebase Hosting
- **Build Tool:** Vite
- **PWA Support:** Service Worker with offline capabilities

## Project Structure

```
src/
├── components/     # Reusable UI components
├── contexts/       # React context providers
├── hooks/          # Custom React hooks
├── pages/          # Page components
├── services/       # Firebase service interfaces
├── types/          # TypeScript type definitions
└── utils/          # Utility functions
```

## Performance Optimizations

Mingle includes several performance optimizations:
- Code splitting with dynamic imports
- Service worker for offline capability
- Image optimization
- Firebase performance monitoring
- Bundle size optimization

## Development Workflow

- Feature branches should be created from `develop`
- Pull requests should target `develop`
- `main` branch is deployed to production

## Offline Support

Mingle implements a service worker that provides:
- Caching of static assets
- Offline fallback page
- Background sync for pending actions

## Analytics

User interactions are tracked anonymously to improve the app experience:
- Venue check-ins/check-outs
- Matches and connections
- Screen views
- Feature usage

## License

This project is licensed under the MIT License - see the LICENSE file for details.

# Mingle Synergy

A React-based social networking app built with Firebase, featuring real-time messaging, venue-based matching, and user verification.

## Features

### Core Features
- **User Authentication**: Firebase Auth integration with email/password and social login
- **Profile Management**: User profiles with photos, bio, and preferences
- **Venue-Based Matching**: Check into venues to discover and match with nearby users
- **Real-Time Messaging**: Chat with matches with message limits and expiration
- **Match Management**: View active matches, handle expirations, and reconnect requests
- **User Verification**: Selfie verification system for enhanced security

### Messaging System
- **Messages Page**: View all active chat conversations
- **Match-Based Chats**: Each match creates a chat conversation
- **Message Limits**: 3 messages per user per match to encourage in-person meetings
- **Match Expiration**: Matches expire after 3 hours to maintain engagement
- **Reconnection Flow**: Ability to reconnect with expired matches

### Navigation
- **Bottom Navigation**: Easy access to venues, matches, messages, requests, and profile
- **Protected Routes**: Authentication-required pages
- **Responsive Design**: Mobile-first design with desktop support

## Pages

### Main Pages
- `/venues` - Browse and check into venues
- `/venue/:id` - Active venue with user grid
- `/matches` - View all matches (active and expired)
- `/messages` - Chat conversations list
- `/chat/:matchId` - Individual chat room
- `/requests` - Reconnect requests from other users
- `/reconnects` - Accepted reconnections
- `/profile` - User profile and settings

### Authentication
- `/sign-in` - User login
- `/sign-up` - User registration
- `/onboarding` - App introduction and setup
- `/create-profile` - Initial profile creation
- `/verification` - Selfie verification

## Technical Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Firebase (Firestore, Auth, Storage)
- **State Management**: React Context API
- **Routing**: React Router v6
- **Real-time**: Firebase Firestore listeners

## Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mingle-synergy
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Firebase**
   - Create a Firebase project
   - Enable Authentication, Firestore, and Storage
   - Copy your Firebase config to `src/firebase/config.ts`

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:8080`

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── venue/          # Venue-related components
│   ├── matches/        # Match-related components
│   └── messaging/      # Messaging components
├── pages/              # Page components
├── services/           # API and service functions
│   ├── firebase/       # Firebase service implementations
│   └── mock/           # Mock services for development
├── context/            # React Context providers
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── styles/             # Global styles
```

## Firebase Configuration

### Firestore Collections
- `users` - User profiles and preferences
- `matches` - Match data with messages
- `venues` - Venue information
- `messages` - Individual messages (if using separate collection)

### Security Rules
Firestore security rules ensure:
- Users can only read/write their own data
- Match participants can only access their match data
- Messages are restricted to match participants

### Indexes
Required Firestore indexes for optimal performance:
- `matches` collection: `userId1 + timestamp`, `userId2 + timestamp`
- `messages` collection: `senderId + recipientId + timestamp`

## Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run tests
- `npm run lint` - Run ESLint

### Code Style
- TypeScript for type safety
- ESLint for code quality
- Prettier for code formatting
- Conventional commits for version control

## Deployment

### Firebase Hosting
1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Initialize: `firebase init hosting`
4. Build: `npm run build`
5. Deploy: `firebase deploy`

### Environment Variables
Create a `.env.local` file with your Firebase configuration:
```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Run tests: `npm test`
5. Commit your changes: `git commit -m 'Add feature'`
6. Push to the branch: `git push origin feature-name`
7. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
