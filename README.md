
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
