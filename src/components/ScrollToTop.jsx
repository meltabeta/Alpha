import { useState, useEffect, useCallback } from 'react';

function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const [lastScrollTime, setLastScrollTime] = useState(Date.now());
  const [scrollVelocity, setScrollVelocity] = useState(0);
  const [lastScrollPos, setLastScrollPos] = useState(0);

  // Enhanced scroll detection with velocity tracking
  const handleScroll = useCallback(() => {
    const currentTime = Date.now();
    const currentPos = window.pageYOffset;
    const timeDiff = currentTime - lastScrollTime;
    const posDiff = Math.abs(currentPos - lastScrollPos);
    
    // Calculate scroll velocity (pixels per millisecond)
    const velocity = posDiff / timeDiff;
    setScrollVelocity(velocity);

    // Check if scrolling is "fast"
    if (velocity > 0.5) { // Threshold for "fast" scrolling
      document.body.classList.add('is-scrolling-fast');
    }

    // Update scroll state
    setLastScrollTime(currentTime);
    setLastScrollPos(currentPos);

    if (!isScrolling) {
      setIsScrolling(true);
      document.body.classList.add('is-scrolling');
    }

    // Debounce scroll end with velocity check
    clearTimeout(window.scrollTimeout);
    window.scrollTimeout = setTimeout(() => {
      setIsScrolling(false);
      setScrollVelocity(0);
      document.body.classList.remove('is-scrolling');
      document.body.classList.remove('is-scrolling-fast');
    }, velocity > 0.5 ? 300 : 150); // Longer debounce for fast scrolling
  }, [isScrolling, lastScrollTime, lastScrollPos]);

  // Use Intersection Observer with scroll velocity awareness
  useEffect(() => {
    const options = {
      root: null,
      rootMargin: scrollVelocity > 0.5 ? '-150px 0px' : '-100px 0px', // Adjust margins for fast scrolling
      threshold: 0
    };

    const observer = new IntersectionObserver(([entry]) => {
      if (!document.body.classList.contains('is-scrolling-fast')) {
        requestAnimationFrame(() => {
          setIsVisible(!entry.isIntersecting);
        });
      }
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
  }, [handleScroll, scrollVelocity]);

  // Optimized scroll to top with velocity awareness
  const scrollToTop = useCallback(() => {
    if (scrollVelocity > 0.5) return; // Prevent scroll to top during fast scrolling

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

        if (progress < 1 && !document.body.classList.contains('is-scrolling-fast')) {
          requestAnimationFrame(scroll);
        }
      };

      requestAnimationFrame(scroll);
    });
  }, [scrollVelocity]);

  return (
    <>
      {isVisible && !document.body.classList.contains('is-scrolling-fast') && (
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