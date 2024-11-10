import { useEffect, useRef, memo } from 'react';
import OptimizedImage from './OptimizedImage';
import './Banner.css';

const bannerImage = "https://i.pinimg.com/736x/e2/6c/45/e26c45d343f20fff0aba1902144ad736.jpg";
const logoImage = "https://firebasestorage.googleapis.com/v0/b/kh-donghua.appspot.com/o/logo%2F_1_logo_donghua.png?alt=media&token=c029014a-8ad1-4d2f-a08a-e075791b720e";
const telegramIcon = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTkuNzggMTguNjVMMTAuMDYgMTQuNzJMMTcuNzYgNy43QzE4LjEgNy40IDE3LjY5IDcuMjQgMTcuMjcgNy41TDcuOCAxMy43MUwzLjk3IDEyLjUzQzMuMTUgMTIuMzIgMy4xNSAxMS42OSA0LjE3IDExLjMyTDE5LjE0IDUuNUMxOS44NiA1LjIyIDIwLjUyIDUuNzUgMjAuMjggNi43NEwxNy4zNCAxOC42NUMxNy4xNyAxOS40OSAxNi42IDE5LjY3IDE1Ljg5IDE5LjI4TDExLjY0IDE2LjA5TDkuNzggMTguNjVaIi8+PC9zdmc+";

const Banner = memo(() => {
  const bannerRef = useRef(null);

  useEffect(() => {
    let rafId;
    const handleScroll = () => {
      rafId = requestAnimationFrame(() => {
        if (!bannerRef.current) return;
        const rate = window.scrollY * 0.5;
        bannerRef.current.style.transform = `translateY(${rate}px)`;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div className="channel-banner">
      <div className="banner-image" ref={bannerRef}>
        <OptimizedImage 
          src={bannerImage}
          alt="KH-DONGHUA Banner"
          className="banner-bg"
          loading="eager"
          priority={true}
          onError={(e) => {
            console.error('Banner image failed to load:', e);
            e.target.style.display = 'none';
          }}
        />
        <div className="banner-overlay">
          <div className="banner-content">
            <div className="channel-info">
              <div className="channel-avatar">
                <OptimizedImage 
                  src={logoImage}
                  alt="KH-DONGHUA Logo"
                  loading="eager"
                  priority={true}
                  onError={(e) => {
                    console.error('Logo image failed to load:', e);
                    e.target.style.display = 'none';
                  }}
                />
              </div>
              <div className="channel-details">
                <h1>KH-DONGHUA</h1>
                <p>Your Gateway to Chinese Animation</p>
                <div className="social-links">
                  <a 
                    href="https://t.me/kh_donghua"
                    className="telegram-link"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Join our Telegram community"
                  >
                    <img 
                      src={telegramIcon}
                      alt=""
                      loading="eager"
                      width="20"
                      height="20"
                    />
                    Join Our Community
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

Banner.displayName = 'Banner';

export default Banner;