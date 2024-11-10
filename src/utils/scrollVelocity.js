export const scrollVelocityDetector = {
  lastScrollTop: 0,
  lastScrollTime: Date.now(),
  velocity: 0,

  update() {
    const now = Date.now();
    const scrollTop = window.scrollY;
    const timeDiff = now - this.lastScrollTime;
    const scrollDiff = Math.abs(scrollTop - this.lastScrollTop);
    
    this.velocity = scrollDiff / timeDiff;
    this.lastScrollTop = scrollTop;
    this.lastScrollTime = now;

    // Add/remove fast scroll class
    if (this.velocity > 0.5) {
      document.body.classList.add('is-scrolling-fast');
    } else {
      document.body.classList.remove('is-scrolling-fast');
    }
  },

  init() {
    let scrollTimeout;
    
    window.addEventListener('scroll', () => {
      this.update();
      
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        document.body.classList.remove('is-scrolling-fast');
        this.velocity = 0;
      }, 150);
    }, { passive: true });
  }
}; 