import { useState, useEffect, useRef } from 'react';

const OptimizedImage = ({ 
  src, 
  alt, 
  className = '', 
  placeholderSrc,
  width,
  height,
  loading = 'lazy'
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [showPlaceholder, setShowPlaceholder] = useState(true);
  const imageRef = useRef(null);
  
  useEffect(() => {
    const img = imageRef.current;
    
    if (img && img.complete) {
      handleImageLoaded();
    }
    
    // Setup intersection observer for viewport entry
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            img.src = src;
            observer.unobserve(img);
          }
        });
      },
      {
        rootMargin: '50px 0px',
        threshold: 0.01
      }
    );
    
    if (img && loading === 'lazy') {
      observer.observe(img);
    }
    
    return () => {
      if (img && loading === 'lazy') {
        observer.unobserve(img);
      }
    };
  }, [src, loading]);
  
  const handleImageLoaded = () => {
    setIsLoaded(true);
    setTimeout(() => {
      setShowPlaceholder(false);
    }, 300);
  };

  return (
    <div className="image-wrapper" style={{ aspectRatio: `${width}/${height}` }}>
      {showPlaceholder && placeholderSrc && (
        <div
          className={`image-placeholder ${isLoaded ? 'hidden' : ''}`}
          style={{ backgroundImage: `url(${placeholderSrc})` }}
        />
      )}
      <img
        ref={imageRef}
        alt={alt}
        className={`lazy-image ${className} ${isLoaded ? 'loaded' : ''}`}
        onLoad={handleImageLoaded}
        width={width}
        height={height}
        loading={loading}
        decoding="async"
      />
    </div>
  );
};

export default OptimizedImage; 