import { useState, useEffect, useRef } from 'react';

function OptimizedImage({ src, alt, className, loading = "lazy", ...props }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const imageRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px 0px',
        threshold: 0.1
      }
    );

    if (imageRef.current && loading !== "eager") {
      observer.observe(imageRef.current);
    } else {
      setIsVisible(true);
    }

    return () => observer.disconnect();
  }, [loading]);

  const handleError = () => {
    console.error(`Failed to load image: ${src}`);
    setHasError(true);
    setIsLoaded(true);
  };

  const imageUrl = isVisible || loading === "eager" ? src : '';

  return (
    <div 
      ref={imageRef}
      className={`image-container ${!isLoaded ? 'loading-skeleton' : ''} ${className || ''}`}
    >
      {hasError ? (
        <div className="image-error">
          <span>Failed to load image</span>
        </div>
      ) : (
        <img
          src={imageUrl}
          alt={alt}
          className={`optimized-image ${isLoaded ? 'loaded' : ''}`}
          loading={loading}
          onLoad={() => setIsLoaded(true)}
          onError={handleError}
          decoding="async"
          {...props}
        />
      )}
    </div>
  );
}

export default OptimizedImage; 