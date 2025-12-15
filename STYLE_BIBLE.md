# Mingle Style Bible & Design System

**Version:** 1.0  
**Last Updated:** January 2025  
**Purpose:** Comprehensive design system reference for all agents and developers working on Mingle

---

## Table of Contents

1. [Brand Identity](#brand-identity)
2. [Color Palette](#color-palette)
3. [Typography](#typography)
4. [Spacing & Layout](#spacing--layout)
5. [Components](#components)
6. [Buttons](#buttons)
7. [Forms & Inputs](#forms--inputs)
8. [Cards & Surfaces](#cards--surfaces)
9. [Navigation](#navigation)
10. [Animations](#animations)
11. [Code Examples](#code-examples)
12. [Do's and Don'ts](#dos-and-donts)

---

## Brand Identity

### Mission
**"No more swiping. No more noise. Just meet people."**

Mingle is the anti-dating app dating app. Users match only when they're actually at the same venue, creating real-world connections through presence, not profiles.

### Design Principles

1. **Dark-First**: All user-facing pages use dark theme (`bg-neutral-900`)
2. **Gradient Accents**: Primary actions use indigo-to-purple gradients
3. **Presence Over Profiles**: UI emphasizes real-time presence at venues
4. **Minimal Friction**: Streamlined flows, clear CTAs
5. **Real-Time Feel**: Animations and live updates convey immediacy

---

## Color Palette

### Primary Colors

#### Indigo-Purple Gradient (Primary CTAs)
```css
/* Main gradient - use for primary buttons, key headings */
bg-gradient-to-r from-indigo-600 to-purple-600
hover:from-indigo-700 hover:to-purple-700

/* Alternative 3-color gradient for hero CTAs */
bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600
```

**Usage:**
- Primary call-to-action buttons
- Landing page hero buttons
- Key navigation elements
- Active states

#### Text Gradient (Headings)
```css
bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 bg-clip-text text-transparent
```

**Usage:**
- Page titles
- Section headers
- Brand name displays

### Background Colors

```css
/* Main page background - ALWAYS use this */
bg-neutral-900

/* Card/elevated surfaces */
bg-neutral-800

/* Cards with transparency */
bg-neutral-800/95 backdrop-blur-sm

/* Borders */
border-neutral-700
border-neutral-800
```

### Text Colors

```css
/* Primary headings */
text-white

/* Body text */
text-neutral-300

/* Secondary/muted text */
text-neutral-500

/* Placeholder text */
text-neutral-500 (in inputs)

/* Error text */
text-red-400

/* Success text */
text-green-400
```

### Accent Colors

```css
/* Success/Positive */
bg-green-600 text-green-300

/* Error/Destructive */
bg-red-600 text-red-300
bg-red-900/30 border-red-700/50 (error containers)

/* Warning */
bg-yellow-600 text-yellow-300

/* Info */
bg-blue-600 text-blue-300
```

### Status Colors

```css
/* Liked badge */
bg-blue-900 text-blue-300 border-blue-700

/* Matched badge */
bg-green-900 text-green-300 border-green-700

/* Active/Online indicator */
bg-green-500

/* Offline indicator */
bg-neutral-500
```

---

## Typography

### Font Families

- **Primary**: System font stack (sans-serif)
- **Monospace**: For code/debug displays only

### Font Sizes

```css
/* Hero/Page Titles */
text-4xl md:text-5xl lg:text-7xl font-bold

/* Section Headers */
text-2xl md:text-3xl font-bold

/* Card Titles */
text-xl font-semibold

/* Body Text */
text-base (16px)

/* Small Text */
text-sm (14px)

/* Extra Small */
text-xs (12px)
```

### Font Weights

- **Bold** (`font-bold`): Headings, CTAs
- **Semibold** (`font-semibold`): Subheadings, button text
- **Medium** (`font-medium`): Emphasis in body text
- **Regular** (`font-normal`): Default body text

### Line Heights

- Default: `leading-normal` (1.5)
- Tight: `leading-tight` (1.25) for headings
- Relaxed: `leading-relaxed` (1.75) for long-form content

---

## Spacing & Layout

### Container Widths

```css
/* Main content container */
max-w-4xl mx-auto px-4 sm:px-6 lg:px-8

/* Full-width sections */
w-full px-4 py-6

/* Card containers */
max-w-sm mx-auto (for forms)
max-w-2xl mx-auto (for content cards)
```

### Padding

```css
/* Page padding */
p-4 sm:p-6 lg:p-8

/* Card padding */
p-6

/* Button padding */
px-6 py-3 (standard)
px-8 py-4 (large CTAs)
px-4 py-2 (small buttons)
```

### Gaps

```css
/* Flex/Grid gaps */
gap-4 (standard)
gap-6 (larger sections)
gap-2 (tight spacing)
```

### Margins

```css
/* Section spacing */
mb-6 (standard)
mb-8 (larger sections)
mb-12 (page sections)

/* Bottom nav spacing */
pb-20 (pages with bottom nav)
pb-16 (pages without)
```

---

## Components

### Page Structure

```tsx
// Standard page layout
<div className="min-h-screen bg-neutral-900">
  <main className="max-w-4xl mx-auto px-4 py-6 pb-20">
    {/* Content */}
  </main>
  <BottomNav /> {/* If needed */}
</div>
```

### Card Structure

```tsx
<Card className="border-2 border-neutral-700 bg-neutral-800 shadow-xl">
  <CardHeader className="text-center space-y-2 pb-6">
    <CardTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
      Title
    </CardTitle>
  </CardHeader>
  <CardContent className="space-y-4">
    {/* Content */}
  </CardContent>
</Card>
```

---

## Buttons

### Primary CTA Button

**Use for:** Main actions, sign-up, check-in, send message

```tsx
<Button
  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-full px-8 py-4 shadow-lg transition-all"
  size="lg"
>
  Get Started
</Button>
```

**Variations:**
- Full width: Add `w-full`
- Smaller: `px-6 py-3` and `size="default"`
- Hero size: `px-16 py-7 text-xl`

### Secondary Button

**Use for:** Less important actions, navigation

```tsx
<Button
  variant="outline"
  className="border-neutral-700 text-neutral-300 hover:bg-neutral-700 hover:text-white rounded-lg px-6 py-2"
>
  Cancel
</Button>
```

### Ghost Button

**Use for:** Tertiary actions, back buttons

```tsx
<Button
  variant="ghost"
  className="text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-lg px-4 py-2"
>
  Back
</Button>
```

### Button States

```tsx
// Disabled
disabled={true}
className="... disabled:opacity-50 disabled:cursor-not-allowed"

// Loading
loading={true}
// Automatically shows spinner

// Active/Pressed
className="... active:scale-[0.98]"
```

### Button Sizes

- **Large** (`size="lg"`): Primary CTAs, hero buttons
- **Default** (`size="default"`): Standard actions
- **Small** (`size="sm"`): Inline actions, compact spaces

---

## Forms & Inputs

### Text Input

```tsx
<Input
  className="bg-neutral-900 border-neutral-700 text-white placeholder:text-neutral-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-neutral-800"
  placeholder="Enter your email"
  type="email"
/>
```

### Form Container

```tsx
<form className="space-y-4">
  <div className="space-y-2">
    <label className="block text-sm font-medium text-neutral-300">
      Email
    </label>
    <Input {...inputProps} />
  </div>
  
  <Button type="submit" className="w-full ...">
    Submit
  </Button>
</form>
```

### Error States

```tsx
{error && (
  <motion.div
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    className="p-3 bg-red-900/30 border border-red-700/50 rounded-lg"
  >
    <p className="text-sm text-red-400">{error}</p>
  </motion.div>
)}
```

---

## Cards & Surfaces

### Standard Card

```tsx
<Card className="border-2 border-neutral-700 bg-neutral-800 shadow-xl rounded-2xl">
  <CardContent className="p-6">
    {/* Content */}
  </CardContent>
</Card>
```

### Elevated Card (with backdrop blur)

```tsx
<div className="bg-neutral-900/95 backdrop-blur-2xl rounded-2xl px-8 py-12 border-2 border-neutral-800 shadow-2xl">
  {/* Content */}
</div>
```

### User Card

```tsx
<div className="bg-neutral-800 rounded-xl border-2 border-neutral-700 p-6 shadow-lg">
  <div className="flex items-center gap-4">
    <Avatar className="w-16 h-16">
      <AvatarImage src={photo} />
      <AvatarFallback>{name[0]}</AvatarFallback>
    </Avatar>
    <div>
      <h3 className="text-white font-semibold">{name}</h3>
      <p className="text-neutral-400 text-sm">{bio}</p>
    </div>
  </div>
</div>
```

---

## Navigation

### Bottom Navigation

```tsx
// Always use BottomNav component
<BottomNav />

// Styling is handled internally:
// - bg-neutral-800/95 backdrop-blur-md
// - border-t border-neutral-700
// - Active state: text-indigo-500
// - Badge: bg-red-500 for unread counts
```

### Back Button

```tsx
<Button
  variant="ghost"
  onClick={() => navigate(-1)}
  className="absolute top-4 left-4 text-neutral-300 hover:text-white border border-neutral-600 hover:border-neutral-500 rounded-lg px-4 py-2 z-10"
>
  <ArrowLeft className="w-4 h-4 mr-2" />
  Back
</Button>
```

### Breadcrumbs

```tsx
<div className="flex items-center gap-2 text-sm text-neutral-500 mb-4">
  <Link to="/" className="hover:text-neutral-300">Home</Link>
  <span>/</span>
  <span className="text-neutral-300">Current Page</span>
</div>
```

---

## Animations

### Page Transitions

```tsx
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
  {/* Content */}
</motion.div>
```

### Button Hover Effects

```tsx
className="... transition-transform hover:scale-[1.02] active:scale-[0.98]"
```

### Loading States

```tsx
// Spinner
<Loader2 className="w-4 h-4 mr-2 animate-spin" />

// Skeleton
<div className="animate-pulse bg-neutral-800 rounded-lg h-20" />
```

### Stagger Animations

```tsx
<motion.div
  initial="hidden"
  animate="visible"
  variants={{
    visible: { transition: { staggerChildren: 0.1 } }
  }}
>
  {items.map((item, i) => (
    <motion.div
      key={i}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {item}
    </motion.div>
  ))}
</motion.div>
```

---

## Code Examples

### Complete Page Template

```tsx
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Layout from '@/components/Layout';
import BottomNav from '@/components/BottomNav';

export default function ExamplePage() {
  return (
    <Layout>
      <div className="min-h-screen bg-neutral-900">
        <main className="max-w-4xl mx-auto px-4 py-6 pb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-6">
              Page Title
            </h1>
            
            <Card className="border-2 border-neutral-700 bg-neutral-800 shadow-xl">
              <CardContent className="p-6">
                <p className="text-neutral-300 mb-4">
                  Content goes here
                </p>
                
                <Button
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-full px-8 py-3 shadow-lg"
                >
                  Primary Action
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </main>
        <BottomNav />
      </div>
    </Layout>
  );
}
```

### Form Template

```tsx
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';

export default function ExampleForm() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);

  return (
    <Card className="border-2 border-neutral-700 bg-neutral-800 shadow-xl">
      <CardHeader className="text-center space-y-2 pb-6">
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
          Form Title
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-neutral-300">
              Email
            </label>
            <Input
              className="bg-neutral-900 border-neutral-700 text-white placeholder:text-neutral-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter your email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-red-900/30 border border-red-700/50 rounded-lg"
            >
              <p className="text-sm text-red-400">{error}</p>
            </motion.div>
          )}

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-full py-3"
          >
            Submit
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
```

---

## Do's and Don'ts

### ✅ DO

- **Always use `bg-neutral-900`** for main page backgrounds
- **Use gradient buttons** for primary CTAs (`from-indigo-600 to-purple-600`)
- **Use `rounded-full`** for primary buttons
- **Use `text-neutral-300`** for body text
- **Add hover states** to all interactive elements
- **Use Framer Motion** for page transitions
- **Include loading states** for async operations
- **Show error states** with red-900/30 backgrounds
- **Use consistent spacing** (gap-4, mb-6, etc.)
- **Add backdrop blur** to sticky headers/footers

### ❌ DON'T

- **Never use light backgrounds** (`bg-white`, `bg-gray-50`) on user-facing pages
- **Never use blue buttons** (`bg-blue-600`) - use gradients instead
- **Never use `rounded-xl`** for primary buttons - use `rounded-full`
- **Never use `text-gray-*`** - use `text-neutral-*` instead
- **Never skip hover states** on buttons/links
- **Never use inline styles** for colors - use Tailwind classes
- **Never mix light/dark themes** on the same page
- **Never use `100px` heights** on buttons (looks broken)
- **Never use `bg-blue-*`** for primary actions
- **Never skip error handling** in forms

---

## Component Library Reference

### shadcn/ui Components Used

- `Button` - All buttons
- `Input` - Form inputs
- `Card`, `CardContent`, `CardHeader`, `CardTitle` - Cards
- `Avatar`, `AvatarImage`, `AvatarFallback` - User avatars
- `Badge` - Status indicators
- `Toast` - Notifications
- `Dialog` - Modals
- `DropdownMenu` - Menus

### Custom Components

- `BottomNav` - Main navigation
- `MingleMLogo` - Brand logo
- `Layout` - Page wrapper
- `PrivateLayout` - Authenticated page wrapper
- `ErrorBoundary` - Error handling
- `LoadingSpinner` - Loading states

---

## Responsive Design

### Breakpoints

```css
/* Mobile first approach */
/* Default: Mobile (< 640px) */
sm: 640px   /* Small tablets */
md: 768px   /* Tablets */
lg: 1024px  /* Desktops */
xl: 1280px  /* Large desktops */
```

### Responsive Patterns

```tsx
// Text sizing
className="text-2xl md:text-3xl lg:text-4xl"

// Padding
className="p-4 sm:p-6 lg:p-8"

// Grid columns
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"

// Flex direction
className="flex flex-col sm:flex-row"
```

---

## Accessibility

### Required Attributes

```tsx
// Buttons
<button aria-label="Close dialog">
  <X />
</button>

// Links
<Link aria-label="Go to profile page">
  Profile
</Link>

// Form inputs
<Input
  aria-label="Email address"
  aria-required="true"
  aria-invalid={hasError}
/>
```

### Focus States

All interactive elements must have visible focus states:

```tsx
className="focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
```

### Color Contrast

- Text on `bg-neutral-900`: Use `text-white` or `text-neutral-300`
- Text on `bg-neutral-800`: Use `text-white` or `text-neutral-300`
- Error text: `text-red-400` on `bg-red-900/30`

---

## Performance Considerations

### Image Optimization

```tsx
// Always use lazy loading for images
<img
  src={src}
  alt={alt}
  loading="lazy"
  className="rounded-lg"
/>
```

### Animation Performance

- Use `transform` and `opacity` for animations (GPU-accelerated)
- Avoid animating `width`, `height`, `top`, `left`
- Use `will-change` sparingly

### Code Splitting

```tsx
// Lazy load heavy components
const HeavyComponent = lazy(() => import('./HeavyComponent'));

<Suspense fallback={<LoadingSpinner />}>
  <HeavyComponent />
</Suspense>
```

---

## Testing Checklist

When implementing new UI components, verify:

- [ ] Dark theme applied (`bg-neutral-900`)
- [ ] Gradient buttons for primary actions
- [ ] Hover states work
- [ ] Focus states visible
- [ ] Responsive on mobile/tablet/desktop
- [ ] Loading states implemented
- [ ] Error states styled correctly
- [ ] Animations smooth (60fps)
- [ ] Accessibility attributes present
- [ ] Consistent spacing used

---

## Quick Reference

### Most Common Patterns

```tsx
// Primary CTA Button
className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-full px-8 py-4 shadow-lg"

// Page Background
className="min-h-screen bg-neutral-900"

// Card
className="border-2 border-neutral-700 bg-neutral-800 shadow-xl rounded-2xl"

// Heading
className="text-3xl font-bold bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 bg-clip-text text-transparent"

// Body Text
className="text-neutral-300"

// Secondary Text
className="text-neutral-500"
```

---

## Version History

- **v1.0** (January 2025): Initial style bible created
  - Standardized dark theme across all pages
  - Defined gradient button system
  - Established spacing and typography scales
  - Documented component patterns

---

## Questions or Updates?

If you find inconsistencies or need to add new patterns:

1. Update this document
2. Update the relevant component files
3. Add examples to the "Code Examples" section
4. Commit with message: `docs: Update style bible - [description]`

---

**Remember:** Consistency is key. When in doubt, refer to this document or existing pages like `LandingPage.tsx`, `SignUp.tsx`, or `VenueDetails.tsx` for reference implementations.


