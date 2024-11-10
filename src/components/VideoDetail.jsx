import { useEffect, useState, useRef } from 'react';
import { useParams, useLocation, Link, useNavigate } from 'react-router-dom';
import { ref, get } from 'firebase/database';
import { db } from '../firebase';
import './VideoDetail.css';
import LoadingSpinner from './LoadingSpinner';

export default function VideoDetail() {
  const { id, title, episode } = useParams();
  const location = useLocation();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentEpisode, setCurrentEpisode] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const navigate = useNavigate();
  const [searchEpisode, setSearchEpisode] = useState('');
  const [isFullScreen, setIsFullScreen] = useState(false);
  const videoWrapperRef = useRef(null);
  const [videoError, setVideoError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshProgress, setRefreshProgress] = useState(0);
  let startY = 0;

  const isValidVideoUrl = (url) => {
    if (!url) return false;
    
    // Add validation for supported platforms
    const supportedPlatforms = [
      'youtube.com',
      'youtu.be',
      'dailymotion.com',
      'dai.ly',
      'rumble.com',
      'vimeo.com',
      'facebook.com',
      'fb.watch',
      'bilibili.com',
      'streamable.com'
    ];
    
    return supportedPlatforms.some(platform => url.includes(platform));
  };

  // Function to sanitize and format iframe URLs
  const formatVideoUrl = (url) => {
    if (!isValidVideoUrl(url)) {
      console.warn('Invalid or unsupported video URL:', url);
      return '';
    }
    
    try {
      // Handle YouTube URLs
      if (url.includes('youtube.com') || url.includes('youtu.be')) {
        const videoId = url.includes('youtu.be') 
          ? url.split('/').pop()
          : url.split('v=')[1]?.split('&')[0];
        return `https://www.youtube.com/embed/${videoId}`;
      }

      // Handle Dailymotion URLs
      if (url.includes('dailymotion.com') || url.includes('dai.ly')) {
        const videoId = url.includes('dai.ly')
          ? url.split('/').pop()
          : url.split('/video/')[1]?.split('?')[0];
        return `https://www.dailymotion.com/embed/video/${videoId}`;
      }

      // Handle Rumble URLs
      if (url.includes('rumble.com')) {
        if (url.includes('embed')) return url;
        return url.replace('rumble.com', 'rumble.com/embed');
      }

      // Handle Vimeo URLs
      if (url.includes('vimeo.com')) {
        const videoId = url.split('/').pop();
        return `https://player.vimeo.com/video/${videoId}`;
      }

      // Handle Facebook URLs
      if (url.includes('facebook.com') || url.includes('fb.watch')) {
        if (url.includes('embed')) return url;
        return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false`;
      }

      // Handle Bilibili URLs
      if (url.includes('bilibili.com')) {
        const videoId = url.match(/\/video\/(.*?)\/?$/)?.[1];
        if (videoId) {
          return `https://player.bilibili.com/player.html?bvid=${videoId}`;
        }
      }

      // Handle Streamable URLs
      if (url.includes('streamable.com')) {
        const videoId = url.split('/').pop();
        return `https://streamable.com/e/${videoId}`;
      }

      // If no specific handling needed, return the original URL
      return url;
    } catch (error) {
      console.error('Error formatting video URL:', error);
      return '';
    }
  };

  const fetchRecommendations = async () => {
    try {
      const cardsRef = ref(db, 'cards');
      const snapshot = await get(cardsRef);
      
      if (snapshot.exists()) {
        const allVideos = Object.values(snapshot.val());
        // Filter out current video and get random recommendations
        const filteredVideos = allVideos
          .filter(v => v.id !== id)
          .sort(() => Math.random() - 0.5)
          .slice(0, 6);
        
        setRecommendations(filteredVideos);
      }
    } catch (err) {
      console.error('Error fetching recommendations:', err);
    }
  };

  const sortEpisodes = (a, b) => {
    // Helper function to get the episode number
    const getEpisodeNumber = (ep) => {
      const epStr = String(ep.episode);
      // Check for range formats (e.g., "01 to 04" or "10 - 04")
      if (epStr.includes('to') || epStr.includes('-')) {
        // Get the last number in the range
        const matches = epStr.match(/\d+/g);
        return matches ? parseInt(matches[matches.length - 1]) : 0;
      }
      // Regular episode number
      return parseInt(epStr.replace(/\D/g, '')) || 0;
    };

    // Special handling for episodes 01-06
    const isSpecialEpisode = (ep) => {
      const epNum = getEpisodeNumber(ep);
      return epNum >= 1 && epNum <= 6;
    };
    
    // If one is special and other isn't, special goes to end
    if (isSpecialEpisode(a) && !isSpecialEpisode(b)) return 1;
    if (!isSpecialEpisode(a) && isSpecialEpisode(b)) return -1;
    
    // If both are special, maintain their natural order
    if (isSpecialEpisode(a) && isSpecialEpisode(b)) {
      const numA = getEpisodeNumber(a);
      const numB = getEpisodeNumber(b);
      return numA - numB;
    }
    
    // For regular episodes, sort in descending order
    const numA = getEpisodeNumber(a);
    const numB = getEpisodeNumber(b);
    return numB - numA;
  };

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        console.log('Fetching video with id:', id);
        
        const videoRef = ref(db, `cards/${id}`);
        const snapshot = await get(videoRef);
        
        if (snapshot.exists()) {
          const videoData = snapshot.val();
          
          // Fetch all episodes
          const episodesRef = ref(db, `videos/${id}`);
          const episodesSnapshot = await get(episodesRef);
          
          if (episodesSnapshot.exists()) {
            videoData.episodes = episodesSnapshot.val();
            
            // Get all episodes and sort them using our sortEpisodes function
            const sortedEpisodes = Object.values(videoData.episodes)
              .sort((a, b) => sortEpisodes(a, b));

            // Get the first episode from the sorted list (will be the latest regular episode)
            const latestEpisode = sortedEpisodes[0];
            
            if (latestEpisode) {
              latestEpisode.src = formatVideoUrl(latestEpisode.src);
              setCurrentEpisode(latestEpisode);
            }

            // Format all episode URLs
            Object.keys(videoData.episodes).forEach(key => {
              videoData.episodes[key].src = formatVideoUrl(videoData.episodes[key].src);
            });
          }
          
          setVideo(videoData);
          await fetchRecommendations();
          
        } else {
          setError('Video not found');
        }
      } catch (err) {
        setError('Error loading video details');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchVideo();
  }, [id]);

  const handleEpisodeClick = (episodeData) => {
    episodeData.src = formatVideoUrl(episodeData.src);
    setCurrentEpisode(episodeData);
  };

  const filteredEpisodes = video?.episodes ? 
    Object.entries(video.episodes)
      .filter(([, ep]) => 
        ep.episode.toString().includes(searchEpisode)
      )
      .sort(([, a], [, b]) => sortEpisodes(a, b)) : [];

  const handleFullScreen = () => {
    if (!videoWrapperRef.current) return;

    if (!document.fullscreenElement) {
      videoWrapperRef.current.requestFullscreen();
      setIsFullScreen(true);
    } else {
      document.exitFullscreen();
      setIsFullScreen(false);
    }
  };

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // Handle pull to refresh
  const handleTouchStart = (e) => {
    startY = e.touches[0].clientY;
  };

  const handleTouchMove = (e) => {
    const currentY = e.touches[0].clientY;
    const diff = currentY - startY;
    
    if (window.scrollY === 0 && diff > 0) {
      const progress = Math.min(diff / 100, 1);
      setRefreshProgress(progress);
      
      if (progress >= 1 && !isRefreshing) {
        handleRefresh();
      }
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate refresh
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsRefreshing(false);
    setRefreshProgress(0);
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!video) return <div className="not-found">Video not found</div>;

  return (
    <div 
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={() => !isRefreshing && setRefreshProgress(0)}
    >
      {(isRefreshing || refreshProgress > 0) && (
        <div 
          className="pull-to-refresh"
          style={{ transform: `scaleX(${refreshProgress})` }}
        />
      )}
      
      <div className="video-detail-wrapper">
        <div className="video-detail">
          <div className="breadcrumb-navigation">
            <Link to="/" className="breadcrumb-item">
              Home
            </Link>
            <span className="breadcrumb-separator">›</span>
            <span className="breadcrumb-item">{video.title}</span>
            <span className="breadcrumb-separator">›</span>
            <span className="breadcrumb-item">Episode {currentEpisode?.episode}</span>
          </div>

          <div className="video-player-layout">
            <div className="video-player-section">
              {currentEpisode ? (
                <div className="current-episode">
                  <div className="video-wrapper" ref={videoWrapperRef}>
                    {currentEpisode?.src ? (
                      <iframe
                        src={currentEpisode.src}
                        title={`${video.title} - Episode ${currentEpisode.episode}`}
                        frameBorder="0"
                        allowFullScreen
                        allow="encrypted-media; picture-in-picture"
                        onError={() => setVideoError(true)}
                      />
                    ) : (
                      <div className="video-error">
                        <p>Video not available</p>
                      </div>
                    )}
                    <div className="video-controls">
                      <button 
                        className="fullscreen-button"
                        onClick={handleFullScreen}
                        aria-label={isFullScreen ? "Exit fullscreen" : "Enter fullscreen"}
                      >
                        {isFullScreen ? "Exit Fullscreen" : "Fullscreen"}
                      </button>
                    </div>
                  </div>

                  <div className="episode-navigation">
                    <button
                      className="nav-button prev-episode"
                      onClick={() => {
                        const currentIndex = filteredEpisodes.findIndex(([, ep]) => ep.episode === currentEpisode.episode);
                        if (currentIndex > 0) {
                          const [, prevEpisode] = filteredEpisodes[currentIndex - 1];
                          handleEpisodeClick(prevEpisode);
                        }
                      }}
                      disabled={filteredEpisodes.findIndex(([, ep]) => ep.episode === currentEpisode.episode) === 0}
                    >
                      <span>← Previous Episode</span>
                    </button>
                    <button
                      className="nav-button next-episode"
                      onClick={() => {
                        const currentIndex = filteredEpisodes.findIndex(([, ep]) => ep.episode === currentEpisode.episode);
                        if (currentIndex < filteredEpisodes.length - 1) {
                          const [, nextEpisode] = filteredEpisodes[currentIndex + 1];
                          handleEpisodeClick(nextEpisode);
                        }
                      }}
                      disabled={filteredEpisodes.findIndex(([, ep]) => ep.episode === currentEpisode.episode) === filteredEpisodes.length - 1}
                    >
                      <span>Next Episode →</span>
                    </button>
                  </div>

                  <div className="current-episode-info">
                    <h1>{video.title}</h1>
                    <h3>Episode {currentEpisode.episode}</h3>
                  </div>

                  <div className="video-info">
                    <div className="info-header">
                      <div className="info-poster">
                        <img 
                          src={video.image} 
                          alt={video.title}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/placeholder.jpg';
                          }}
                        />
                        {video.status && (
                          <div className="status-badge">{video.status}</div>
                        )}
                      </div>
                      <div className="info-details">
                        <div className="info-grid">
                          <div className="info-item">
                            <span className="info-label">Season</span>
                            <span className="info-value">{video.season || 'N/A'}</span>
                          </div>
                          <div className="info-item">
                            <span className="info-label">Status</span>
                            <span className="info-value">
                              <span className={`status-dot ${video.status?.toLowerCase()}`}></span>
                              {video.status || 'N/A'}
                            </span>
                          </div>
                          <div className="info-item">
                            <span className="info-label">Rating</span>
                            <span className="info-value">
                              <div className="rating">
                                <span className="rating-number">{video.rating || 'N/A'}</span>
                              </div>
                            </span>
                          </div>
                          <div className="info-item">
                            <span className="info-label">Type</span>
                            <span className="info-value">{video.type || 'N/A'}</span>
                          </div>
                          <div className="info-item">
                            <span className="info-label">Total Episodes</span>
                            <span className="info-value">{Object.keys(video.episodes || {}).length}</span>
                          </div>
                          <div className="info-item">
                            <span className="info-label">Last Updated</span>
                            <span className="info-value">
                              {new Date(video.lastUpdated).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    {video.description && (
                      <div className="video-description">
                        <h3>Description</h3>
                        <p>{video.description}</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="no-video-message">
                  <div className="message-content">
                    <h3>Welcome to {video.title}</h3>
                    <p>Please select an episode from the list to start watching.</p>
                    <div className="episode-hint">
                      <span className="arrow">→</span>
                      <span>Choose from episodes list</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="playlist-sidebar">
              <div className="playlist-header">
                <h2>Episodes List</h2>
                <span>{Object.keys(video.episodes || {}).length} episodes</span>
              </div>
              
              <div className="episode-search">
                <input
                  type="number"
                  placeholder="Search episode..."
                  value={searchEpisode}
                  onChange={(e) => setSearchEpisode(e.target.value)}
                  min="1"
                />
              </div>

              <div className="episodes-list custom-scrollbar">
                {filteredEpisodes.map(([episodeId, episodeData]) => (
                  <div
                    key={episodeId}
                    className={`episode-item ${currentEpisode?.episode === episodeData.episode ? 'active' : ''}`}
                    onClick={() => handleEpisodeClick(episodeData)}
                  >
                    <div className="episode-thumbnail">
                      <img src={video.image} alt={`Episode ${episodeData.episode}`} />
                      {currentEpisode?.episode === episodeData.episode && (
                        <div className="now-playing">Now Playing</div>
                      )}
                    </div>
                    <div className="episode-info">
                      <h3>Episode {episodeData.episode}</h3>
                      <p>{new Date(episodeData.postingVideoDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="recommendations-section">
            <h2 className="section-title">Recommended For You</h2>
            <div className="recommendations-grid">
              {recommendations.map((item) => (
                <div 
                  key={item.id} 
                  className="recommendation-card"
                  onClick={() => {
                    const urlTitle = item.title
                      .toLowerCase()
                      .replace(/[^a-z0-9\s-]/g, '')
                      .replace(/\s+/g, '-')
                      .replace(/-+/g, '-');
                    navigate(`/watch/${urlTitle}/episode-${item.episode}/${item.id}`);
                  }}
                >
                  <div className="recommendation-thumbnail">
                    <img 
                      src={item.image} 
                      alt={item.title}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/placeholder.jpg';
                      }}
                    />
                    <div className="episode-badge">EP {item.episode}</div>
                    <div className="status-badge">{item.status}</div>
                  </div>
                  <div className="recommendation-info">
                    <h3>{item.title}</h3>
                    <div className="meta-info">
                      <span>Season {item.season}</span>
                      <span>•</span>
                      <span>{item.type}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 