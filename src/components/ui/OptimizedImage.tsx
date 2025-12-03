import React, { useState, useEffect, useRef } from 'react';
import { imageService } from '../../services/ImageService';

interface OptimizedImageProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
  placeholderName?: string;
  width?: number;
  height?: number;
  onLoad?: () => void;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  placeholderName = '',
  width,
  height,
  onLoad
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [imgSrc, setImgSrc] = useState<string>('');
  const errorHandledRef = useRef(false); // Prevent multiple error handlers
  const loadingRef = useRef(false); // Prevent multiple loading states
  
  useEffect(() => {
    // Reset refs when src changes
    errorHandledRef.current = false;
    loadingRef.current = false;
    setLoaded(false);
    setError(false);
    
    if (!src) {
      const placeholder = imageService.generateInitialsPlaceholder(placeholderName || alt);
      setImgSrc(placeholder);
      setLoaded(true); // Immediately show placeholder
      return;
    }
    
    setImgSrc(src);
    
    // Preload the image - only if not already loading
    if (!loadingRef.current) {
      loadingRef.current = true;
      const img = new Image();
      img.onload = () => {
        if (!errorHandledRef.current) {
          setLoaded(true);
          setError(false);
          onLoad?.();
        }
        loadingRef.current = false;
      };
      img.onerror = () => {
        if (!errorHandledRef.current) {
          errorHandledRef.current = true;
          setError(true);
          const placeholder = imageService.generateInitialsPlaceholder(placeholderName || alt);
          setImgSrc(placeholder);
          setLoaded(true); // Show placeholder immediately
        }
        loadingRef.current = false;
      };
      img.src = src;
      
      // Cleanup
      return () => {
        img.onload = null;
        img.onerror = null;
      };
    }
    return undefined;
  }, [src, placeholderName, alt]); // Removed onLoad from deps to prevent re-runs
  
  const handleError = () => {
    // Only handle error once
    if (!errorHandledRef.current) {
      errorHandledRef.current = true;
      setError(true);
      const placeholder = imageService.generateInitialsPlaceholder(placeholderName || alt);
      setImgSrc(placeholder);
      setLoaded(true); // Show placeholder immediately
    }
  };
  
  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      {!loaded && !error && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse"></div>
      )}
      
      <img
        src={imgSrc}
        alt={alt}
        className={`w-full h-full object-cover ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
        // Removed transition-opacity to prevent flickering
        onLoad={() => {
          if (!errorHandledRef.current) {
            setLoaded(true);
            onLoad?.();
          }
        }}
        onError={handleError}
      />
    </div>
  );
};

export default OptimizedImage;
