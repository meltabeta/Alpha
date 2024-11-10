import { useState, useEffect } from 'react';
import { deviceDetector } from '../utils/deviceDetector';

function OptimizedImage({ src, alt, className, loading = "lazy", ...props }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const isIOS = deviceDetector.isIOS();
  const isAndroid = deviceDetector.isAndroid();

  const imageClassName = `
    optimized-image 
    ${className || ''} 
    ${isLoaded ? 'loaded' : ''} 
    ${isIOS ? 'ios-image' : ''} 
    ${isAndroid ? 'android-image' : ''}
  `.trim();

  const handleError = () => {
    setHasError(true);
    setIsLoaded(true);
  };

  return (
    <div className={`image-container ${!isLoaded ? 'loading-skeleton' : ''}`}>
      {hasError ? (
        <div className="image-error">
          <span>Failed to load image</span>
        </div>
      ) : (
        <img
          src={src}
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