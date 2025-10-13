import { useEffect, useRef, useState } from 'react';
import logger from '@/utils/Logger';

export const useLazyImageObserver = (
  priority: boolean,
  src: string,
  setIsInView: (value: boolean) => void,
  setCurrentSrc: (value: string) => void,
) => {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const imgRef = useRef<HTMLDivElement | HTMLImageElement | null>(null);

  useEffect(() => {
    if (priority) {
      setIsInView(true);
      setCurrentSrc(src);
      return;
    }

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
        threshold: 0.1,
      },
    );

    const node = imgRef.current;
    if (node) {
      observerRef.current.observe(node);
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [priority, src, setCurrentSrc, setIsInView]);

  return { imgRef };
};

export const getPlaceholderStyle = (width?: number, height?: number) => {
  if (width && height) {
    return { width: `${width}px`, height: `${height}px` };
  }
  return {};
};

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

