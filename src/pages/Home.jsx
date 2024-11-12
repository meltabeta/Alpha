import { useState, useEffect } from 'react'
import { ref, onValue } from 'firebase/database'
import { db } from '../firebase'
import CardSection from '../components/CardSection'
import Loading from '../components/Loading'

function Home() {
  const [cards, setCards] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const cardsRef = ref(db, 'cards')
    
    // Set up realtime listener
    const unsubscribe = onValue(cardsRef, (snapshot) => {
      if (snapshot.exists()) {
        const cardsData = snapshot.val()
        // Convert to array and sort by lastUpdated
        const sortedCards = Object.values(cardsData)
          .sort((a, b) => {
            const dateA = new Date(a.lastUpdated || 0)
            const dateB = new Date(b.lastUpdated || 0)
            return dateB - dateA // Sort descending (newest first)
          })
        setCards(sortedCards)
      }
      setLoading(false)
    }, (error) => {
      console.error('Error fetching cards:', error)
      setLoading(false)
    })

    // Cleanup subscription on unmount
    return () => unsubscribe()
  }, [])

  if (loading) return <Loading />

  // Filter and sort by type
  const donghuaCards = cards.filter(card => card.type === 'Donghua')
  const animeCards = cards.filter(card => card.type === 'Anime')

  return (
    <div className="home">
      <div className="hero-section">
        <div className="container">
          <div className="hero-content">
            <h1>Welcome to KH-DONGHUA</h1>
            <p>Discover the latest Donghua and Anime series</p>
            <div className="stats-container">
              <div className="stat-item">
                <span className="stat-value">{donghuaCards.length}</span>
                <span className="stat-label">Donghua Series</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{animeCards.length}</span>
                <span className="stat-label">Anime Series</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{cards.length}</span>
                <span className="stat-label">Total Series</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <CardSection title="Donghua" cards={donghuaCards} />
      <CardSection title="Anime" cards={animeCards} />
    </div>
  )
}

export default Home 