import { useState, useEffect } from 'react'
import { ref, onValue } from 'firebase/database'
import { db } from '../firebase'
import SearchBar from './SearchBar'
import { useNavigate } from 'react-router-dom'

function Navigation({ onFilterChange, activeFilter, onSearch, searchQuery, cards }) {
  const defaultTabs = ['Home', 'Donghua', 'Anime']
  const [types, setTypes] = useState([])
  const [isScrolled, setIsScrolled] = useState(false)
  const navigate = useNavigate()
  
  useEffect(() => {
    const typesRef = ref(db, 'cards')
    const unsubscribe = onValue(typesRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const uniqueTypes = [...new Set(Object.values(data).map(card => card.type))]
        const additionalTypes = uniqueTypes.filter(type => !defaultTabs.includes(type))
        setTypes([...defaultTabs, ...additionalTypes.sort()])
      }
    })

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100)
    }
    window.addEventListener('scroll', handleScroll)

    return () => {
      unsubscribe()
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const handleNavClick = (type) => {
    if (type === 'Home') {
      onFilterChange('All')
      onSearch('')
    } else {
      onFilterChange(type)
    }
  }

  return (
    <nav className={`main-nav ${isScrolled ? 'scrolled' : ''}`}>
      <div className="nav-container">
        <div className="nav-left">
          <div className="nav-logo" onClick={() => handleNavClick('Home')} style={{ cursor: 'pointer' }}>
            <img src="/assets/images/logo.png" alt="KH-DONGHUA" />
            <span>KH-DONGHUA</span>
          </div>
          <div className="nav-content">
            {types.map((type) => (
              <button
                key={type}
                className={`nav-item ${activeFilter === (type === 'Home' ? 'All' : type) ? 'active' : ''}`}
                onClick={() => handleNavClick(type)}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
        <div className="nav-right">
          <SearchBar 
            value={searchQuery}
            onChange={onSearch}
            cards={cards}
            onSelectResult={(card) => {
              handleCardClick(card)
              onSearch('')
            }}
          />
        </div>
      </div>
    </nav>
  )
}

export default Navigation 