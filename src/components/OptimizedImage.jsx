import { useState, useRef, useEffect } from 'react';

function OptimizedImage({ src, alt, className, loading = "lazy", onError, ...props }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imageRef = useRef(null);

  const handleError = (e) => {
    setHasError(true);
    setIsLoaded(false);
    if (onError) onError(e);
  };

  const handleLoad = () => {
    setIsLoaded(true);
    setHasError(false);
  };

  useEffect(() => {
    const img = imageRef.current;
    if (img && img.complete) {
      handleLoad();
    }
  }, []);

  return (
    <div className={`image-container ${!isLoaded ? 'loading-skeleton' : ''}`}>
      {hasError ? (
        <div className="image-error">
          <span>Failed to load image</span>
        </div>
      ) : (
        <img
          ref={imageRef}
          src={src}
          alt={alt}
          className={`${className || ''} ${isLoaded ? 'loaded' : ''}`}
          loading={loading}
          onLoad={handleLoad}
          onError={handleError}
          {...props}
        />
      )}
    </div>
  );
}

export default OptimizedImage; 