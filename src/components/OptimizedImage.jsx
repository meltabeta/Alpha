import { useState, useEffect, useRef } from 'react';
import { deviceDetector } from '../utils/deviceDetector';

function OptimizedImage({ src, alt, className, loading = "lazy", ...props }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const imageRef = useRef(null);
  const isIOS = deviceDetector.isIOS();
  const isAndroid = deviceDetector.isAndroid();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      {
        rootMargin: '50px 0px',
        threshold: 0.1
      }
    );

    if (imageRef.current) {
      observer.observe(imageRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const imageClassName = `
    optimized-image 
    ${className || ''} 
    ${isLoaded ? 'loaded' : ''} 
    ${isIOS ? 'ios-image' : ''} 
    ${isAndroid ? 'android-image' : ''}
    ${!isVisible ? 'not-visible' : ''}
  `.trim();

  const handleError = () => {
    setHasError(true);
    setIsLoaded(true);
  };

  return (
    <div 
      ref={imageRef}
      className={`image-container ${!isLoaded ? 'loading-skeleton' : ''}`}
    >
      {hasError ? (
        <div className="image-error">
          <span>Failed to load image</span>
        </div>
      ) : (
        <img
          src={isVisible ? src : ''}
          alt={alt}
          className={imageClassName}
          loading={loading}
          onLoad={() => setIsLoaded(true)}
          onError={handleError}
          decoding="async"
          fetchpriority={loading === "eager" ? "high" : "auto"}
          {...props}
        />
      )}
    </div>
  );
}

export default OptimizedImage; 