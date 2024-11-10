function Banner() {
  return (
    <div className="channel-banner">
      <div className="banner-image">
        <img 
          src="/assets/images/banner.jpg" 
          alt="KH-DONGHUA Banner"
          className="banner-bg"
          loading="eager"
          fetchpriority="high"
          decoding="async"
        />
        <div className="banner-overlay">
          <div className="banner-content">
            <div className="channel-info">
              <div className="channel-avatar">
                <img 
                  src="/assets/images/logo.png" 
                  alt="KH-DONGHUA Logo" 
                  loading="eager"
                  decoding="async"
                />
              </div>
              <div className="channel-details">
                <h1>KH-DONGHUA</h1>
                <p>@KH-DONGHUA</p>
                <div className="social-links">
                  <a 
                    href="https://t.me/kh_donghua" 
                    className="telegram-link"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img src="/assets/images/telegram.svg" alt="Telegram" />
                    Join Telegram Channel
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Banner 