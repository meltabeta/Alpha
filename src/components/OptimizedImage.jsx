import { useState, useEffect } from 'react';
import { deviceDetector } from '../utils/deviceDetector';

function OptimizedImage({ src, alt, className, loading = "lazy", ...props }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const isIOS = deviceDetector.isIOS();
  const isAndroid = deviceDetector.isAndroid();

  const imageClassName = `
    optimized-image 
    ${className || ''} 
    ${isLoaded ? 'loaded' : ''} 
    ${isIOS ? 'ios-image' : ''} 
    ${isAndroid ? 'android-image' : ''}
  `.trim();

  return (
    <div className={`image-container ${!isLoaded ? 'loading-skeleton' : ''}`}>
      {isIOS ? (
        // iOS - minimal optimizations for best quality
        <img
          src={src}
          alt={alt}
          className={imageClassName}
          loading={loading}
          onLoad={() => setIsLoaded(true)}
          decoding="async"
          {...props}
        />
      ) : (
        // Android and other devices - apply performance optimizations
        <img
          src={src}
          alt={alt}
          className={imageClassName}
          loading={loading}
          onLoad={() => setIsLoaded(true)}
          decoding="async"
          fetchpriority={loading === "eager" ? "high" : "auto"}
          {...props}
        />
      )}
    </div>
  );
}

export default OptimizedImage; 