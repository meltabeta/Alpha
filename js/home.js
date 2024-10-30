// Define the number of cards per page
const cardsPerPage = 9;
let currentPage = 1;
let cardsData = {}; // Store the data for later use
let filteredCards = []; // Store filtered cards based on search query

// Function to render cards based on the current page
function renderCards(cards, page) {
  const cardList = document.getElementById('card-list');
  cardList.innerHTML = ''; // Clear the existing cards

  const start = (page - 1) * cardsPerPage;
  const end = Math.min(start + cardsPerPage, cards.length);

  for (let i = start; i < end; i++) {
    const card = cards[i];

    // Create card container as a link
    const cardLink = document.createElement('a');
    cardLink.href = card.videoList; // Set the link to the videoList path
    cardLink.classList.add('card');
    cardLink.setAttribute('data-id', card.id); // Add ID to card for potential future use

    // Create image element
    const img = document.createElement('img');
    img.classList.add('img');
    img.src = card.image;
    img.style.width = '100%';

    // Create card info container
    const cardInfoDiv = document.createElement('div');
    cardInfoDiv.classList.add('card-info');

    // Create title element
    const title = document.createElement('h2');
    title.classList.add('title');
    title.textContent = card.title;

    // Create season and episode element
    const seasonEpisode = document.createElement('p');
    seasonEpisode.classList.add('season-episode');
    seasonEpisode.textContent = `S:${card.season} || Ep: ${card.episode} || ${card.type}`;

    // Create type element (optional)
    const type = document.createElement('p');
    type.classList.add('type');
    // type.textContent = `Type: ${card.type}`; // Uncomment if you want to display type

    // Append child elements to card info
    cardInfoDiv.appendChild(title);
    cardInfoDiv.appendChild(seasonEpisode);
    cardInfoDiv.appendChild(type);

    // Append image and card info to the card link container
    cardLink.appendChild(img);
    cardLink.appendChild(cardInfoDiv);

    // Append card link to the card list
    cardList.appendChild(cardLink);
  }

  // Update pagination controls
  updatePaginationControls(cards.length);
}

// Function to update pagination controls
function updatePaginationControls(totalCards) {
  const prevButton = document.getElementById('prev-page');
  const nextButton = document.getElementById('next-page');
  const pageInfo = document.getElementById('page-info');

  prevButton.disabled = currentPage === 1;
  nextButton.disabled = currentPage * cardsPerPage >= totalCards;
  pageInfo.textContent = `Page ${currentPage}`;
}

// Function to handle pagination button clicks
function handlePagination(event) {
  const totalCards = filteredCards.length;
  if (event.target.id === 'prev-page') {
    if (currentPage > 1) {
      currentPage--;
      renderCards(filteredCards, currentPage);
    }
  } else if (event.target.id === 'next-page') {
    if (currentPage * cardsPerPage < totalCards) {
      currentPage++;
      renderCards(filteredCards, currentPage);
    }
  }
}

// Function to sort cards by lastUpdated
function sortCardsByLastUpdated(cards) {
  return cards.sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated));
}

// Function to filter cards based on search query
function filterCards(query) {
  if (!query) {
    filteredCards = cardsData.cards;
  } else {
    filteredCards = cardsData.cards.filter(card =>
      card.title.toLowerCase().includes(query.toLowerCase())
    );
  }
  filteredCards = sortCardsByLastUpdated(filteredCards);
  currentPage = 1; // Reset to first page
  renderCards(filteredCards, currentPage);
}

// Function to render popular donghua cards
function renderPopularDonghua(donghuas) {
  const popularDonghuaList = document.getElementById('popular-donghua-list');
  popularDonghuaList.innerHTML = ''; // Clear existing cards

  donghuas.forEach(donghua => {
    const cardLink = document.createElement('a');
    cardLink.href = donghua.videoList;
    cardLink.classList.add('card');
    cardLink.setAttribute('data-id', donghua.id);

    const img = document.createElement('img');
    img.classList.add('img');
    img.src = donghua.image;
    img.style.width = '100%';

    const cardInfoDiv = document.createElement('div');
    cardInfoDiv.classList.add('card-info');

    const title = document.createElement('h2');
    title.classList.add('title');
    title.textContent = donghua.title;

    const seasonEpisode = document.createElement('p');
    seasonEpisode.classList.add('season-episode');
    seasonEpisode.textContent = `S:${donghua.season} || Ep: ${donghua.episode} || ${donghua.type}`;

    cardInfoDiv.appendChild(title);
    cardInfoDiv.appendChild(seasonEpisode);

    cardLink.appendChild(img);
    cardLink.appendChild(cardInfoDiv);

    popularDonghuaList.appendChild(cardLink);
  });
}

// Fetch popular donghua data and render
fetch('../menu/data/favor-donghua-list.json')
  .then(response => response.json())
  .then(data => {
    renderPopularDonghua(data['favor-donghuas']);
  })
  .catch(error => console.error('Error fetching popular donghua data:', error));

// Fetch JSON data and initialize the page
fetch('./data/home-playlist.json')
  .then(response => response.json())
  .then(data => {
    cardsData = data; // Store the data for later use

    // Sort the cards by lastUpdated before filtering
    filteredCards = sortCardsByLastUpdated(cardsData.cards);
    renderCards(filteredCards, currentPage);

    // Attach event listeners for pagination buttons
    document.getElementById('prev-page').addEventListener('click', handlePagination);
    document.getElementById('next-page').addEventListener('click', handlePagination);

    // Attach event listener for search input
    document.getElementById('search-input').addEventListener('input', (event) => {
      filterCards(event.target.value);
    });
  })
  .catch(error => console.error('Error fetching the JSON data:', error));