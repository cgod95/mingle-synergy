import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Image as ImageIcon } from 'lucide-react';
import { imageService } from '../../services/ImageService';
import logger from '@/utils/Logger';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  fallback?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  className = "",
  priority = false,
  fallback,
  onLoad,
  onError
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [currentSrc, setCurrentSrc] = useState(priority ? src : '');
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (priority) {
      setIsInView(true);
      setCurrentSrc(src);
      return;
    }

    // Set up intersection observer for lazy loading
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            setCurrentSrc(src);
            observerRef.current?.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '50px 0px',
        threshold: 0.1
      }
    );

    if (imgRef.current) {
      observerRef.current.observe(imgRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [src, priority]);

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    onError?.();
  };

  const getPlaceholderStyle = () => {
    if (width && height) {
      return { width: `${width}px`, height: `${height}px` };
    }
    return {};
  };

  return (
    <div 
      ref={imgRef}
      className={`relative overflow-hidden ${className}`}
      style={getPlaceholderStyle()}
    >
      {/* Loading State */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-gray-100"
          >
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error State */}
      <AnimatePresence>
        {hasError && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center bg-gray-100"
          >
            <div className="text-center">
              <ImageIcon className="w-8 h-8 mx-auto text-gray-400 mb-2" />
              <p className="text-xs text-gray-500">Image unavailable</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actual Image */}
      <AnimatePresence>
        {isInView && !hasError && (
          <motion.img
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            src={currentSrc}
            alt={alt}
            width={width}
            height={height}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              isLoading ? 'opacity-0' : 'opacity-100'
            }`}
            onLoad={handleLoad}
            onError={handleError}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
          />
        )}
      </AnimatePresence>

      {/* Low-quality placeholder */}
      {!priority && !isInView && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
    </div>
  );
};

// Hook for image preloading
export const useImagePreload = (srcs: string[]) => {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

  useEffect(() => {
    const preloadImages = async () => {
      const promises = srcs.map((src) => {
        return new Promise<string>((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(src);
          img.onerror = () => reject(src);
          img.src = src;
        });
      });

      try {
        const loadedSrcs = await Promise.all(promises);
        setLoadedImages(new Set(loadedSrcs));
      } catch (error) {
        logger.warn('Some images failed to preload:', error);
      }
    };

    preloadImages();
  }, [srcs]);

  return loadedImages;
};

// Progressive image loading component
export const ProgressiveImage: React.FC<{
  lowQualitySrc: string;
  highQualitySrc: string;
  alt: string;
  className?: string;
}> = ({ lowQualitySrc, highQualitySrc, alt, className = "" }) => {
  const [currentSrc, setCurrentSrc] = useState(lowQualitySrc);
  const [isHighQualityLoaded, setIsHighQualityLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setCurrentSrc(highQualitySrc);
      setIsHighQualityLoaded(true);
    };
    img.src = highQualitySrc;
  }, [highQualitySrc]);

  return (
    <motion.img
      src={currentSrc}
      alt={alt}
      className={`w-full h-full object-cover transition-all duration-500 ${
        isHighQualityLoaded ? 'blur-0' : 'blur-sm'
      } ${className}`}
    />
  );
};
