import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ref, get } from 'firebase/database'
import { db } from '../firebase'
import CardSection from '../components/CardSection'
import Loading from '../components/Loading'

function Search() {
  const [searchParams] = useSearchParams()
  const [searchResults, setSearchResults] = useState([])
  const [loading, setLoading] = useState(true)
  const query = searchParams.get('q')

  useEffect(() => {
    const searchCards = async () => {
      setLoading(true)
      try {
        const cardsRef = ref(db, 'cards')
        const snapshot = await get(cardsRef)
        
        if (snapshot.exists() && query) {
          const cardsData = Object.values(snapshot.val())
          const filteredCards = cardsData.filter(card => 
            card.title.toLowerCase().includes(query.toLowerCase())
          )
          setSearchResults(filteredCards)
        } else {
          setSearchResults([])
        }
      } catch (error) {
        console.error('Error searching cards:', error)
      } finally {
        setLoading(false)
      }
    }

    searchCards()
  }, [query])

  if (loading) return <Loading />

  return (
    <div className="search-page">
      {query ? (
        <>
          <h1>Search Results for "{query}"</h1>
          {searchResults.length > 0 ? (
            <CardSection title="Results" cards={searchResults} />
          ) : (
            <div className="no-results">
              No results found for "{query}"
            </div>
          )}
        </>
      ) : (
        <div className="no-query">
          Enter a search term to find titles
        </div>
      )}
    </div>
  )
}

export default Search 