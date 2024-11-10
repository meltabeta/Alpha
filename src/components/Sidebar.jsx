import { useState, useEffect } from 'react'
import { ref, onValue, push, serverTimestamp } from 'firebase/database'
import { db } from '../firebase'

function Sidebar({ filters, onFilterChange }) {
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState({
    username: '',
    text: '',
    animeName: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('filters')

  useEffect(() => {
    const commentsRef = ref(db, 'comments')
    const unsubscribe = onValue(commentsRef, (snapshot) => {
      try {
        const data = snapshot.val()
        if (data) {
          const commentsArray = Object.entries(data)
            .map(([id, comment]) => ({
              id,
              ...comment,
              date: new Date(comment.date)
            }))
            .sort((a, b) => b.date - a.date)
            .slice(0, 10)
          setComments(commentsArray)
        } else {
          setComments([])
        }
        setError(null)
      } catch (err) {
        setError('Failed to load comments')
        console.error('Error loading comments:', err)
      } finally {
        setLoading(false)
      }
    })
    return () => unsubscribe()
  }, [])

  const handleSubmitComment = async (e) => {
    e.preventDefault()
    if (!newComment.username.trim() || !newComment.text.trim()) return

    setIsSubmitting(true)
    setError(null)

    try {
      const commentsRef = ref(db, 'comments')
      await push(commentsRef, {
        ...newComment,
        date: serverTimestamp(),
        timestamp: new Date().toISOString()
      })

      setNewComment({ username: '', text: '', animeName: '' })
      
      // Success feedback
      const form = e.target
      form.classList.add('submitted')
      setTimeout(() => form.classList.remove('submitted'), 2000)
    } catch (err) {
      setError('Failed to post comment')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-tabs">
        <button
          className={`tab-button ${activeTab === 'filters' ? 'active' : ''}`}
          onClick={() => setActiveTab('filters')}
        >
          <span className="tab-icon">🔍</span>
          Filters
        </button>
        <button
          className={`tab-button ${activeTab === 'comments' ? 'active' : ''}`}
          onClick={() => setActiveTab('comments')}
        >
          <span className="tab-icon">💭</span>
          Comments
        </button>
      </div>

      <div className="sidebar-content">
        {activeTab === 'filters' ? (
          <section className="filter-section">
            <h3>Filters</h3>
            
            <div className="filter-group">
              <label>Status</label>
              <select 
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="Ongoing">Ongoing</option>
                <option value="Completed">Completed</option>
                <option value="Upcoming">Upcoming</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Season</label>
              <select 
                value={filters.season}
                onChange={(e) => handleFilterChange('season', e.target.value)}
              >
                <option value="all">All Seasons</option>
                {[1, 2, 3, 4, 5].map(season => (
                  <option key={season} value={season}>Season {season}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Rating</label>
              <select 
                value={filters.rating}
                onChange={(e) => handleFilterChange('rating', e.target.value)}
              >
                <option value="all">All Ratings</option>
                <option value="4.5">4.5+ Stars</option>
                <option value="4">4+ Stars</option>
                <option value="3.5">3.5+ Stars</option>
              </select>
            </div>
          </section>
        ) : (
          <section className="comments-section">
            <form onSubmit={handleSubmitComment} className="comment-form">
              <div className="form-header">
                <h3>Share Your Thoughts</h3>
                <span className="comment-count">{comments.length} comments</span>
              </div>
              
              <div className="form-fields">
                <div className="input-group">
                  <input
                    type="text"
                    placeholder="Your Name"
                    value={newComment.username}
                    onChange={(e) => setNewComment(prev => ({
                      ...prev,
                      username: e.target.value
                    }))}
                    required
                    maxLength={50}
                    className="modern-input"
                  />
                  <div className="input-focus-border"></div>
                </div>

                <div className="input-group">
                  <input
                    type="text"
                    placeholder="Anime Name (optional)"
                    value={newComment.animeName}
                    onChange={(e) => setNewComment(prev => ({
                      ...prev,
                      animeName: e.target.value
                    }))}
                    maxLength={100}
                    className="modern-input"
                  />
                  <div className="input-focus-border"></div>
                </div>

                <div className="input-group">
                  <textarea
                    placeholder="Your Comment"
                    value={newComment.text}
                    onChange={(e) => setNewComment(prev => ({
                      ...prev,
                      text: e.target.value
                    }))}
                    required
                    maxLength={500}
                    rows="3"
                    className="modern-input"
                  />
                  <div className="input-focus-border"></div>
                  <span className="char-count">
                    {500 - newComment.text.length} characters remaining
                  </span>
                </div>
              </div>

              {error && <div className="error-message">{error}</div>}
              
              <button
                type="submit"
                className="submit-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="loading-spinner"></span>
                ) : (
                  'Post Comment'
                )}
              </button>
            </form>

            <div className="comments-list">
              {loading ? (
                <div className="comments-loading">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="comment-skeleton">
                      <div className="skeleton-avatar"></div>
                      <div className="skeleton-content">
                        <div className="skeleton-header"></div>
                        <div className="skeleton-text"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : comments.length > 0 ? (
                comments.map((comment) => (
                  <div key={comment.id} className="comment-card">
                    <div className="comment-avatar">
                      {comment.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="comment-content">
                      <div className="comment-header">
                        <span className="comment-author">{comment.username}</span>
                        <time className="comment-time" dateTime={comment.timestamp}>
                          {new Date(comment.date).toLocaleDateString()}
                        </time>
                      </div>
                      <p className="comment-text">{comment.text}</p>
                      {comment.animeName && (
                        <div className="comment-anime-tag">
                          {comment.animeName}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-comments">
                  <span className="no-comments-icon">💭</span>
                  <p>Be the first to comment!</p>
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </aside>
  )
}

export default Sidebar