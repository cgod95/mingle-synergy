// Mingle "M" Monogram Logo - Brand consistent

interface MingleMLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

const sizeMap = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16'
};

const textSizeMap = {
  sm: 'text-lg',
  md: 'text-xl',
  lg: 'text-2xl',
  xl: 'text-3xl'
};

const logoSizeMap = {
  sm: 'text-base',
  md: 'text-lg',
  lg: 'text-2xl',
  xl: 'text-3xl'
};

const radiusMap = {
  sm: 'rounded-lg',
  md: 'rounded-xl',
  lg: 'rounded-2xl',
  xl: 'rounded-2xl'
};

export default function MingleMLogo({ size = 'md', showText = true, className = '' }: MingleMLogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* M Icon - Brand violet */}
      <div
        className={`${sizeMap[size]} ${radiusMap[size]} bg-[#7C3AED] flex items-center justify-center shadow-lg shadow-[#7C3AED]/30 transition-transform hover:scale-105 active:scale-95`}
      >
        <span className={`${logoSizeMap[size]} font-bold text-white`}>
          M
        </span>
      </div>
      {/* Gradient Text */}
      {showText && (
        <span
          className={`${textSizeMap[size]} font-bold text-gradient`}
        >
          Mingle
        </span>
      )}
    </div>
  );
}
