import React, { useState, useEffect } from 'react';
import { getOptimizedImageUrl } from '@/utils/imageOptimizer';
import logger from '@/utils/Logger';

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

  useEffect(() => {
    // Reset states when src changes
    setIsLoading(true);
    setError(false);
    
    // If src is null or undefined, use fallback immediately
    if (!src) {
      setCurrentSrc(fallback);
      return;
    }
    
    // Generate optimized source URL
    const optimizedSrc = getOptimizedImageUrl(src, width || 400);
    setCurrentSrc(optimizedSrc);
  }, [src, width, fallback]);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    // If the main image fails, try to load the fallback
    if (currentSrc !== fallback) {
      logger.warn(`Failed to load image: ${currentSrc}, trying fallback`);
      setCurrentSrc(fallback);
      
      // Create an image element to preload the fallback
      const imgElement = new Image();
      imgElement.src = fallback;
      imgElement.onload = () => {
        setIsLoading(false);
        setError(false);
      };
      imgElement.onerror = () => {
        setIsLoading(false);
        setError(true);
        logger.warn(`Failed to load fallback image: ${fallback}`);
      };
    } else {
      // Both main and fallback failed
      setIsLoading(false);
      setError(true);
      logger.warn(`Failed to load fallback image: ${fallback}`);
    }
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
            className={`${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300 w-full h-full object-cover`}
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
            className={`${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300 w-full h-full object-cover`}
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
