import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ref, get } from 'firebase/database'
import { db } from '../firebase'
import Loading from '../components/Loading'
import { createUrlSlug, formatEpisodeNumber } from '../utils/urlFormatter'
import '../components/Playlist.css'

function Playlist() {
  const { type, id } = useParams()
  const [card, setCard] = useState(null)
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [relatedCards, setRelatedCards] = useState([])
  const [selectedVideo, setSelectedVideo] = useState(0)
  const [recommendedVideos, setRecommendedVideos] = useState([])
  const [currentVideo, setCurrentVideo] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchCardAndVideos = async () => {
      setLoading(true)
      try {
        // Fetch card data
        const cardRef = ref(db, `cards/${id}`)
        const cardSnapshot = await get(cardRef)

        if (cardSnapshot.exists()) {
          setCard(cardSnapshot.val())
          
          // Fetch videos for this card
          const videosRef = ref(db, `videos/${id}`)
          const videosSnapshot = await get(videosRef)
          
          if (videosSnapshot.exists()) {
            const videosData = Object.values(videosSnapshot.val())
              .sort((a, b) => {
                // Sort by episode number, handling ranges like "1 - 5"
                const getFirstNumber = (ep) => parseInt(ep.episode.split('-')[0])
                return getFirstNumber(b) - getFirstNumber(a)
              })
            setVideos(videosData)
          }

          // Fetch related cards (same series)
          const allCardsRef = ref(db, 'cards')
          const allCardsSnapshot = await get(allCardsRef)
          if (allCardsSnapshot.exists()) {
            const cards = Object.values(allCardsSnapshot.val())
            const related = cards.filter(c => 
              c.title === cardSnapshot.val().title && c.id !== id
            ).sort((a, b) => a.episode - b.episode)
            setRelatedCards(related)
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCardAndVideos()
  }, [id])

  useEffect(() => {
    const fetchRecommendedVideos = async () => {
      const recommendedRef = ref(db, 'cards')
      const snapshot = await get(recommendedRef)
      if (snapshot.exists()) {
        const allCards = Object.values(snapshot.val())
        
        // Filter out the current card
        const otherCards = allCards.filter(c => c.id !== id)
        
        // Calculate recommendation scores
        const scoredCards = otherCards.map(c => ({
          ...c,
          score: calculateRecommendationScore(c, card)
        }))
        
        // Sort by score and take top 6
        const recommendations = scoredCards
          .sort((a, b) => b.score - a.score)
          .slice(0, 6)
        
        setRecommendedVideos(recommendations)
      }
    }

    // Helper function to calculate recommendation score
    const calculateRecommendationScore = (candidate, currentCard) => {
      let score = 0
      
      // Same type (highest priority)
      if (candidate.type === currentCard.type) {
        score += 100
      }
      
      // Similar season
      if (candidate.season === currentCard.season) {
        score += 30
      }
      
      // Same status
      if (candidate.status === currentCard.status) {
        score += 20
      }
      
      // Recent updates (within last 7 days)
      const lastUpdated = new Date(candidate.lastUpdated)
      const daysSinceUpdate = (new Date() - lastUpdated) / (1000 * 60 * 60 * 24)
      if (daysSinceUpdate <= 7) {
        score += Math.max(0, 20 - (daysSinceUpdate * 2)) // Gradually decrease score
      }
      
      // Similar episode count (closer = higher score)
      const episodeDiff = Math.abs(
        parseInt(candidate.episode) - parseInt(currentCard.episode)
      )
      score += Math.max(0, 10 - episodeDiff)
      
      // Add small random factor to mix things up (1-5 points)
      score += Math.random() * 4 + 1
      
      return score
    }

    if (card) {
      fetchRecommendedVideos()
    }
  }, [id, card])

  // Update getVideoEmbedUrl function to handle all video platforms
  const getVideoEmbedUrl = (src) => {
    if (!src) return ''
    
    if (src.includes('rumble.com')) {
      return src // Rumble embed URLs can be used as-is
    } else if (src.includes('dai.ly') || src.includes('dailymotion.com')) {
      // Handle both short and full Dailymotion URLs
      const videoId = src.includes('dai.ly') 
        ? src.split('/').pop()
        : src.split('video/')[1]?.split('?')[0]
      return `https://www.dailymotion.com/embed/video/${videoId}`
    } else if (src.includes('youtube.com') || src.includes('youtu.be')) {
      // Handle YouTube URLs
      const videoId = src.includes('youtu.be') 
        ? src.split('/').pop()
        : src.split('v=')[1]?.split('&')[0]
      return `https://www.youtube.com/embed/${videoId}`
    }
    return src // Return original URL if no matches
  }

  // Update video when selectedVideo changes
  useEffect(() => {
    if (videos.length > 0 && selectedVideo >= 0) {
      setCurrentVideo(videos[selectedVideo])
    }
  }, [videos, selectedVideo])

  // Update selected video when navigating to a new episode
  useEffect(() => {
    if (videos.length > 0) {
      // Reset to first video when changing episodes
      setSelectedVideo(0)
      setCurrentVideo(videos[0])
    }
  }, [id, videos]) // Add id as dependency to reset when changing episodes

  // Update the playlist item click handler
  const handleVideoSelect = (video, index) => {
    setSelectedVideo(index)
    setCurrentVideo(video)
    
    // Update URL to include episode number
    const newUrl = `/${type}/${createUrlSlug(card.title)}/episode-${formatEpisodeNumber(video.episode)}/${id}`
    navigate(newUrl, { replace: true })
  }

  if (loading) return <Loading />
  if (!card) return <div>Card not found</div>

  const episodeNumber = parseInt(card.episode)
  const nextEpisode = relatedCards.find(c => parseInt(c.episode) === episodeNumber + 1)
  const prevEpisode = relatedCards.find(c => parseInt(c.episode) === episodeNumber - 1)

  return (
    <div className="playlist-page">
      <div className="playlist-container">
        <div className="main-content">
          {/* Breadcrumb Navigation */}
          <nav className="breadcrumb">
            <Link to="/">Home</Link>
            <span className="separator">/</span>
            <Link to={`/${type.toLowerCase()}`}>{type}</Link>
            <span className="separator">/</span>
            <span>{card?.title}</span>
          </nav>
          <div className="video-section">
            <div className="video-player">
              {currentVideo && (
                <iframe
                  className="video-iframe"
                  src={getVideoEmbedUrl(currentVideo.src)}
                  allowFullScreen
                  title={`${card?.title} - Episode ${currentVideo.episode}`}
                ></iframe>
              )}
            </div>
            {/* New control section */}
            <div className="video-control-section">
              {prevEpisode ? (
                <Link 
                  to={`/${type}/${createUrlSlug(prevEpisode.title)}/${prevEpisode.id}`} 
                  className="control-button"
                >
                  <i className="fas fa-step-backward"></i>
                  <span>Previous</span>
                </Link>
              ) : (
                <div className="control-button disabled">
                  <i className="fas fa-step-backward"></i>
                  <span>Previous</span>
                </div>
              )}
              
              <button 
                className="control-button"
                onClick={() => {
                  const iframe = document.querySelector('.video-iframe');
                  if (iframe) {
                    const requestFullScreen = iframe.requestFullscreen || 
                                            iframe.mozRequestFullScreen || 
                                            iframe.webkitRequestFullScreen;
                    if (requestFullScreen) {
                      requestFullScreen.bind(iframe)();
                    }
                  }
                }}
              >
                <i className="fas fa-expand"></i>
                <span>Fullscreen</span>
              </button>
              
              {nextEpisode ? (
                <Link 
                  to={`/${type}/${createUrlSlug(nextEpisode.title)}/${nextEpisode.id}`} 
                  className="control-button"
                >
                  <span>Next</span>
                  <i className="fas fa-step-forward"></i>
                </Link>
              ) : (
                <div className="control-button disabled">
                  <span>Next</span>
                  <i className="fas fa-step-forward"></i>
                </div>
              )}
            </div>
            <div className="video-details">
              <div className="video-header">
                <h1>
                  {card?.title} - Episode {currentVideo?.episode || videos[0]?.episode || card?.episode}
                </h1>
                <div className="episode-navigation">
                  {prevEpisode && (
                    <Link 
                      to={`/${type}/${createUrlSlug(prevEpisode.title)}/${prevEpisode.id}`} 
                      className="nav-btn prev"
                      title="Previous Episode"
                    >
                      <i className="fas fa-chevron-left"></i>
                    </Link>
                  )}
                  {nextEpisode && (
                    <Link 
                      to={`/${type}/${createUrlSlug(nextEpisode.title)}/${nextEpisode.id}`} 
                      className="nav-btn next"
                      title="Next Episode"
                    >
                      <i className="fas fa-chevron-right"></i>
                    </Link>
                  )}
                </div>
              </div>
              <div className="video-meta">
                <span className="badge badge-type">{card?.type}</span>
                <span className="badge badge-episode">
                  Episode {currentVideo?.episode || videos[0]?.episode || card?.episode}
                </span>
                {card?.season > 1 && (
                  <span className="badge badge-season">Season {card?.season}</span>
                )}
                <span className={`badge badge-${card?.status?.toLowerCase()}`}>
                  {card?.status}
                </span>
              </div>
              {card?.description && (
                <p className="video-description">{card.description}</p>
              )}
            </div>
          </div>
        </div>

        <div className="playlist-sidebar">
          <div className="playlist-header">
            <h3>Episodes</h3>
            <span className="episode-count">{videos.length} Episodes</span>
          </div>
          <div className="playlist-items">
            {videos.map((video, index) => (
              <div 
                key={video.videoId}
                className={`playlist-item ${index === selectedVideo ? 'active' : ''}`}
                onClick={() => handleVideoSelect(video, index)}
              >
                <div className="episode-thumbnail">
                  <img src={card?.image} alt={`Episode ${video.episode}`} />
                  <span className="episode-duration">Full</span>
                </div>
                <div className="episode-info">
                  <span className="episode-number">Episode {video.episode}</span>
                  <span className="episode-title">{video.title || card?.title}</span>
                  {video.postingVideoDate && (
                    <span className="episode-date">
                      {new Date(video.postingVideoDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="recommended-videos">
          <h3>Recommended For You</h3>
          <div className="recommended-list">
            {recommendedVideos.map((video) => (
              <Link 
                key={video.id} 
                to={`/${type}/${createUrlSlug(video.title)}/${video.id}`}
                className="recommended-item"
              >
                <div className="recommended-thumbnail">
                  <img src={video.image} alt={video.title} />
                  {video.status && (
                    <span className={`thumbnail-badge badge-${video.status.toLowerCase()}`}>
                      {video.status}
                    </span>
                  )}
                </div>
                <div className="recommended-info">
                  <h4 className="recommended-title">{video.title}</h4>
                  <div className="recommended-meta">
                    <span>EP {video.episode}</span>
                    {video.season && <span> • S{video.season}</span>}
                    {video.lastUpdated && (
                      <span className="update-date">
                        • Updated {formatRelativeTime(new Date(video.lastUpdated))}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper function to format relative time
function formatRelativeTime(date) {
  const now = new Date()
  const diffTime = Math.abs(now - date)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  return `${Math.floor(diffDays / 30)} months ago`
}

export default Playlist