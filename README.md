# Mingle - Social Venue Matching App

A modern, real-time social networking application that connects people at venues through intelligent matching and seamless communication.

## 🚀 Features

### Core Features
- **Real-time Venue Matching**: Check into venues and get matched with nearby users
- **Intelligent Matching Algorithm**: AI-powered compatibility scoring based on interests and preferences
- **Live Chat System**: Real-time messaging with matched users
- **Push Notifications**: Instant alerts for new matches and messages
- **User Verification**: Photo verification system for enhanced security
- **Venue Discovery**: Browse and discover popular venues in your area

### Advanced Features
- **Premium Subscriptions**: Enhanced features for premium users
- **Analytics Dashboard**: Comprehensive user and venue analytics
- **Admin Panel**: Full administrative controls and monitoring
- **Performance Monitoring**: Real-time performance tracking and optimization
- **Security Features**: XSS protection, CSRF tokens, input validation, and encryption

## 🛠 Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Framework**: Tailwind CSS, shadcn/ui
- **State Management**: React Context + Hooks
- **Backend**: Firebase (Auth, Firestore, Functions)
- **Real-time**: WebSocket connections
- **Deployment**: Vercel
- **Testing**: Vitest, React Testing Library
- **Performance**: Framer Motion, Lazy Loading

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Firebase account
- Vercel account (for deployment)

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/mingle-synergy.git
   cd mingle-synergy
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   
   For development (team defaults):
   ```bash
   cp .env.development .env.local
   ```
   
   Or create custom configuration:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Firebase project settings
   ```
   
   Update `.env.local` with your configuration (see Environment Variables section below).
   
   > **Note**: 
   > - Use `.env.local` for your personal config (gitignored)
   > - `.env.development` contains team defaults
   > - `.env.production` is used for production builds
   
   **Required Environment Variables:**
   - All `VITE_FIREBASE_*` variables must be set
   - Get these from your Firebase project settings  
   - See `.env.example` for complete list
   - Files should now exist after running the setup commands above

4. **Firebase Setup**
   - Create a new Firebase project
   - Enable Authentication, Firestore, and Functions
   - Configure security rules
   - Set up hosting (optional)

5. **Run Development Server**
   ```bash
   npm run dev
   ```

## 🔧 Environment Variables

The application uses the following environment variables. Copy `.env.example` to `.env` and configure these values:

### Firebase Configuration (Required)
| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_FIREBASE_API_KEY` | Firebase API key for authentication | `AIzaSyC...` |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Auth domain | `your-project.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID | `your-project-id` |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase Storage bucket | `your-project.appspot.com` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID | `123456789` |
| `VITE_FIREBASE_APP_ID` | Firebase app ID | `1:123456789:web:abcdef` |
| `VITE_FIREBASE_MEASUREMENT_ID` | Firebase Analytics ID | `G-XXXXXXXXXX` |

### Development Settings
| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_DEMO_MODE` | Enable demo mode with mock data | `false` |
| `VITE_USE_MOCK` | Use mock services instead of Firebase | `false` |
| `VITE_ENVIRONMENT` | Application environment | `development` |

### Firebase Emulator Settings (Local Development)
| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_FIREBASE_AUTH_EMULATOR_HOST` | Auth emulator host | `http://localhost:9099` |
| `VITE_FIREBASE_FIRESTORE_EMULATOR_HOST` | Firestore emulator host | `localhost:8080` |
| `VITE_FIREBASE_STORAGE_EMULATOR_HOST` | Storage emulator host | `localhost:9199` |

### Push Notifications
| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_VAPID_PUBLIC_KEY` | VAPID public key for push notifications | Optional |

### Real-time Features
| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_WS_URL` | WebSocket server URL for real-time features | Optional |

### Feature Flags
| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_ENABLE_VERIFICATION` | Enable user verification system | `true` |
| `VITE_ENABLE_RECONNECT` | Enable match reconnection feature | `true` |
| `VITE_ENABLE_PUSH_NOTIFICATIONS` | Enable push notifications | `true` |

### Performance Monitoring
| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_ENABLE_PERFORMANCE_MONITORING` | Enable performance monitoring | `true` |
| `VITE_ENABLE_ERROR_TRACKING` | Enable error tracking | `true` |

### Analytics (Optional)
| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_ANALYTICS_ID` | Analytics tracking ID | Optional |

## 🧪 Testing

### Run Tests
```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage report
npm run test:coverage
```

### Test Coverage
- Unit tests for all components and utilities
- Integration tests for user flows
- E2E tests for critical paths
- Performance and accessibility tests

## 🚀 Deployment

### Vercel Deployment
1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment
```bash
# Build for production
npm run build

# Preview build
npm run preview

# Deploy to Vercel
vercel --prod
```

## 📊 Performance

### Optimizations
- **Code Splitting**: Automatic route-based code splitting
- **Lazy Loading**: Images and components loaded on demand
- **Bundle Optimization**: Tree shaking and minification
- **Caching**: Service worker for offline functionality
- **CDN**: Global content delivery network

### Metrics
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100ms

## 🔒 Security

### Security Features
- **Input Validation**: Comprehensive validation for all user inputs
- **XSS Protection**: HTML sanitization and escaping
- **CSRF Protection**: Token-based CSRF protection
- **Rate Limiting**: API rate limiting to prevent abuse
- **Data Encryption**: Client-side encryption for sensitive data
- **Secure Headers**: CSP, HSTS, and other security headers

### Best Practices
- Regular security audits
- Dependency vulnerability scanning
- Secure coding guidelines
- Penetration testing

## 📱 PWA Features

- **Offline Support**: Core functionality works offline
- **Install Prompt**: Add to home screen functionality
- **Push Notifications**: Real-time notifications
- **Background Sync**: Sync data when online
- **App-like Experience**: Native app feel

## 🎨 Design System

### Components
- **shadcn/ui**: Modern, accessible UI components
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Smooth animations and transitions
- **Responsive Design**: Mobile-first approach

### Accessibility
- **WCAG 2.1 AA**: Full accessibility compliance
- **Keyboard Navigation**: Complete keyboard support
- **Screen Reader**: ARIA labels and semantic HTML
- **Color Contrast**: High contrast ratios

## 📈 Analytics

### User Analytics
- User engagement metrics
- Conversion tracking
- A/B testing support
- Performance monitoring

### Business Analytics
- Revenue tracking
- User growth metrics
- Venue performance
- Match success rates

## 🔧 Development

### Code Quality
- **ESLint**: Code linting and formatting
- **Prettier**: Code formatting
- **TypeScript**: Type safety
- **Husky**: Git hooks for quality checks

### Development Workflow
1. Create feature branch
2. Implement feature with tests
3. Run linting and tests
4. Create pull request
5. Code review and merge

## 📚 API Documentation

### Authentication
```typescript
// Sign in
const user = await signInWithEmailAndPassword(email, password);

// Sign up
const user = await createUserWithEmailAndPassword(email, password);

// Sign out
await signOut();
```

### Venues
```typescript
// Get nearby venues
const venues = await getNearbyVenues(location, radius);

// Check in to venue
const match = await checkInToVenue(venueId, userId);
```

### Messaging
```typescript
// Send message
await sendMessage(matchId, message);

// Get messages
const messages = await getMessages(matchId);
```

## 🚨 Troubleshooting

### Common Issues

**Build Errors**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Firebase Issues**
- Verify environment variables
- Check Firebase project configuration
- Ensure security rules are correct

**Performance Issues**
- Check bundle size with `npm run analyze`
- Optimize images and assets
- Review lazy loading implementation

## 📋 Production Checklist

### Pre-Launch
- [ ] All tests passing
- [ ] Performance benchmarks met
- [ ] Security audit completed
- [ ] Accessibility audit completed
- [ ] SEO optimization
- [ ] Error monitoring configured
- [ ] Analytics tracking verified
- [ ] Backup strategy implemented

### Launch Day
- [ ] Monitor system health
- [ ] Track user engagement
- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Verify payment processing
- [ ] Test push notifications

### Post-Launch
- [ ] Gather user feedback
- [ ] Monitor analytics
- [ ] Plan feature updates
- [ ] Scale infrastructure as needed

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Submit a pull request

### Development Guidelines
- Follow TypeScript best practices
- Write comprehensive tests
- Update documentation
- Follow accessibility guidelines
- Maintain performance standards

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [docs.mingle.com](https://docs.mingle.com)
- **Issues**: [GitHub Issues](https://github.com/your-username/mingle-synergy/issues)
- **Discord**: [Join our community](https://discord.gg/mingle)
- **Email**: support@mingle.com

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the amazing component library
- [Vercel](https://vercel.com/) for hosting and deployment
- [Firebase](https://firebase.google.com/) for backend services
- [Tailwind CSS](https://tailwindcss.com/) for styling

---

**Made with ❤️ by the Mingle Team**
