import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ref, get } from 'firebase/database'
import { db } from '../firebase'
import { createUrlSlug, formatEpisodeNumber } from '../utils/urlFormatter'

function SearchBar({ onSearch }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isTyping, setIsTyping] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([])
      return
    }

    const timer = setTimeout(async () => {
      try {
        const cardsRef = ref(db, 'cards')
        const snapshot = await get(cardsRef)
        
        if (snapshot.exists()) {
          const cardsData = Object.values(snapshot.val())
          const filteredCards = cardsData
            .filter(card => 
              card.title.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .slice(0, 5) // Limit to 5 results
          setSearchResults(filteredCards)
        }
      } catch (error) {
        console.error('Error searching:', error)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      onSearch(searchTerm.trim())
    }
  }

  const handleChange = (e) => {
    setSearchTerm(e.target.value)
    setIsTyping(true)
  }

  const handleResultClick = () => {
    setSearchTerm('')
    setSearchResults([])
    onSearch('') // Close search overlay
  }

  const handleClose = () => {
    setSearchTerm('')
    setSearchResults([])
    onSearch('') // Close search overlay
    navigate('/') // Navigate to home page
  }

  return (
    <div className="search-container">
      <form className="search-bar" onSubmit={handleSubmit}>
        <input
          type="text"
          value={searchTerm}
          onChange={handleChange}
          placeholder="Search titles..."
          aria-label="Search"
        />
        <button type="submit" aria-label="Search">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </button>
      </form>

      <button 
        className="search-close" 
        onClick={handleClose}
        aria-label="Close search"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>

      {searchResults.length > 0 && (
        <div className="search-results-dropdown">
          {searchResults.map(card => (
            <Link 
              key={card.id}
              to={`/${card.type.toLowerCase()}/${createUrlSlug(card.title)}/episode-${formatEpisodeNumber(card.episode)}/${card.id}`}
              className="search-result-item"
              onClick={handleResultClick}
            >
              <img src={card.image} alt={card.title} className="result-thumb" />
              <div className="result-info">
                <h4>{card.title}</h4>
                <div className="result-meta">
                  <span className="result-type">{card.type}</span>
                  <span className="result-episode">EP {card.episode}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default SearchBar 