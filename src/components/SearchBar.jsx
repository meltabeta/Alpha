import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function SearchBar({ value, onChange, cards, onSelectResult }) {
  const navigate = useNavigate()

  const createUrlFriendlyTitle = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
  }

  const handleSelectResult = (card) => {
    const urlTitle = createUrlFriendlyTitle(card.title)
    navigate(`/watch/${urlTitle}/episode-${card.episode}/${card.id}`)
    onChange('')
  }

  return (
    <div className="search-container">
      <input
        type="search"
        className="search-input"
        placeholder="Search..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}

export default SearchBar