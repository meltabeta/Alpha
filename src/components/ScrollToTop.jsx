import { useState, useEffect } from 'react'

function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false)

  // Show button when page is scrolled up to given distance
  const toggleVisibility = () => {
    if (window.pageYOffset > 300) {
      setIsVisible(true)
    } else {
      setIsVisible(false)
    }
  }

  // Optimize scroll behavior
  const scrollToTop = () => {
    // Use requestAnimationFrame for smoother scrolling
    const scrollStep = () => {
      const currentPosition = window.pageYOffset;
      if (currentPosition > 0) {
        window.requestAnimationFrame(scrollStep);
        window.scrollTo(0, currentPosition - Math.max(currentPosition / 10, 10));
      }
    };
    window.requestAnimationFrame(scrollStep);
  };

  // Optimize scroll event listener
  useEffect(() => {
    let scrollTimeout;
    const handleScroll = () => {
      if (scrollTimeout) {
        window.cancelAnimationFrame(scrollTimeout);
      }
      scrollTimeout = window.requestAnimationFrame(() => {
        toggleVisibility();
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeout) {
        window.cancelAnimationFrame(scrollTimeout);
      }
    };
  }, []);

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