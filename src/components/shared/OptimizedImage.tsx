
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
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      )}
      
      {error ? (
        <div className="bg-gray-100 flex items-center justify-center h-full w-full">
          <span className="text-gray-400 text-sm">Image not available</span>
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
            data-src={currentSrc}
            src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3C/svg%3E"
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
