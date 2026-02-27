import React from 'react';
import { cn } from '@/lib/utils';

export interface BrandIdentityProps {
  variant?: 'logo' | 'text' | 'full' | 'icon';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'white' | 'dark';
  className?: string;
  showTagline?: boolean;
}

export const brandColors = {
  primary: {
    50: '#F5F3FF',
    100: '#EDE9FE',
    200: '#DDD6FE',
    300: '#C4B5FD',
    400: '#A78BFA',
    500: '#8B5CF6',
    600: '#7C3AED',
    700: '#6D28D9',
    800: '#5B21B6',
    900: '#4C1D95',
  },
  romantic: {
    50: '#FFF1F2',
    100: '#FFE4E6',
    200: '#FECDD3',
    300: '#FDA4AF',
    400: '#FB7185',
    500: '#F43F5E',
    600: '#E11D48',
    700: '#BE123C',
    800: '#9F1239',
    900: '#881337',
  },
  neutral: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#E5E5E5',
    300: '#D4D4D4',
    400: '#A3A3A3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  }
};

export const brandTypography = {
  fontFamily: {
    primary: 'Inter, system-ui, sans-serif',
  },
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
    '5xl': '3rem',
    '6xl': '3.75rem'
  },
  fontWeight: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800'
  }
};

export const brandVoice = {
  personality: {
    friendly: 'Warm and approachable',
    confident: 'Self-assured and trustworthy',
    inclusive: 'Welcoming to all',
    authentic: 'Genuine and real',
    optimistic: 'Positive and encouraging'
  },
  tone: {
    conversational: 'Speak like a friend',
    encouraging: 'Support and motivate',
    respectful: 'Value everyone',
    playful: 'Light and fun',
    professional: 'Reliable and polished'
  },
  messaging: {
    taglines: [
      'No more swiping. No more noise. Just meet people.',
      'Where connections happen naturally',
      'Real people, real connections',
    ],
    valueProps: [
      'Authentic connections in real places',
      'Safe and verified community',
      'Smart matching based on location and interests',
      'Seamless experience from discovery to meeting'
    ]
  }
};

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

const iconSizeClasses = {
  sm: 'text-xs',
  md: 'text-base',
  lg: 'text-xl',
  xl: 'text-2xl'
};

const radiusClasses = {
  sm: 'rounded-lg',
  md: 'rounded-xl',
  lg: 'rounded-2xl',
  xl: 'rounded-2xl'
};

export const Logo: React.FC<BrandIdentityProps> = ({
  variant = 'full',
  size = 'md',
  color = 'primary',
  className,
  showTagline = false
}) => {
  const renderLogoIcon = () => (
    <div
      className={cn(
        sizeClasses[size],
        radiusClasses[size],
        'bg-brand flex items-center justify-center shadow-lg shadow-violet-500/30',
        className
      )}
    >
      <span className={cn(iconSizeClasses[size], 'font-bold text-white')}>
        M
      </span>
    </div>
  );

  const renderLogoText = () => (
    <span className={cn(
      'font-bold text-gradient',
      textSizeClasses[size],
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
          <span className="text-xs font-medium text-neutral-400">
            No more swiping. Just meet people.
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

export default Logo;
