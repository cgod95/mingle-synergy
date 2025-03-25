
import React, { useState, useEffect } from 'react';
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
  
  useEffect(() => {
    // Reset state when src changes
    setLoaded(false);
    setError(false);
    
    if (!src) {
      // If no src, use initials placeholder
      const placeholder = imageService.generateInitialsPlaceholder(placeholderName || alt);
      setImgSrc(placeholder);
      return;
    }
    
    // Set src with improved loading
    setImgSrc(src);
    
    // Preload the image
    const img = new Image();
    img.onload = () => {
      setLoaded(true);
      onLoad?.();
    };
    img.onerror = () => {
      setError(true);
      const placeholder = imageService.generateInitialsPlaceholder(placeholderName || alt);
      setImgSrc(placeholder);
    };
    img.src = src;
    
    // Cleanup
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, placeholderName, alt]);
  
  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      {!loaded && !error && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse"></div>
      )}
      
      <img
        src={imgSrc}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={() => {
          setLoaded(true);
          onLoad?.();
        }}
        onError={() => {
          if (!error) {
            setError(true);
            const placeholder = imageService.generateInitialsPlaceholder(placeholderName || alt);
            setImgSrc(placeholder);
          }
        }}
      />
    </div>
  );
};

export default OptimizedImage;
