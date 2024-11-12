export function createUrlSlug(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, '-')     // Replace spaces and underscores with hyphens
    .replace(/[^\w\-]+/g, '')    // Remove all non-word chars except hyphens
    .replace(/\-\-+/g, '-')      // Replace multiple hyphens with single hyphen
    .replace(/^-+/, '')          // Trim hyphens from start
    .replace(/-+$/, '');         // Trim hyphens from end
}

export function formatEpisodeNumber(episode) {
  if (!episode) return '1'
  
  // Handle various episode number formats
  const episodeStr = episode.toString()
  
  // Extract numbers from the episode string
  const numbers = episodeStr.match(/\d+/g)
  if (!numbers) return '1'
  
  // If it's a range (e.g., "1-2" or "01 - 04"), keep the range format
  if (episodeStr.includes('-')) {
    // Clean up the range format to be consistent
    return episodeStr.replace(/\s+/g, '').replace(/[^\d-]/g, '')
  }
  
  // Otherwise, return just the first number without leading zeros
  return numbers[0].replace(/^0+/, '') || '1'
}

export function normalizeEpisodeNumber(episode) {
  if (!episode) return '1'
  
  // Remove 'episode-' prefix if it exists
  const cleanEpisode = episode.replace(/^episode-/, '')
  
  // Format the episode number consistently
  return formatEpisodeNumber(cleanEpisode)
} 