import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import SearchBar from './SearchBar'

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  // Close menu and search when route changes
  useEffect(() => {
    setIsMenuOpen(false)
    setIsSearchOpen(false)
    // Prevent body scroll when menu is open
    document.body.style.overflow = 'auto'
  }, [location.pathname])

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const navbar = event.target.closest('.navbar')
      const searchOverlay = event.target.closest('.search-overlay')
      
      if (!navbar && !searchOverlay) {
        setIsMenuOpen(false)
        setIsSearchOpen(false)
        document.body.style.overflow = 'auto'
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false)
        setIsSearchOpen(false)
        document.body.style.overflow = 'auto'
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [])

  const handleSearch = (searchTerm) => {
    navigate(`/search?q=${encodeURIComponent(searchTerm)}`)
    setIsSearchOpen(false)
    setIsMenuOpen(false)
    document.body.style.overflow = 'auto'
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
    // Toggle body scroll
    document.body.style.overflow = !isMenuOpen ? 'hidden' : 'auto'
  }

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen)
    setIsMenuOpen(false)
    // Toggle body scroll
    document.body.style.overflow = !isSearchOpen ? 'hidden' : 'auto'
  }

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  const handleLogoClick = (e) => {
    if (location.pathname === '/') {
      e.preventDefault() // Prevent navigation if already on home page
      scrollToTop()
    } else {
      scrollToTop()
    }
  }

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(path)
  }

  return (
    <>
      <header className="header">
        <nav className="navbar">
          <div className="navbar-brand">
            <Link to="/" className="nav-logo" onClick={handleLogoClick}>
              <img 
                src="https://firebasestorage.googleapis.com/v0/b/kh-donghua.appspot.com/o/logo%2F_1_logo_donghua.png?alt=media&token=c029014a-8ad1-4d2f-a08a-e075791b720e" 
                alt="KH-DONGHUA"
                className="brand-logo"
              />
              <span className="brand-name">KH-DONGHUA</span>
            </Link>
          </div>

          <div className={`navbar-content ${isMenuOpen ? 'active' : ''}`}>
            <ul className="nav-links">
              <li>
                <Link 
                  to="/" 
                  className={isActive('/') ? 'active' : ''}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Home
                </Link>
              </li>
              <li>
                <Link 
                  to="/donghua" 
                  className={isActive('/donghua') ? 'active' : ''}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Donghua
                </Link>
              </li>
              <li>
                <Link 
                  to="/anime" 
                  className={isActive('/anime') ? 'active' : ''}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Anime
                </Link>
              </li>
              <li>
                <Link 
                  to="/ongoing" 
                  className={isActive('/ongoing') ? 'active' : ''}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Ongoing
                </Link>
              </li>
              <li>
                <Link 
                  to="/completed" 
                  className={isActive('/completed') ? 'active' : ''}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Completed
                </Link>
              </li>
            </ul>
          </div>

          <div className="navbar-actions">
            <button 
              className="search-toggle"
              onClick={() => setIsSearchOpen(true)}
              aria-label="Toggle search"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>

            <button 
              className={`mobile-menu-btn ${isMenuOpen ? 'active' : ''}`}
              onClick={toggleMenu}
              aria-label="Toggle menu"
              aria-expanded={isMenuOpen}
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </nav>
      </header>

      <div className={`search-overlay ${isSearchOpen ? 'active' : ''}`}>
        <div className="search-container">
          <SearchBar onSearch={handleSearch} />
        </div>
      </div>
    </>
  )
}

export default Navbar