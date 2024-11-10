import { useState, useEffect } from 'react'

function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false)

  // Optimize scroll behavior with IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(!entry.isIntersecting);
        });
      },
      { threshold: 0, rootMargin: '100px' }
    );

    const sentinel = document.createElement('div');
    sentinel.style.height = '1px';
    sentinel.style.position = 'absolute';
    sentinel.style.top = '300px';
    document.body.appendChild(sentinel);

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
      sentinel.remove();
    };
  }, []);

  // Optimize scroll to top function
  const scrollToTop = () => {
    if ('scrollBehavior' in document.documentElement.style) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    } else {
      // Fallback for browsers that don't support smooth scrolling
      const scrollStep = () => {
        const currentPosition = window.pageYOffset;
        if (currentPosition > 0) {
          window.requestAnimationFrame(scrollStep);
          window.scrollTo(0, currentPosition - Math.max(currentPosition / 8, 10));
        }
      };
      window.requestAnimationFrame(scrollStep);
    }
  };

  return (
    <>
      {isVisible && (
        <button
          className="scroll-to-top"
          onClick={scrollToTop}
          aria-label="Scroll to top"
        >
          ↑
        </button>
      )}
    </>
  )
}

export default ScrollToTop 