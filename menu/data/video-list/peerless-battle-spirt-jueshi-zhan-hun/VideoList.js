document.addEventListener('DOMContentLoaded', () => {
  const jsonDataPath = '../peerless-battle-spirt-jueshi-zhan-hun/peerless-battle-spirt-jueshi-zhan-hun.json';
  let currentEpisodeIndex = 0; // Track the current episode index
  let episodes = [];

  fetch(jsonDataPath)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      const seriesName = data['peerless-battle-spirt-jueshi-zhan-hun'][0];
      const episodeListContainer = document.getElementById('episode-list');
      const videoContainer = document.getElementById('video-container');
      const seasonElement = document.getElementById('season');
      const episodeNumberElement = document.getElementById('episode-number');
      const seriesNameElement = document.getElementById('series-name');
      const episodeTitleElement = document.getElementById('episode-title');
      const prevButton = document.getElementById('prev-video');
      const nextButton = document.getElementById('next-video');
      const fullScreenButton = document.getElementById('full-screen-video');

      // Update series name
      seriesNameElement.textContent = seriesName.title;

      // Sort episodes in descending order
      episodes = seriesName.video.sort((a, b) => b.episode - a.episode);

      // Set initial episode
      function setEpisode(index) {
        if (index < 0 || index >= episodes.length) return;
        currentEpisodeIndex = index;
        const episode = episodes[currentEpisodeIndex];
        videoContainer.innerHTML = `
          <iframe
            src="${episode.src}"
            style="
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              position: absolute;
              border: 0;
            "
            allowfullscreen
            scrolling="no"
            allow="autoplay; accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          ></iframe>
        `;
        episodeNumberElement.textContent = episode.episode;
        episodeTitleElement.textContent = `Episode ${episode.episode}`;
        updateEpisodeList();
        scrollToEpisode(index);
      }

      function updateEpisodeList() {
        episodeListContainer.innerHTML = '';
        episodes.forEach((episode, index) => {
          const episodeDiv = document.createElement('div');
          episodeDiv.classList.add('episode');
          if (index === currentEpisodeIndex) {
            episodeDiv.classList.add('active');
          }
          episodeDiv.innerHTML = `
            <span class="epi">Episode</span>
            <span class="episode-number">${episode.episode} English Sub</span>
          `;
          episodeDiv.addEventListener('click', () => {
            setEpisode(index);
          });
          episodeListContainer.appendChild(episodeDiv);
        });
      }

      function scrollToEpisode(index) {
        const episodeDivs = episodeListContainer.querySelectorAll('.episode');
        const currentEpisodeDiv = episodeDivs[index];
        if (currentEpisodeDiv) {
          episodeListContainer.scrollTop = currentEpisodeDiv.offsetTop - (episodeListContainer.clientHeight / 2) + (currentEpisodeDiv.clientHeight / 2);
        }
      }

      // Initialize the first episode
      setEpisode(0);

      // Add event listeners for buttons
      prevButton.addEventListener('click', () => {
        if (currentEpisodeIndex > 0) {
          setEpisode(currentEpisodeIndex - 1);
        }
      });

      nextButton.addEventListener('click', () => {
        if (currentEpisodeIndex < episodes.length - 1) {
          setEpisode(currentEpisodeIndex + 1);
        }
      });

      fullScreenButton.addEventListener('click', () => {
        const iframe = videoContainer.querySelector('iframe');
        if (iframe) {
          if (iframe.requestFullscreen) {
            iframe.requestFullscreen();
          } else if (iframe.mozRequestFullScreen) { /* Firefox */
            iframe.mozRequestFullScreen();
          } else if (iframe.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
            iframe.webkitRequestFullscreen();
          } else if (iframe.msRequestFullscreen) { /* IE/Edge */
            iframe.msRequestFullscreen();
          }
        }
      });
    })
    .catch(error => console.error('Error loading JSON data:', error));
});
