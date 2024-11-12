import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ref, get } from 'firebase/database'
import { db } from '../firebase'
import Pagination from '../components/Pagination'
import Loading from '../components/Loading'
import { createUrlSlug, formatEpisodeNumber } from '../utils/urlFormatter'

function FilteredView({ type, status }) {
  const [cards, setCards] = useState([])
  const [recommendedCards, setRecommendedCards] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const cardsPerPage = 12

  useEffect(() => {
    const fetchCards = async () => {
      setLoading(true)
      try {
        const cardsRef = ref(db, 'cards')
        const snapshot = await get(cardsRef)
        
        if (snapshot.exists()) {
          const cardsData = Object.values(snapshot.val())
          let filteredCards = cardsData

          if (type) {
            filteredCards = filteredCards.filter(card => card.type === type)
          }

          if (status) {
            filteredCards = filteredCards.filter(card => card.status === status)
          }

          filteredCards.sort((a, b) => {
            const dateA = new Date(a.lastUpdated || 0)
            const dateB = new Date(b.lastUpdated || 0)
            return dateB - dateA
          })

          setCards(filteredCards)

          const shuffled = [...filteredCards].sort(() => 0.5 - Math.random())
          setRecommendedCards(shuffled.slice(0, 4))

          setCurrentPage(1)
        }
      } catch (error) {
        console.error('Error fetching cards:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCards()
  }, [type, status])

  const getStatusClass = (status) => {
    return status.toLowerCase() === 'ongoing' ? 'badge-ongoing' : 'badge-completed'
  }

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber)
    const header = document.querySelector('.filtered-header')
    if (header) {
      const offset = 100
      const elementPosition = header.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - offset
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })
    }
  }

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  const indexOfLastCard = currentPage * cardsPerPage
  const indexOfFirstCard = indexOfLastCard - cardsPerPage
  const currentCards = cards.slice(indexOfFirstCard, indexOfLastCard)
  const totalPages = Math.ceil(cards.length / cardsPerPage)

  if (loading) return <Loading />

  return (
    <div className="filtered-view">
      <div className="filter-hero-section">
        <div className="container">
          <div className="filter-hero-content">
            <h1>{type || status} Series</h1>
            <div className="filter-stats">
              <div className="stat-badge">
                <span className="stat-value">{cards.length}</span>
                <span className="stat-label">Series</span>
              </div>
              {status && (
                <div className={`status-indicator ${status.toLowerCase()}`}>
                  <span className="status-dot"></span>
                  <span>{status}</span>
                </div>
              )}
            </div>
            {type && (
              <p className="filter-description">
                Explore our collection of {type} series, featuring the latest and most popular titles.
              </p>
            )}
            {status && (
              <p className="filter-description">
                Browse all {status.toLowerCase()} series in our collection.
              </p>
            )}
          </div>
        </div>
      </div>

      {recommendedCards.length > 0 && (
        <div className="recommended-section">
          <div className="container">
            <div className="section-header">
              <h2>Recommended {type || status}</h2>
              <div className="section-actions">
                <span className="section-count">{recommendedCards.length} Series</span>
              </div>
            </div>
            <div className="recommended-grid">
              {recommendedCards.map(card => (
                <Link 
                  to={`/${card.type.toLowerCase()}/${createUrlSlug(card.title)}/episode-${formatEpisodeNumber(card.episode)}/${card.id}`} 
                  key={card.id} 
                  className="card"
                >
                  <div className="card-image-container">
                    <img src={card.image} alt={card.title} loading="lazy" />
                    <div className="badges">
                      <div className="badges-top">
                        <span className={`badge badge-type`}>{card.type}</span>
                        <span className={`badge ${getStatusClass(card.status)}`}>
                          {card.status}
                        </span>
                      </div>
                      <div className="badges-bottom">
                        {card.season > 1 && (
                          <span className="badge badge-season">S{card.season}</span>
                        )}
                        <span className="badge badge-episode">EP{card.episode}</span>
                      </div>
                    </div>
                  </div>
                  <div className="card-info">
                    <h3 title={card.title}>{card.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {cards.length > 0 ? (
        <>
          <div className="section-header">
            <h2>All {type || status}</h2>
          </div>
          <div className="cards-grid">
            {currentCards.map(card => (
              <Link 
                to={`/${card.type.toLowerCase()}/${createUrlSlug(card.title)}/episode-${formatEpisodeNumber(card.episode)}/${card.id}`} 
                key={card.id} 
                className="card"
              >
                <div className="card-image-container">
                  <img src={card.image} alt={card.title} loading="lazy" />
                  <div className="badges">
                    <div className="badges-top">
                      <span className={`badge badge-type`}>{card.type}</span>
                      <span className={`badge ${getStatusClass(card.status)}`}>
                        {card.status}
                      </span>
                    </div>
                    <div className="badges-bottom">
                      {card.season > 1 && (
                        <span className="badge badge-season">S{card.season}</span>
                      )}
                      <span className="badge badge-episode">EP{card.episode}</span>
                    </div>
                  </div>
                </div>
                <div className="card-info">
                  <h3 title={card.title}>{card.title}</h3>
                </div>
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </>
      ) : (
        <div className="no-results">
          No {(type || status).toLowerCase()} series found
        </div>
      )}
    </div>
  )
}

export default FilteredView 