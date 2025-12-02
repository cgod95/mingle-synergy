import React, { useState, useEffect, useRef } from 'react';
import { getOptimizedImageUrl } from '@/utils/imageOptimizer';

interface OptimizedImageProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  fallback?: string;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  width,
  height,
  priority = false,
  fallback = '/placeholder.svg'
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string>('');
  const errorHandledRef = useRef(false); // Prevent multiple error handlers

  useEffect(() => {
    // Reset refs and states when src changes
    errorHandledRef.current = false;
    setIsLoading(true);
    setError(false);
    
    // If src is null or undefined, use fallback immediately
    if (!src) {
      setCurrentSrc(fallback);
      setIsLoading(false);
      return;
    }
    
    // Generate optimized source URL
    const optimizedSrc = getOptimizedImageUrl(src, width || 400);
    setCurrentSrc(optimizedSrc);
  }, [src, width, fallback]);

  const handleLoad = () => {
    if (!errorHandledRef.current) {
      setIsLoading(false);
    }
  };

  const handleError = () => {
    if (errorHandledRef.current) return; // Already handled
    
    errorHandledRef.current = true;
    
    if (currentSrc !== fallback) {
      setCurrentSrc(fallback);
      setIsLoading(false);
      setError(false);
    } else {
      setIsLoading(false);
      setError(true);
    }
  };

  return (
    <div className={`relative ${className}`}>
      {isLoading && !error && (
        <div className="absolute inset-0 bg-bg-tertiary flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      
      {error ? (
        <div className="bg-bg-tertiary flex items-center justify-center h-full w-full">
          <span className="text-muted-foreground text-sm">Image not available</span>
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
            className={`${isLoading ? 'opacity-0' : 'opacity-100'} w-full h-full object-cover`}
            // Removed transition-opacity duration-300 to prevent flickering
            data-original-src={src || ''}
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
            className={`${isLoading ? 'opacity-0' : 'opacity-100'} w-full h-full object-cover`}
            // Removed transition-opacity duration-300 to prevent flickering
            data-original-src={src || ''}
            loading="lazy"
            decoding="async"
          />
        )
      )}
    </div>
  );
};

export default OptimizedImage;
