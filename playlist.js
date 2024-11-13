function displayPlaylistInfo(playlist) {
    const playlistImage = document.getElementById('playlistImage');
    const playlistDetails = document.getElementById('playlistDetails');
    const playlistBreadcrumb = document.getElementById('playlistBreadcrumb');

    // Update breadcrumb with playlist title
    playlistBreadcrumb.innerHTML = `<a href="#">${playlist.title}</a>`;

    // Update playlist image with badges
    playlistImage.innerHTML = `
        <div class="playlist-title-wrapper mb-3">
            <h1 class="playlist-title">${playlist.title}</h1>
        </div>
        <div class="playlist-image-container">
            <img src="${playlist.image}" alt="${playlist.title}" class="img-fluid rounded">
            <div class="playlist-badges">
                <span class="badge bg-primary">${playlist.type}</span>
                <span class="badge ${playlist.status === 'Ongoing' ? 'bg-success' : 'bg-secondary'}">
                    ${playlist.status}
                </span>
                ${playlist.rating ? `<span class="badge bg-warning">★ ${playlist.rating}</span>` : ''}
            </div>
        </div>
    `;

    // Update playlist details without badges since they're now with the image
    playlistDetails.innerHTML = `
        ${playlist.description ? `<p class="playlist-description">${playlist.description}</p>` : ''}
    `;

    // Store current playlist for later use
    currentPlaylist = playlist;
}

function initializeMobileEpisodes() {
    const episodesToggle = document.getElementById('episodesToggle');
    const episodesClose = document.getElementById('episodesClose');
    const episodesSidebar = document.getElementById('episodesSidebar');

    if (episodesToggle && episodesClose && episodesSidebar) {
        episodesToggle.addEventListener('click', () => {
            episodesSidebar.classList.add('active');
            document.body.style.overflow = 'hidden';
        });

        episodesClose.addEventListener('click', closeMobileEpisodes);

        // Close on backdrop click
        episodesSidebar.addEventListener('click', (e) => {
            if (e.target === episodesSidebar) {
                closeMobileEpisodes();
            }
        });

        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && episodesSidebar.classList.contains('active')) {
                closeMobileEpisodes();
            }
        });
    }
}

function closeMobileEpisodes() {
    const episodesSidebar = document.getElementById('episodesSidebar');
    if (episodesSidebar) {
        episodesSidebar.classList.remove('active');
        document.body.style.overflow = '';
    }
} 