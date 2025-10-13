// Brand Identity Component - Professional logo and branding system

import React from 'react';
import { cn } from '@/lib/utils';
import { brandColors, brandTypography, brandVoice } from './BrandIdentity.constants';

export interface BrandIdentityProps {
  variant?: 'logo' | 'text' | 'full' | 'icon';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'white' | 'dark';
  className?: string;
  showTagline?: boolean;
}


// Logo component
export const Logo: React.FC<BrandIdentityProps> = ({
  variant = 'full',
  size = 'md',
  color = 'primary',
  className,
  showTagline = false
}) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  const colorClasses = {
    primary: 'text-blue-600',
    secondary: 'text-purple-600',
    white: 'text-white',
    dark: 'text-gray-900'
  };

  const renderLogoIcon = () => (
    <svg
      className={cn(sizeClasses[size], colorClasses[color], className)}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Mingle Logo - Abstract people connecting */}
      <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2Z" />
      <path d="M6 8C7.1 8 8 8.9 8 10C8 11.1 7.1 12 6 12C4.9 12 4 11.1 4 10C4 8.9 4.9 8 6 8Z" />
      <path d="M18 8C19.1 8 20 8.9 20 10C20 11.1 19.1 12 18 12C16.9 12 16 11.1 16 10C16 8.9 16.9 8 18 8Z" />
      <path d="M12 14C13.1 14 14 14.9 14 16C14 17.1 13.1 18 12 18C10.9 18 10 17.1 10 16C10 14.9 10.9 14 12 14Z" />
      {/* Connection lines */}
      <path d="M10 6L6 10" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path d="M14 6L18 10" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path d="M6 12L10 16" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path d="M18 12L14 16" stroke="currentColor" strokeWidth="1.5" fill="none" />
    </svg>
  );

  const renderLogoText = () => (
    <span className={cn(
      'font-bold tracking-tight',
      textSizeClasses[size],
      colorClasses[color],
      className
    )}>
      Mingle
    </span>
  );

  const renderFullLogo = () => (
    <div className={cn('flex items-center gap-2', className)}>
      {renderLogoIcon()}
      <div className="flex flex-col">
        {renderLogoText()}
        {showTagline && (
          <span className={cn(
            'text-xs font-medium opacity-75',
            color === 'white' ? 'text-white' : 'text-gray-600'
          )}>
            Connect. Discover. Mingle.
          </span>
        )}
      </div>
    </div>
  );

  switch (variant) {
    case 'icon':
      return renderLogoIcon();
    case 'text':
      return renderLogoText();
    case 'full':
    default:
      return renderFullLogo();
  }
};

// Brand guidelines component
export const BrandGuidelines: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Mingle Brand Guidelines</h1>
        <p className="text-lg text-gray-600">
          Our brand represents connection, authenticity, and community
        </p>
      </div>

      {/* Logo Usage */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">Logo Usage</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-4 border rounded-lg">
            <h3 className="font-medium mb-2">Primary Logo</h3>
            <Logo variant="full" size="lg" />
          </div>
          <div className="p-4 border rounded-lg">
            <h3 className="font-medium mb-2">Icon Only</h3>
            <Logo variant="icon" size="lg" />
          </div>
          <div className="p-4 border rounded-lg">
            <h3 className="font-medium mb-2">Text Only</h3>
            <Logo variant="text" size="lg" />
          </div>
          <div className="p-4 border rounded-lg bg-gray-900">
            <h3 className="font-medium mb-2 text-white">White Version</h3>
            <Logo variant="full" size="lg" color="white" />
          </div>
        </div>
      </section>

      {/* Color Palette */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">Color Palette</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="font-medium mb-3">Primary Colors</h3>
            <div className="space-y-2">
              {Object.entries(brandColors.primary).map(([shade, color]) => (
                <div key={shade} className="flex items-center gap-3">
                  <div 
                    className="w-8 h-8 rounded border"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-sm font-mono">{shade}: {color}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-medium mb-3">Secondary Colors</h3>
            <div className="space-y-2">
              {Object.entries(brandColors.secondary).map(([shade, color]) => (
                <div key={shade} className="flex items-center gap-3">
                  <div 
                    className="w-8 h-8 rounded border"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-sm font-mono">{shade}: {color}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-medium mb-3">Accent Colors</h3>
            <div className="space-y-2">
              {Object.entries(brandColors.accent).map(([shade, color]) => (
                <div key={shade} className="flex items-center gap-3">
                  <div 
                    className="w-8 h-8 rounded border"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-sm font-mono">{shade}: {color}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Typography */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">Typography</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Primary Font: Inter</h3>
            <p className="text-lg" style={{ fontFamily: brandTypography.fontFamily.primary }}>
              The quick brown fox jumps over the lazy dog
            </p>
          </div>
          <div>
            <h3 className="font-medium mb-2">Secondary Font: Poppins</h3>
            <p className="text-lg" style={{ fontFamily: brandTypography.fontFamily.secondary }}>
              The quick brown fox jumps over the lazy dog
            </p>
          </div>
          <div>
            <h3 className="font-medium mb-2">Accent Font: Playfair Display</h3>
            <p className="text-lg" style={{ fontFamily: brandTypography.fontFamily.accent }}>
              The quick brown fox jumps over the lazy dog
            </p>
          </div>
        </div>
      </section>

      {/* Voice and Tone */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">Voice & Tone</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium mb-3">Personality</h3>
            <ul className="space-y-2 text-sm">
              {Object.entries(brandVoice.personality).map(([trait, description]) => (
                <li key={trait} className="flex gap-2">
                  <span className="font-medium capitalize">{trait}:</span>
                  <span>{description}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-3">Tone</h3>
            <ul className="space-y-2 text-sm">
              {Object.entries(brandVoice.tone).map(([tone, description]) => (
                <li key={tone} className="flex gap-2">
                  <span className="font-medium capitalize">{tone}:</span>
                  <span>{description}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Taglines */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">Taglines</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {brandVoice.messaging.taglines.map((tagline, index) => (
            <div key={index} className="p-4 border rounded-lg text-center">
              <p className="text-lg font-medium text-gray-900">"{tagline}"</p>
            </div>
          ))}
        </div>
      </section>

      {/* Value Propositions */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">Value Propositions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {brandVoice.messaging.valueProps.map((prop, index) => (
            <div key={index} className="p-4 bg-blue-50 rounded-lg">
              <p className="text-gray-900">{prop}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

// Marketing assets component
export const MarketingAssets: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Marketing Assets</h1>
        <p className="text-lg text-gray-600">
          Ready-to-use assets for marketing and promotional materials
        </p>
      </div>

      {/* Social Media Templates */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">Social Media Templates</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Instagram Post */}
          <div className="aspect-square bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg p-6 flex flex-col justify-center items-center text-white">
            <Logo variant="full" size="xl" color="white" />
            <p className="text-center mt-4 font-medium">
              Connect with amazing people at your favorite venues
            </p>
            <div className="mt-4 text-sm opacity-90">
              #MingleApp #SocialConnections #VenueMatching
            </div>
          </div>

          {/* Twitter Header */}
          <div className="aspect-[3/1] bg-gradient-to-r from-blue-600 to-purple-700 rounded-lg p-6 flex items-center justify-center">
            <div className="text-center text-white">
              <Logo variant="full" size="lg" color="white" />
              <p className="mt-2 font-medium">Where connections happen naturally</p>
            </div>
          </div>

          {/* Facebook Cover */}
          <div className="aspect-[2.7/1] bg-gradient-to-br from-purple-600 to-blue-500 rounded-lg p-6 flex items-center justify-center">
            <div className="text-center text-white">
              <Logo variant="full" size="lg" color="white" />
              <p className="mt-2 font-medium">Real people, real connections</p>
            </div>
          </div>
        </div>
      </section>

      {/* App Store Graphics */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">App Store Graphics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* App Icon */}
          <div className="aspect-square bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl p-6 flex items-center justify-center">
            <Logo variant="icon" size="xl" color="white" />
          </div>

          {/* Feature Screenshots */}
          {[1, 2, 3].map((i) => (
            <div key={i} className="aspect-[9/16] bg-white border rounded-lg p-4 flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Logo variant="icon" size="md" />
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Feature {i}</h3>
              <p className="text-sm text-gray-600 text-center">
                Amazing feature description that showcases the app's value
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Print Materials */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">Print Materials</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Business Card */}
          <div className="aspect-[1.75/1] bg-white border rounded-lg p-6 flex items-center justify-between">
            <div>
              <Logo variant="full" size="md" />
              <p className="text-sm text-gray-600 mt-2">Business Development</p>
              <p className="text-sm text-gray-600">hello@mingle.app</p>
            </div>
            <div className="text-right text-sm text-gray-600">
              <p>www.mingle.app</p>
              <p>+1 (555) 123-4567</p>
            </div>
          </div>

          {/* Brochure */}
          <div className="aspect-[3/2] bg-gradient-to-br from-blue-50 to-purple-50 border rounded-lg p-6 flex flex-col justify-center">
            <Logo variant="full" size="lg" />
            <h3 className="text-xl font-bold text-gray-900 mt-4 mb-2">
              Connect. Discover. Mingle.
            </h3>
            <p className="text-gray-600 mb-4">
              Transform your social experience with location-based matching
            </p>
            <div className="flex gap-4 text-sm">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">Smart Matching</span>
              <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full">Safe & Verified</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Logo; 