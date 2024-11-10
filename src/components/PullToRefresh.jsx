import { useState, useEffect } from 'react';
import { deviceDetector } from '../utils/deviceDetector';

function PullToRefresh({ onRefresh, children }) {
  const [startY, setStartY] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const isIOS = deviceDetector.isIOS();
  const isMobile = deviceDetector.isMobile();

  useEffect(() => {
    if (!isMobile) return;

    let touchStartY = 0;
    let touchEndY = 0;

    const handleTouchStart = (e) => {
      if (window.scrollY === 0) {
        touchStartY = e.touches[0].clientY;
        setStartY(touchStartY);
      }
    };

    const handleTouchMove = (e) => {
      touchEndY = e.touches[0].clientY;
      const pullDistance = touchEndY - touchStartY;
      
      if (window.scrollY === 0 && pullDistance > 0) {
        e.preventDefault();
        document.body.style.transform = `translateY(${Math.min(pullDistance / 2, 100)}px)`;
      }
    };

    const handleTouchEnd = async () => {
      const pullDistance = touchEndY - touchStartY;
      
      document.body.style.transform = 'translateY(0)';
      document.body.style.transition = 'transform 0.3s ease-out';
      
      if (pullDistance > 100 && !refreshing) {
        setRefreshing(true);
        await onRefresh();
        setRefreshing(false);
      }
      
      setTimeout(() => {
        document.body.style.transition = '';
      }, 300);
    };

    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onRefresh, refreshing, isMobile]);

  return (
    <>
      {refreshing && (
        <div className="pull-to-refresh-indicator">
          <div className="refresh-spinner"></div>
        </div>
      )}
      {children}
    </>
  );
}

export default PullToRefresh; 