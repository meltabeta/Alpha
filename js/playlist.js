// Initialize Firebase (using the existing config)
const firebaseConfig = {
    apiKey: "AIzaSyAyVzoSJAhb63WbAbjSRVRrIRGGifN9AeI",
    authDomain: "movieflix-c8223.firebaseapp.com",
    databaseURL: "https://movieflix-c8223-default-rtdb.firebaseio.com",
    projectId: "movieflix-c8223",
    storageBucket: "movieflix-c8223.firebasestorage.app",
    messagingSenderId: "745071272054",
    appId: "1:745071272054:web:01021955f18bf87a997f57"
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Constants for pagination
const EPISODES_PER_PAGE = 10;
let currentPage = 1;

// Search functionality
function initializeSearch() {
    const searchTrigger = document.querySelector('.search-trigger');
    const searchOverlay = document.querySelector('.search-overlay');
    const closeSearchBtn = document.querySelector('.btn-close-search');
    const searchInput = document.querySelector('.search-input');
    const searchResults = document.getElementById('searchResults');

    // Toggle search overlay
    searchTrigger.addEventListener('click', () => {
        searchOverlay.classList.add('active');
        searchInput.focus();
        document.body.style.overflow = 'hidden';
    });

    closeSearchBtn.addEventListener('click', closeSearch);

    // Close on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && searchOverlay.classList.contains('active')) {
            closeSearch();
        }
    });

    // Handle search input with debouncing
    let debounceTimer;
    searchInput.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            const searchTerm = searchInput.value.trim().toLowerCase();
            if (searchTerm.length >= 2) {
                performSearch(searchTerm);
            } else {
                clearSearchResults();
            }
        }, 300);
    });

    // Click outside to close
    searchOverlay.addEventListener('click', (e) => {
        if (e.target === searchOverlay) {
            closeSearch();
        }
    });
}

function closeSearch() {
    const searchOverlay = document.querySelector('.search-overlay');
    const searchInput = document.querySelector('.search-input');
    searchOverlay.classList.remove('active');
    searchInput.value = '';
    clearSearchResults();
    document.body.style.overflow = '';
}

function clearSearchResults() {
    const searchResults = document.getElementById('searchResults');
    searchResults.innerHTML = '';
}

async function performSearch(searchTerm) {
    const searchResults = document.getElementById('searchResults');
    
    // Show loading state
    searchResults.innerHTML = `
        <div class="col-12 text-center">
            <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>`;

    try {
        const snapshot = await database.ref('cards').once('value');
        const playlists = snapshot.val();
        
        const results = Object.values(playlists).filter(playlist => 
            playlist.title.toLowerCase().includes(searchTerm) ||
            (playlist.description && playlist.description.toLowerCase().includes(searchTerm))
        );

        if (results.length === 0) {
            searchResults.innerHTML = `
                <div class="col-12">
                    <div class="no-results">
                        <i class="fas fa-search mb-3"></i>
                        <p>No results found for "${searchTerm}"</p>
                    </div>
                </div>`;
            return;
        }

        searchResults.innerHTML = results.map(playlist => `
            <div class="col">
                <a href="playlist.html?id=${playlist.id}" class="search-result-card">
                    <img src="${playlist.image}" alt="${playlist.title}" class="result-image" loading="lazy">
                    <div class="result-info">
                        <h3 class="result-title">${playlist.title}</h3>
                        <div class="result-meta">
                            <span class="badge bg-primary">${playlist.type}</span>
                            <span class="badge ${playlist.status === 'Ongoing' ? 'bg-success' : 'bg-secondary'}">${playlist.status}</span>
                            ${playlist.rating ? `<span class="badge bg-warning">★ ${playlist.rating}</span>` : ''}
                        </div>
                    </div>
                </a>
            </div>
        `).join('');

    } catch (error) {
        console.error('Search error:', error);
        searchResults.innerHTML = `
            <div class="col-12">
                <div class="no-results">
                    <i class="fas fa-exclamation-circle mb-3"></i>
                    <p>An error occurred while searching. Please try again.</p>
                </div>
            </div>`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Initialize search functionality
    initializeSearch();
    
    // Get playlist ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const playlistId = urlParams.get('id');
    
    if (playlistId) {
        loadPlaylistDetails(playlistId);
    } else {
        showError('No playlist ID provided');
    }
});

async function loadPlaylistDetails(playlistId) {
    try {
        // Load playlist info
        const playlistSnapshot = await database.ref(`cards/${playlistId}`).once('value');
        const playlistData = playlistSnapshot.val();

        if (!playlistData) {
            throw new Error('Playlist not found');
        }

        // Store current playlist
        currentPlaylist = playlistData;

        // Display playlist info
        displayPlaylistInfo(playlistData);
        
        // Load recommendations after displaying playlist info
        await loadRecommendations(playlistData);

        // Load episodes
        const episodesSnapshot = await database.ref(`videos/${playlistId}`).once('value');
        const episodesData = episodesSnapshot.val();

        if (episodesData) {
            const episodesArray = Object.values(episodesData)
                .sort((a, b) => parseInt(b.episode) - parseInt(a.episode));
            
            currentPlaylist.episodes = episodesArray;
            currentEpisodes = [...episodesArray];

            // Initialize controls before displaying episodes
            initializeEpisodeControls();

            // Display initial set of episodes
            displayEpisodesList(episodesArray, true);

            // Check for episode parameter in URL
            const urlParams = new URLSearchParams(window.location.search);
            const episodeNumber = urlParams.get('episode');
            
            if (episodeNumber) {
                // Play specific episode if provided in URL
                const episode = episodesArray.find(ep => ep.episode === episodeNumber);
                if (episode) {
                    currentEpisode = episode;
                    playVideo(episode);
                }
            } else if (document.referrer.includes('index.html')) {
                // Auto-play last episode when coming from home page
                const lastEpisode = episodesArray[0]; // First episode in the sorted array is the latest
                if (lastEpisode) {
                    currentEpisode = lastEpisode;
                    playVideo(lastEpisode);
                }
            }
        }

    } catch (error) {
        console.error('Error loading playlist:', error);
        showError('Failed to load playlist details. Please try again later.');
    }
}

function displayPlaylistInfo(playlist) {
    const playlistImage = document.getElementById('playlistImage');
    const playlistDetails = document.getElementById('playlistDetails');
    const playlistBreadcrumb = document.getElementById('playlistBreadcrumb');

    // Update breadcrumb with playlist title
    playlistBreadcrumb.innerHTML = `<a href="#">${playlist.title}</a>`;

    // Update playlist image
    playlistImage.innerHTML = `
        <img src="${playlist.image}" alt="${playlist.title}" class="img-fluid rounded">
    `;

    // Update playlist details without episode count, season, and last episode
    playlistDetails.innerHTML = `
        <h1 class="playlist-title mb-3">${playlist.title}</h1>
        <div class="playlist-meta mb-3">
            <span class="badge bg-primary me-2">${playlist.type}</span>
            <span class="badge ${playlist.status === 'Ongoing' ? 'bg-success' : 'bg-secondary'} me-2">
                ${playlist.status}
            </span>
            ${playlist.rating ? `<span class="badge bg-warning">★ ${playlist.rating}</span>` : ''}
        </div>
        ${playlist.description ? `<p class="playlist-description">${playlist.description}</p>` : ''}
    `;

    // Store current playlist for later use
    currentPlaylist = playlist;
}

// Add these variables at the top
let isDescending = true;
let currentEpisodes = [];
let displayedEpisodes = 0;
const LOAD_INCREMENT = 10;

// Update the displayEpisodesList function
function displayEpisodesList(episodes, reset = false) {
    const episodesList = document.getElementById('episodesList');
    const loadMore = document.getElementById('loadMore');
    
    if (reset) {
        episodesList.innerHTML = '';
        displayedEpisodes = 0;
        currentEpisodes = [...episodes];
    }

    const start = displayedEpisodes;
    const end = Math.min(start + LOAD_INCREMENT, currentEpisodes.length);
    const nextEpisodes = currentEpisodes.slice(start, end);

    episodesList.insertAdjacentHTML('beforeend', nextEpisodes.map(episode => createEpisodeCard(episode)).join(''));
    
    displayedEpisodes = end;
    loadMore.style.display = displayedEpisodes < currentEpisodes.length ? 'block' : 'none';

    // Add click handlers for new episodes
    const newEpisodeLinks = episodesList.querySelectorAll('.episode-link:not([data-handler])');
    newEpisodeLinks.forEach(link => {
        link.setAttribute('data-handler', 'true');
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const episode = JSON.parse(link.dataset.episode);
            playVideo(episode);
            
            // Update active state
            document.querySelectorAll('.episode-card').forEach(card => {
                card.classList.remove('active');
            });
            link.closest('.episode-card').classList.add('active');
        });
    });
}

// Add this function to initialize episode controls
function initializeEpisodeControls() {
    const searchInput = document.getElementById('episodeSearch');
    const sortButton = document.getElementById('sortButton');
    const loadMore = document.getElementById('loadMore');
    const episodesListWrapper = document.querySelector('.episodes-list-wrapper');

    // Search functionality
    searchInput.addEventListener('input', debounce(() => {
        const searchTerm = searchInput.value.toLowerCase();
        const filteredEpisodes = currentPlaylist.episodes.filter(episode => 
            episode.episode.toLowerCase().includes(searchTerm)
        );
        currentEpisodes = [...filteredEpisodes];
        displayEpisodesList(filteredEpisodes, true);
    }, 300));

    // Sort functionality
    sortButton.addEventListener('click', () => {
        isDescending = !isDescending;
        sortButton.querySelector('i').className = isDescending ? 
            'fas fa-sort-amount-down' : 'fas fa-sort-amount-up';
        
        currentEpisodes.reverse();
        displayEpisodesList(currentEpisodes, true);
    });

    // Remove click event from load more button since we'll use scroll
    if (loadMore) {
        loadMore.style.display = 'none';
    }

    // Add scroll event listener for infinite loading
    let isLoading = false;
    episodesListWrapper.addEventListener('scroll', () => {
        if (isLoading) return;

        const {scrollTop, scrollHeight, clientHeight} = episodesListWrapper;
        
        // Check if we're near the bottom (within 100px)
        if (scrollHeight - scrollTop - clientHeight < 100) {
            if (displayedEpisodes < currentEpisodes.length) {
                isLoading = true;
                
                // Show loading spinner
                loadMore.style.display = 'block';
                
                // Use setTimeout to simulate loading and prevent rapid firing
                setTimeout(() => {
                    displayEpisodesList(currentEpisodes);
                    isLoading = false;
                    
                    // Hide loading spinner if no more episodes
                    if (displayedEpisodes >= currentEpisodes.length) {
                        loadMore.style.display = 'none';
                    }
                }, 300);
            }
        }
    });
}

// Debounce helper function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function createEpisodeCard(episode) {
    const isActive = currentEpisode && currentEpisode.episode === episode.episode;
    const episodeTitle = episode.episode.includes(' - ') ? 
        `Episodes ${episode.episode}` : 
        `Episode ${episode.episode}`;

    return `
        <div class="episode-card ${isActive ? 'active' : ''}">
            <a href="#" class="episode-link" data-episode='${JSON.stringify(episode)}'>
                <div class="episode-title">${episodeTitle}</div>
                <div class="episode-meta">
                    <span class="episode-date">${new Date(episode.postingVideoDate).toLocaleDateString()}</span>
                </div>
            </a>
        </div>
    `;
}

function setupPagination(totalEpisodes) {
    const totalPages = Math.ceil(totalEpisodes / EPISODES_PER_PAGE);
    const paginationContainer = document.getElementById('episodesPagination');

    paginationContainer.innerHTML = `
        <nav aria-label="Episodes pagination">
            <ul class="pagination justify-content-center">
                <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
                    <a class="page-link" href="#" data-page="1">
                        <i class="fas fa-angle-double-left"></i>
                    </a>
                </li>
                <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
                    <a class="page-link" href="#" data-page="${currentPage - 1}">
                        <i class="fas fa-angle-left"></i>
                    </a>
                </li>
                <li class="page-item active">
                    <span class="page-link">${currentPage} / ${totalPages}</span>
                </li>
                <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
                    <a class="page-link" href="#" data-page="${currentPage + 1}">
                        <i class="fas fa-angle-right"></i>
                    </a>
                </li>
                <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
                    <a class="page-link" href="#" data-page="${totalPages}">
                        <i class="fas fa-angle-double-right"></i>
                    </a>
                </li>
            </ul>
        </nav>
    `;

    // Add click handlers for pagination
    paginationContainer.querySelectorAll('.page-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            if (link.parentElement.classList.contains('disabled')) return;
            
            const newPage = parseInt(link.dataset.page);
            currentPage = newPage;
            
            // Reload episodes list with new page
            loadPlaylistDetails(new URLSearchParams(window.location.search).get('id'));
            
            // Scroll to episodes list
            document.querySelector('.episodes-container').scrollIntoView({ behavior: 'smooth' });
        });
    });
}

function showError(message) {
    const container = document.querySelector('.container');
    container.innerHTML = `
        <div class="alert alert-danger mt-4" role="alert">
            ${message}
        </div>
    `;
}

// Add these variables at the top of the file
let currentEpisode = null;
let currentPlaylist = null;

// Add this function to handle different video sources
function getEmbedUrl(src) {
    // Check if it's already an embed URL
    if (src.includes('/embed/')) return src;

    // Handle Dailymotion links
    if (src.includes('dai.ly') || src.includes('dailymotion')) {
        const videoId = src.split('/').pop();
        return `https://www.dailymotion.com/embed/video/${videoId}`;
    }

    // Handle Rumble links
    if (src.includes('rumble.com')) {
        // If it's already in embed format, return as is
        if (src.includes('rumble.com/embed/')) return src;
        
        // Extract video ID and convert to embed URL
        const videoId = src.split('/').pop();
        return `https://rumble.com/embed/${videoId}`;
    }

    // Return original source if no conversion needed
    return src;
}

// Update the playVideo function to remove loading states
function playVideo(episode) {
    const videoPlayerSection = document.getElementById('videoPlayerSection');
    const videoPlayer = document.getElementById('videoPlayer');
    const currentEpisodeTitle = document.getElementById('currentEpisodeTitle');
    const episodeBreadcrumb = document.getElementById('episodeBreadcrumb');
    
    // Update current episode
    currentEpisode = episode;
    
    // Show video player section if hidden
    videoPlayerSection.style.display = 'block';
    
    // Get proper embed URL
    const embedUrl = getEmbedUrl(episode.src);
    
    // Update video source and attributes
    videoPlayer.src = embedUrl;
    
    // Add additional attributes for better compatibility
    videoPlayer.setAttribute('frameborder', '0');
    videoPlayer.setAttribute('allowfullscreen', 'true');
    videoPlayer.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
    
    // Set title and breadcrumb based on episode format
    let episodeTitle = episode.episode;
    let breadcrumbText = episodeTitle.includes(' - ') ? 
        `Episodes ${episodeTitle}` : 
        `Episode ${episodeTitle}`;
    
    // Update breadcrumb
    episodeBreadcrumb.textContent = breadcrumbText;
    
    // Update episode title
    if (episodeTitle.includes(' - ')) {
        currentEpisodeTitle.textContent = `${currentPlaylist.title} - Episodes ${episodeTitle}`;
    } else {
        currentEpisodeTitle.textContent = `${currentPlaylist.title} - Episode ${episodeTitle}`;
    }
    
    // Update URL
    const url = new URL(window.location.href);
    url.searchParams.set('episode', episode.episode);
    window.history.pushState({}, '', url);
    
    displayEpisodesList(currentPlaylist.episodes, currentPage);

    if (window.innerWidth < 992) {
        closeMobileEpisodes();
    }
}

// Update initializeMobileEpisodes function
function initializeMobileEpisodes() {
    const episodesToggle = document.getElementById('episodesToggle');
    const episodesClose = document.getElementById('episodesClose');
    const episodesSidebar = document.getElementById('episodesSidebar');
    const episodesBackdrop = document.getElementById('episodesBackdrop');

    if (episodesToggle && episodesClose && episodesSidebar) {
        // Add touch gesture handling
        let touchStartY = 0;
        let touchEndY = 0;
        const SWIPE_THRESHOLD = 100;

        episodesSidebar.addEventListener('touchstart', (e) => {
            touchStartY = e.touches[0].clientY;
        }, { passive: true });

        episodesSidebar.addEventListener('touchmove', (e) => {
            touchEndY = e.touches[0].clientY;
            const diffY = touchEndY - touchStartY;
            
            // Only allow downward swipe
            if (diffY > 0) {
                episodesSidebar.style.transform = `translateY(${diffY}px)`;
                episodesSidebar.style.transition = 'none';
                
                // Adjust backdrop opacity based on swipe distance
                if (episodesBackdrop) {
                    const opacity = Math.max(0.5 - (diffY / (SWIPE_THRESHOLD * 2)), 0);
                    episodesBackdrop.style.opacity = opacity;
                }
            }
        }, { passive: true });

        episodesSidebar.addEventListener('touchend', () => {
            const diffY = touchEndY - touchStartY;
            
            episodesSidebar.style.transition = 'transform 0.3s ease';
            
            if (diffY > SWIPE_THRESHOLD) {
                closeMobileEpisodes();
            } else {
                // Reset position
                episodesSidebar.style.transform = '';
                if (episodesBackdrop) {
                    episodesBackdrop.style.opacity = '0.5';
                }
            }
            
            // Reset touch coordinates
            touchStartY = 0;
            touchEndY = 0;
        });

        // Toggle episodes sidebar
        episodesToggle.addEventListener('click', () => {
            episodesSidebar.classList.add('active');
            if (episodesBackdrop) {
                episodesBackdrop.classList.add('active');
            }
            document.body.style.overflow = 'hidden';
        });

        // Close button handler
        episodesClose.addEventListener('click', closeMobileEpisodes);

        // Backdrop click handler
        if (episodesBackdrop) {
            episodesBackdrop.addEventListener('click', closeMobileEpisodes);
        }

        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && episodesSidebar.classList.contains('active')) {
                closeMobileEpisodes();
            }
        });
    }
}

// Update closeMobileEpisodes function
function closeMobileEpisodes() {
    const episodesSidebar = document.getElementById('episodesSidebar');
    const episodesBackdrop = document.getElementById('episodesBackdrop');
    
    if (episodesSidebar) {
        episodesSidebar.style.transform = '';
        episodesSidebar.style.transition = 'transform 0.3s ease';
        episodesSidebar.classList.remove('active');
        
        if (episodesBackdrop) {
            episodesBackdrop.classList.remove('active');
            episodesBackdrop.style.opacity = '0.5';
        }
        
        document.body.style.overflow = '';
    }
}

// Initialize mobile episodes functionality
document.addEventListener('DOMContentLoaded', () => {
    initializeMobileEpisodes();
});

// Add this to your existing JavaScript code
function initializeEpisodesSidebar() {
    const sidebar = document.getElementById('episodesSidebar');
    const backdrop = document.getElementById('episodesBackdrop');
    const toggleBtn = document.getElementById('episodesToggle');
    const closeBtn = document.getElementById('episodesClose');

    function openSidebar() {
        sidebar.classList.add('active');
        backdrop.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeSidebar() {
        sidebar.classList.remove('active');
        backdrop.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Toggle button click handler
    toggleBtn.addEventListener('click', openSidebar);

    // Close button click handler
    closeBtn.addEventListener('click', closeSidebar);

    // Backdrop click handler
    backdrop.addEventListener('click', closeSidebar);

    // Close on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && sidebar.classList.contains('active')) {
            closeSidebar();
        }
    });
}

// Call this function after the DOM is loaded
document.addEventListener('DOMContentLoaded', initializeEpisodesSidebar);

// Add this function to load recommendations
async function loadRecommendations(currentPlaylist) {
    const recommendationsContainer = document.getElementById('recommendationsContainer');
    
    try {
        // Get all playlists
        const snapshot = await database.ref('cards').once('value');
        const playlists = snapshot.val();
        
        // Filter recommendations based on type and exclude current playlist
        const recommendations = Object.values(playlists)
            .filter(playlist => 
                playlist.type === currentPlaylist.type && 
                playlist.id !== currentPlaylist.id
            )
            .sort(() => Math.random() - 0.5) // Randomize order
            .slice(0, 4); // Get first 4 items

        // Display recommendations
        recommendationsContainer.innerHTML = recommendations.map(playlist => `
            <div class="col">
                <a href="playlist.html?id=${playlist.id}" class="card-link">
                    <div class="card h-100">
                        <div class="position-relative card-image-wrapper">
                            <img src="${playlist.image}" 
                                 class="card-img-top" 
                                 alt="${playlist.title}" 
                                 loading="lazy">
                            <span class="badge ${playlist.status === 'Ongoing' ? 'bg-success' : 'bg-secondary'} status-badge">
                                ${playlist.status}
                            </span>
                            ${playlist.rating ? 
                                `<span class="badge bg-warning rating-badge">★ ${playlist.rating}</span>` 
                                : ''}
                        </div>
                        <div class="card-body">
                            <h5 class="card-title text-truncate" title="${playlist.title}">
                                ${playlist.title}
                            </h5>
                        </div>
                    </div>
                </a>
            </div>
        `).join('');

    } catch (error) {
        console.error('Error loading recommendations:', error);
        recommendationsContainer.innerHTML = `
            <div class="col-12">
                <div class="alert alert-danger">
                    Failed to load recommendations. Please try again later.
                </div>
            </div>`;
    }
}

// Add throttle function at the top level
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}
