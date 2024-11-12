// New utility file for scroll-related functions
import { throttle } from 'lodash';

// Throttled scroll handler
export const throttledScroll = throttle((callback) => {
  callback();
}, 150); // Adjust timing as needed

// Smooth scroll with fallback
export const smoothScroll = (element, offset = 0) => {
  if (!element) return;
  
  try {
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;

    // Check if smooth scroll is supported
    if ('scrollBehavior' in document.documentElement.style) {
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    } else {
      // Fallback for browsers that don't support smooth scroll
      window.scrollTo(0, offsetPosition);
    }
  } catch (error) {
    console.error('Scroll error:', error);
    // Fallback to regular scroll
    window.scrollTo(0, 0);
  }
}; 