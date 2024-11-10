import { useState, useEffect } from 'react'
import { ref, onValue } from 'firebase/database'
import { db } from './firebase'
import VideoDetail from './components/VideoDetail'
import Navigation from './components/Navigation'
import CardGrid from './components/CardGrid'
import Sidebar from './components/Sidebar'
import Banner from './components/Banner'
import ScrollToTop from './components/ScrollToTop'
import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import InstallPrompt from './components/InstallPrompt'

function App() {
  const [cards, setCards] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedCard, setSelectedCard] = useState(null)
  const [activeFilter, setActiveFilter] = useState('All')
  const [recommendedCards, setRecommendedCards] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 12 // Adjust based on screen size
  const [completedCards, setCompletedCards] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [sidebarFilters, setSidebarFilters] = useState({
    status: 'all',
    season: 'all',
    rating: 'all'
  })
  const [completedPage, setCompletedPage] = useState(1)

  useEffect(() => {
    setCurrentPage(1)
    setCompletedPage(1)
  }, [activeFilter, searchQuery, sidebarFilters])

  useEffect(() => {
    setLoading(true)
    setError(null)

    try {
      const cardsRef = ref(db, 'cards')
      const unsubscribe = onValue(cardsRef, (snapshot) => {
        const data = snapshot.val()
        if (data) {
          const cardsArray = Object.values(data)
          
          // Apply filters
          let filteredCards = cardsArray

          // Apply search filter
          if (searchQuery.trim()) {
            const searchTerm = searchQuery.toLowerCase()
            filteredCards = filteredCards.filter(card => 
              card.title.toLowerCase().includes(searchTerm) ||
              card.type.toLowerCase().includes(searchTerm) ||
              card.status.toLowerCase().includes(searchTerm)
            )
          }

          // Apply type filter
          if (!searchQuery && activeFilter !== 'All') {
            filteredCards = filteredCards.filter(card => card.type === activeFilter)
          }

          // Apply sidebar filters
          if (sidebarFilters.status !== 'all') {
            filteredCards = filteredCards.filter(card => 
              card.status.toLowerCase() === sidebarFilters.status.toLowerCase()
            )
          }
          if (sidebarFilters.season !== 'all') {
            filteredCards = filteredCards.filter(card => 
              card.season === sidebarFilters.season
            )
          }
          if (sidebarFilters.rating !== 'all') {
            filteredCards = filteredCards.filter(card => 
              parseFloat(card.rating) >= parseFloat(sidebarFilters.rating)
            )
          }

          // Sort by latest update
          const sortedCards = filteredCards.sort((a, b) => {
            const dateA = new Date(a.lastUpdated)
            const dateB = new Date(b.lastUpdated)
            if (dateB - dateA !== 0) return dateB - dateA
            return parseInt(b.episode) - parseInt(a.episode)
          })
          
          // Get recommended cards - always from full dataset
          const recommended = cardsArray
            .filter(card => card.recommended || parseFloat(card.rating) >= 4.5)
            .sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating))
            .slice(0, 6)
          
          // Get completed cards - always from full dataset
          const completed = cardsArray
            .filter(card => card.status === 'Completed')
            .sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating))
          
          setCards(sortedCards)
          setRecommendedCards(recommended)
          setCompletedCards(completed)
          setLoading(false)
        } else {
          setCards([])
          setRecommendedCards([])
          setCompletedCards([])
          setLoading(false)
        }
      }, (error) => {
        setError(error.message)
        setLoading(false)
      })

      return () => {
        unsubscribe()
      }
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }, [activeFilter, searchQuery, sidebarFilters])

  const LoadingSkeleton = () => (
    Array(12).fill(0).map((_, index) => (
      <div key={index} className="donghua-card">
        <div className="card-image loading-skeleton"></div>
        <div className="card-info">
          <div className="donghua-title loading-skeleton" style={{height: '1rem', width: '80%'}}></div>
          <div className="donghua-meta">
            <div className="loading-skeleton" style={{height: '0.8rem', width: '60%'}}></div>
          </div>
        </div>
      </div>
    ))
  )

  const paginateCards = (items, page) => {
    const startIndex = (page - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return items.slice(startIndex, endIndex)
  }

  return (
    <div className="container">
      <header className="site-header">
        <Banner />
      </header>
      
      <Navigation 
        onFilterChange={setActiveFilter} 
        activeFilter={activeFilter}
        onSearch={setSearchQuery}
        searchQuery={searchQuery}
        cards={cards}
      />
      
      <Routes>
        <Route path="/" element={
          <div className="main-layout">
            <div className="desktop-sidebar">
              <Sidebar 
                filters={sidebarFilters} 
                onFilterChange={setSidebarFilters}
              />
            </div>
            <div className="main-content">
              {loading ? (
                <div role="status" aria-live="polite">
                  <LoadingSkeleton />
                </div>
              ) : error ? (
                <div role="alert" className="error-message">
                  Error: {error}
                </div>
              ) : cards.length === 0 ? (
                <div className="no-results">
                  {searchQuery ? 
                    `No results found for "${searchQuery}"` : 
                    'No content available'
                  }
                </div>
              ) : (
                <>
                  <CardGrid 
                    cards={cards}
                    sectionTitle={searchQuery ? 
                      `Search Results for "${searchQuery}"` : 
                      `Latest Updated ${activeFilter !== 'All' ? activeFilter : 'Donghua'}`
                    }
                    isLastSection={false}
                    itemsPerPage={itemsPerPage}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    completedPage={completedPage}
                    setCompletedPage={setCompletedPage}
                    sidebarFilters={sidebarFilters}
                    setSidebarFilters={setSidebarFilters}
                  />
                  {!searchQuery && (
                    <>
                      {recommendedCards.length > 0 && (
                        <CardGrid 
                          cards={recommendedCards}
                          sectionTitle="Recommended for You"
                          isLastSection={false}
                          itemsPerPage={itemsPerPage}
                          currentPage={currentPage}
                          setCurrentPage={setCurrentPage}
                          completedPage={completedPage}
                          setCompletedPage={setCompletedPage}
                          sidebarFilters={sidebarFilters}
                          setSidebarFilters={setSidebarFilters}
                        />
                      )}
                      {completedCards.length > 0 && (
                        <CardGrid 
                          cards={completedCards}
                          sectionTitle="Completed Series"
                          isLastSection={true}
                          itemsPerPage={itemsPerPage}
                          currentPage={currentPage}
                          setCurrentPage={setCurrentPage}
                          completedPage={completedPage}
                          setCompletedPage={setCompletedPage}
                          sidebarFilters={sidebarFilters}
                          setSidebarFilters={setSidebarFilters}
                        />
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        } />
        
        <Route path="/watch/:title/:episode/:id" element={<VideoDetail />} />
        <Route path="/video/:id" element={<VideoDetail />} />
      </Routes>

      <ScrollToTop />
      
      <footer className="site-footer">
        <div className="footer-content">
          <p className="footer-text">
            Developed with ❤️ by <span className="developer-name">Seang Sengly</span>
          </p>
        </div>
      </footer>
      <InstallPrompt />
    </div>
  )
}

function AppWrapper() {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  )
}

export default AppWrapper
