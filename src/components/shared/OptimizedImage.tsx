
import React, { useState, useEffect } from 'react';
import { getOptimizedImageUrl } from '@/utils/imageOptimizer';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  width,
  height,
  priority = false
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string>('');

  useEffect(() => {
    // Reset states when src changes
    setIsLoading(true);
    setError(false);
    
    // Generate optimized source URL
    const optimizedSrc = getOptimizedImageUrl(src, width || 400);
    setCurrentSrc(optimizedSrc);
  }, [src, width]);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setError(true);
    console.warn(`Failed to load image: ${src}`);
  };

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-bg-tertiary flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      
      {error ? (
        <div className="bg-bg-tertiary flex items-center justify-center h-full w-full">
          <span className="text-text-secondary text-sm">Image not available</span>
        </div>
      ) : (
        priority ? (
          <img
            src={currentSrc}
            alt={alt}
            width={width}
            height={height}
            onLoad={handleLoad}
            onError={handleError}
            className={`${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300 w-full h-full object-cover`}
            data-original-src={src}
            fetchPriority="high"
          />
        ) : (
          <img
            src={currentSrc}
            alt={alt}
            width={width}
            height={height}
            onLoad={handleLoad}
            onError={handleError}
            className={`${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300 w-full h-full object-cover`}
            data-original-src={src}
            loading="lazy"
            decoding="async"
          />
        )
      )}
    </div>
  );
};

export default OptimizedImage;
