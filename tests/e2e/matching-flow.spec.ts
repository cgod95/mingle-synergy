import { test, expect } from '@playwright/test';

test.describe('Matching Flow E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('http://localhost:8080');
    
    // Wait for the app to load
    await page.waitForSelector('[data-testid="app-loaded"]', { timeout: 10000 });
  });

  test('Complete user onboarding and matching flow', async ({ page }) => {
    // Test user registration
    await test.step('User Registration', async () => {
      await page.click('[data-testid="sign-up-button"]');
      
      // Fill registration form
      await page.fill('[data-testid="email-input"]', 'test@example.com');
      await page.fill('[data-testid="password-input"]', 'TestPassword123!');
      await page.click('[data-testid="register-button"]');
      
      // Wait for registration to complete
      await page.waitForSelector('[data-testid="onboarding-start"]', { timeout: 10000 });
    });

    // Test profile creation
    await test.step('Profile Creation', async () => {
      // Upload profile photo
      const fileChooserPromise = page.waitForEvent('filechooser');
      await page.click('[data-testid="upload-photo-button"]');
      const fileChooser = await fileChooserPromise;
      await fileChooser.setFiles('tests/fixtures/profile-photo.jpg');
      
      // Fill profile details
      await page.fill('[data-testid="name-input"]', 'Test User');
      await page.fill('[data-testid="bio-input"]', 'I love meeting new people!');
      
      // Select interests
      await page.click('[data-testid="interest-travel"]');
      await page.click('[data-testid="interest-music"]');
      await page.click('[data-testid="interest-food"]');
      
      await page.click('[data-testid="save-profile-button"]');
      
      // Wait for profile to be saved
      await page.waitForSelector('[data-testid="profile-created"]', { timeout: 10000 });
    });

    // Test venue discovery
    await test.step('Venue Discovery', async () => {
      // Grant location permission
      page.on('dialog', dialog => dialog.accept());
      
      await page.click('[data-testid="find-venues-button"]');
      
      // Wait for venues to load
      await page.waitForSelector('[data-testid="venue-card"]', { timeout: 10000 });
      
      // Verify venue cards are displayed
      const venueCards = await page.locator('[data-testid="venue-card"]').count();
      expect(venueCards).toBeGreaterThan(0);
    });

    // Test venue interaction
    await test.step('Venue Interaction', async () => {
      // Click on first venue
      await page.click('[data-testid="venue-card"]:first-child');
      
      // Wait for venue details
      await page.waitForSelector('[data-testid="venue-details"]', { timeout: 10000 });
      
      // Check in to venue
      await page.click('[data-testid="check-in-button"]');
      
      // Wait for check-in confirmation
      await page.waitForSelector('[data-testid="check-in-success"]', { timeout: 10000 });
    });

    // Test user discovery
    await test.step('User Discovery', async () => {
      // Wait for other users to appear
      await page.waitForSelector('[data-testid="user-card"]', { timeout: 15000 });
      
      // Verify user cards are displayed
      const userCards = await page.locator('[data-testid="user-card"]').count();
      expect(userCards).toBeGreaterThan(0);
    });

    // Test like functionality
    await test.step('Like Functionality', async () => {
      // Like first user
      await page.click('[data-testid="user-card"]:first-child [data-testid="like-button"]');
      
      // Wait for like animation
      await page.waitForTimeout(1000);
      
      // Verify like count increased
      const likeCount = await page.locator('[data-testid="likes-counter"]').textContent();
      expect(parseInt(likeCount || '0')).toBeGreaterThan(0);
    });

    // Test match creation
    await test.step('Match Creation', async () => {
      // Wait for potential match
      await page.waitForSelector('[data-testid="match-notification"]', { timeout: 30000 });
      
      // Verify match notification
      const matchText = await page.locator('[data-testid="match-notification"]').textContent();
      expect(matchText).toContain('It\'s a match!');
    });

    // Test chat initiation
    await test.step('Chat Initiation', async () => {
      // Click on match notification
      await page.click('[data-testid="match-notification"]');
      
      // Wait for chat to open
      await page.waitForSelector('[data-testid="chat-interface"]', { timeout: 10000 });
      
      // Send first message
      await page.fill('[data-testid="message-input"]', 'Hey! Nice to meet you!');
      await page.click('[data-testid="send-message-button"]');
      
      // Verify message sent
      await page.waitForSelector('[data-testid="message-sent"]', { timeout: 5000 });
    });
  });

  test('Visual regression test - venue cards', async ({ page }) => {
    // Navigate to venues page
    await page.goto('http://localhost:8080/venues');
    await page.waitForSelector('[data-testid="venue-card"]', { timeout: 10000 });
    
    // Take screenshot of venue cards
    await expect(page.locator('[data-testid="venues-container"]')).toHaveScreenshot('venue-cards.png');
  });

  test('Performance test - venue loading', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('http://localhost:8080/venues');
    await page.waitForSelector('[data-testid="venue-card"]', { timeout: 10000 });
    
    const loadTime = Date.now() - startTime;
    
    // Assert load time is under 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });

  test('Accessibility test - venue interaction', async ({ page }) => {
    await page.goto('http://localhost:8080/venues');
    await page.waitForSelector('[data-testid="venue-card"]', { timeout: 10000 });
    
    // Test keyboard navigation
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    
    // Verify venue details opened
    await page.waitForSelector('[data-testid="venue-details"]', { timeout: 10000 });
    
    // Test screen reader compatibility
    const venueName = await page.locator('[data-testid="venue-name"]').getAttribute('aria-label');
    expect(venueName).toBeTruthy();
  });

  test('Error handling - network failure', async ({ page }) => {
    // Simulate network failure
    await page.route('**/api/venues', route => route.abort());
    
    await page.goto('http://localhost:8080/venues');
    
    // Wait for error message
    await page.waitForSelector('[data-testid="error-message"]', { timeout: 10000 });
    
    // Verify error message is displayed
    const errorText = await page.locator('[data-testid="error-message"]').textContent();
    expect(errorText).toContain('Failed to load venues');
  });

  test('Mobile responsiveness', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('http://localhost:8080/venues');
    await page.waitForSelector('[data-testid="venue-card"]', { timeout: 10000 });
    
    // Verify mobile layout
    const venueCard = page.locator('[data-testid="venue-card"]:first-child');
    const cardWidth = await venueCard.boundingBox();
    
    // Card should take most of the screen width on mobile
    expect(cardWidth?.width).toBeGreaterThan(300);
  });
}); 