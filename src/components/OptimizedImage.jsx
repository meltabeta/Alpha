import { useState, useEffect } from 'react';

function OptimizedImage({ src, alt, className, loading = "lazy", ...props }) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className={`image-container ${!isLoaded ? 'loading-skeleton' : ''}`}>
      <img
        src={src}
        alt={alt}
        className={`optimized-image ${className || ''} ${isLoaded ? 'loaded' : ''}`}
        loading={loading}
        onLoad={() => setIsLoaded(true)}
        decoding="async"
        {...props}
      />
    </div>
  );
}

export default OptimizedImage; 