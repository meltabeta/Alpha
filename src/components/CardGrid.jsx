import { useNavigate } from 'react-router-dom'
import Pagination from './Pagination'
import Sidebar from './Sidebar'

function CardGrid({ cards, sectionTitle, isLastSection, itemsPerPage, currentPage, setCurrentPage, completedPage, setCompletedPage, sidebarFilters, setSidebarFilters }) {
  const navigate = useNavigate()
  
  const createUrlFriendlyTitle = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
  }
  
  const handleCardClick = (card) => {
    const urlTitle = createUrlFriendlyTitle(card.title);
    navigate(`/watch/${urlTitle}/episode-${card.episode}/${card.id}`);
  }
  
  const paginateCards = (items, page) => {
    const startIndex = (page - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return items.slice(startIndex, endIndex)
  }
  
  const needsPagination = sectionTitle.includes('Latest') || sectionTitle.includes('Completed')
  const pageToUse = sectionTitle.includes('Completed') ? completedPage : currentPage
  const setPageToUse = sectionTitle.includes('Completed') ? setCompletedPage : setCurrentPage
  
  const totalPages = Math.ceil(cards.length / itemsPerPage)
  const paginatedCards = needsPagination ? paginateCards(cards, pageToUse) : cards

  return (
    <section className="donghua-section">
      <h2 className="section-title">{sectionTitle}</h2>
      <div className="donghua-grid">
        {paginatedCards.map((card) => (
          <article 
            key={card.id} 
            className="donghua-card"
            onClick={() => handleCardClick(card)}
            tabIndex="0"
            role="button"
            aria-label={`Play ${card.title} Season ${card.season} Episode ${card.episode}`}
          >
            <div className="card-image">
              <img 
                src={card.image} 
                alt={`Cover image for ${card.title}`}
                loading="lazy"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/placeholder.jpg';
                  e.target.parentElement.classList.add('error');
                }}
              />
              <div className="episode-badge">EP {card.episode}</div>
              <div className="status-badge">{card.status}</div>
              <div className="type-badge">{card.type}</div>
              {card.rating && (
                <div className="rating-badge">★ {card.rating}</div>
              )}
            </div>
            <div className="card-info">
              <h3 className="donghua-title">{card.title}</h3>
              <div className="donghua-meta">
                <span>Season {card.season}</span>
                <span>Episode {card.episode}</span>
              </div>
            </div>
          </article>
        ))}
      </div>
      {needsPagination && cards.length > itemsPerPage && (
        <Pagination 
          currentPage={pageToUse}
          totalPages={totalPages}
          onPageChange={setPageToUse}
        />
      )}
      {isLastSection && (
        <div className="mobile-sidebar">
          <Sidebar 
            filters={sidebarFilters} 
            onFilterChange={setSidebarFilters}
          />
        </div>
      )}
    </section>
  )
}

export default CardGrid 