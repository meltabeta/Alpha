import { useState } from 'react'
import { Link } from 'react-router-dom'
import Pagination from './Pagination'
import { createUrlSlug, formatEpisodeNumber } from '../utils/urlFormatter'

function CardSection({ title, cards }) {
  const [currentPage, setCurrentPage] = useState(1)
  const cardsPerPage = 12
  
  // Calculate pagination
  const indexOfLastCard = currentPage * cardsPerPage
  const indexOfFirstCard = indexOfLastCard - cardsPerPage
  const currentCards = cards.slice(indexOfFirstCard, indexOfLastCard)
  const totalPages = Math.ceil(cards.length / cardsPerPage)

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber)
    // Scroll to section header with offset for navbar
    const section = document.querySelector('.section-header')
    if (section) {
      const offset = 100
      const elementPosition = section.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - offset
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })
    }
  }

  const getStatusClass = (status) => {
    return status.toLowerCase() === 'ongoing' ? 'badge-ongoing' : 'badge-completed'
  }

  return (
    <section className="card-section">
      <div className="container">
        <div className="section-header">
          <h2>{title}</h2>
          <div className="section-actions">
            <span className="section-count">{cards.length} Series</span>
            <div className="section-filter">
              <button className="filter-button active">
                <span>Latest</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18M7 12h10m-6 6h2"/>
                </svg>
              </button>
            </div>
          </div>
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
      </div>
    </section>
  )
}

export default CardSection