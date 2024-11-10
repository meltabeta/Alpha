import { useState, useEffect, useCallback } from 'react';

function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);

  // Optimize scroll detection
  const handleScroll = useCallback(() => {
    if (!isScrolling) {
      setIsScrolling(true);
      document.body.classList.add('is-scrolling');
    }

    // Debounce scroll end
    clearTimeout(window.scrollTimeout);
    window.scrollTimeout = setTimeout(() => {
      setIsScrolling(false);
      document.body.classList.remove('is-scrolling');
    }, 150);
  }, [isScrolling]);

  // Use Intersection Observer for better performance
  useEffect(() => {
    const options = {
      root: null,
      rootMargin: '-100px 0px',
      threshold: 0
    };

    const observer = new IntersectionObserver(([entry]) => {
      requestAnimationFrame(() => {
        setIsVisible(!entry.isIntersecting);
      });
    }, options);

    const target = document.createElement('div');
    target.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:1px;';
    document.body.appendChild(target);

    observer.observe(target);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      observer.disconnect();
      target.remove();
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(window.scrollTimeout);
    };
  }, [handleScroll]);

  // Optimized scroll to top
  const scrollToTop = useCallback(() => {
    requestAnimationFrame(() => {
      const duration = 500;
      const start = window.pageYOffset;
      const startTime = performance.now();

      const scroll = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        const easeInOutQuad = t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        const position = start - start * easeInOutQuad(progress);

        window.scrollTo(0, position);

        if (progress < 1) {
          requestAnimationFrame(scroll);
        }
      };

      requestAnimationFrame(scroll);
    });
  }, []);

  return (
    <>
      {isVisible && (
        <button
          className="scroll-to-top"
          onClick={scrollToTop}
          aria-label="Scroll to top"
          style={{ contain: 'strict' }}
        >
          ↑
        </button>
      )}
    </>
  );
}

export default ScrollToTop; 