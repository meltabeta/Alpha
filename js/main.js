// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAyVzoSJAhb63WbAbjSRVRrIRGGifN9AeI",
  authDomain: "movieflix-c8223.firebaseapp.com",
  databaseURL: "https://movieflix-c8223-default-rtdb.firebaseio.com",
  projectId: "movieflix-c8223",
  storageBucket: "movieflix-c8223.firebasestorage.app",
  messagingSenderId: "745071272054",
  appId: "1:745071272054:web:01021955f18bf87a997f57",
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Constants for pagination
const ITEMS_PER_PAGE = 8;
let currentDonghuaPage = 1;
let currentAnimePage = 1;

// Constants for comments
const COMMENTS_PER_PAGE = 10;
let currentCommentsPage = 1;
let totalComments = 0;

// Import Firebase service
import FirebaseService from "./services/firebase.service.js";

// Function to create navigation items
function createNavItems(types) {
  return types
    .map(
      (type) => `
        <li class="nav-item">
            <a class="nav-link" href="#" data-type="${type.toLowerCase()}">
                ${getTypeIcon(type)}${type}
            </a>
        </li>
    `
    )
    .join("");
}

// Function to get icon for each type
function getTypeIcon(type) {
  const icons = {
    home: '<i class="fas fa-home me-1"></i>',
    donghua: '<i class="fas fa-play-circle me-1"></i>',
    movie: '<i class="fas fa-film me-1"></i>',
    ova: '<i class="fas fa-star me-1"></i>',
    // Add more type-icon mappings as needed
  };
  return icons[type.toLowerCase()] || '<i class="fas fa-circle me-1"></i>';
}

// Function to create a card for each donghua - Modified for better responsive design
function createDonghuaCard(donghua) {
  const statusClass =
    donghua.status === "Ongoing" ? "bg-success" : "bg-secondary";
  const ratingBadge = donghua.rating
    ? `<span class="badge bg-warning rating-badge">★ ${donghua.rating}</span>`
    : "";

  return `
        <div class="col donghua-card" data-type="${donghua.type.toLowerCase()}">
            <a href="playlist.html?id=${donghua.id}" class="card-link">
                <div class="card h-100">
                    <div class="position-relative card-image-wrapper">
                        <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E" 
                             data-src="${donghua.image}" 
                             class="card-img-top lazy" 
                             alt="${donghua.title}" 
                             loading="lazy" 
                             decoding="async"
                             onerror="this.onerror=null; this.src='path/to/fallback-image.jpg';">
                        <span class="badge ${statusClass} status-badge">${donghua.status}</span>
                        <span class="badge bg-primary episode-badge">EP ${donghua.episode}</span>
                        ${ratingBadge}
                    </div>
                    <div class="card-body">
                        <h5 class="card-title text-truncate" title="${donghua.title}">${donghua.title}</h5>
                    </div>
                </div>
            </a>
        </div>
    `;
}

// Function to create section HTML - Modified for responsive grid
function createSectionHTML(title, items, containerId) {
  return `
        <section class="mb-5">
            <h2 class="section-title mb-4">${title}</h2>
            <div class="row row-cols-2 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 row-cols-xxl-5 g-3 g-lg-4" id="${containerId}">
                ${items.map((item) => createDonghuaCard(item)).join("")}
            </div>
            <div class="d-flex justify-content-center mt-4">
                <nav aria-label="${title} pagination">
                    <ul class="pagination" id="${containerId}-pagination">
                        <!-- Pagination will be inserted here -->
                    </ul>
                </nav>
            </div>
        </section>
    `;
}

// Function to get recommended items
function getRecommendedItems(items, currentType, count = 4) {
  // Filter out current type and get random items
  const otherItems = items.filter(
    (item) => item.type.toLowerCase() !== currentType.toLowerCase()
  );
  return shuffleArray(otherItems).slice(0, count);
}

// Shuffle array function
function shuffleArray(array) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

// Modified filter function to include pagination for all sections
function filterDonghua(type) {
  const dynamicSections = document.getElementById("dynamic-sections");

  // Update active nav link
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.classList.remove("active");
    if (link.dataset.type === type) {
      link.classList.add("active");
    }
  });

  if (type === "all" || type === "home") {
    showDefaultSections();
    return;
  }

  // Filter items by type
  const typeItems = window.allItems
    .filter((item) => item.type.toLowerCase() === type.toLowerCase())
    .sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated));

  // Get latest updates for this type
  const latestTypeUpdates = typeItems.slice(0, 8);

  // Get recommended items
  const recommendedItems = getRecommendedItems(window.allItems, type, 8);

  // Create sections HTML
  dynamicSections.innerHTML = `
        ${createSectionHTML(
          `Latest ${type}`,
          latestTypeUpdates.slice(0, ITEMS_PER_PAGE),
          `latest-${type}-updates`
        )}
        ${createSectionHTML(
          `All ${type}`,
          typeItems.slice(0, ITEMS_PER_PAGE),
          `${type}-grid`
        )}
        ${createSectionHTML(
          "Recommended For You",
          recommendedItems.slice(0, ITEMS_PER_PAGE),
          `${type}-recommended`
        )}
    `;

  // Initialize pagination for all sections
  if (latestTypeUpdates.length > ITEMS_PER_PAGE) {
    createPagination(
      latestTypeUpdates.length,
      1,
      `latest-${type}-updates-pagination`,
      `latest-${type}`
    );
  }
  if (typeItems.length > ITEMS_PER_PAGE) {
    createPagination(typeItems.length, 1, `${type}-grid-pagination`, type);
  }
  if (recommendedItems.length > ITEMS_PER_PAGE) {
    createPagination(
      recommendedItems.length,
      1,
      `${type}-recommended-pagination`,
      `${type}-recommended`
    );
  }
}

// Function to show default sections
function showDefaultSections() {
  const dynamicSections = document.getElementById("dynamic-sections");

  // Get latest updates
  const latestUpdates = window.allItems
    .sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated))
    .slice(0, 8);

  // Get donghua and anime items
  const donghuaItems = window.allItems
    .filter((item) => item.type.toLowerCase() === "donghua")
    .sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated));

  const animeItems = window.allItems
    .filter((item) => item.type.toLowerCase() === "anime")
    .sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated));

  // Create default sections HTML
  dynamicSections.innerHTML = `
        ${createSectionHTML(
          "Latest Updates",
          latestUpdates.slice(0, ITEMS_PER_PAGE),
          "latest-updates"
        )}
        ${createSectionHTML(
          "Donghua Series",
          donghuaItems.slice(0, ITEMS_PER_PAGE),
          "donghua-grid"
        )}
        ${createSectionHTML(
          "Anime Series",
          animeItems.slice(0, ITEMS_PER_PAGE),
          "anime-grid"
        )}
    `;

  // Initialize pagination for sections with more than ITEMS_PER_PAGE items
  if (latestUpdates.length > ITEMS_PER_PAGE) {
    createPagination(
      latestUpdates.length,
      1,
      "latest-updates-pagination",
      "latest"
    );
  }
  if (donghuaItems.length > ITEMS_PER_PAGE) {
    createPagination(
      donghuaItems.length,
      currentDonghuaPage,
      "donghua-grid-pagination",
      "donghua"
    );
  }
  if (animeItems.length > ITEMS_PER_PAGE) {
    createPagination(
      animeItems.length,
      currentAnimePage,
      "anime-grid-pagination",
      "anime"
    );
  }
}

// Modified loadDonghuaData function
async function loadDonghuaData() {
  const dynamicSections = document.getElementById("dynamic-sections");

  // Show loading indicator
  dynamicSections.innerHTML = `
        <div class="text-center">
            <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>
    `;

  try {
    // Load all items using Firebase service
    window.allItems = await FirebaseService.loadAllItems();

    // Create navigation items
    const types = [
      "Home",
      ...new Set(window.allItems.map((item) => item.type)),
    ];
    const navbarNav = document.getElementById("navbar-nav");
    navbarNav.innerHTML = createNavItems(types);

    // Add event listeners to nav links
    document.querySelectorAll(".nav-link").forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const type = e.currentTarget.dataset.type;
        filterDonghua(type);
      });
    });

    // Show default sections
    showDefaultSections();

    // Set Home as active by default
    document
      .querySelector('.nav-link[data-type="home"]')
      ?.classList.add("active");
  } catch (error) {
    dynamicSections.innerHTML = `
            <div class="alert alert-danger" role="alert">
                Error loading data: ${error.message}
            </div>
        `;
  }
}

// Load data when page loads
document.addEventListener("DOMContentLoaded", () => {
  loadDonghuaData();

  // Create search overlay
  const searchOverlay = createSearchOverlay();

  // Add click event to search trigger
  const searchTrigger = document.querySelector(".search-trigger");
  if (searchTrigger) {
    searchTrigger.addEventListener("click", (e) => {
      e.preventDefault();
      searchOverlay.classList.add("active");
      const overlaySearchInput = searchOverlay.querySelector(".search-input");
      overlaySearchInput.value = "";
      overlaySearchInput.focus();
    });
  }

  // Initialize filters
  initializeFilters();

  // Initialize comments and load recent comments
  const commentForm = document.getElementById("commentForm");
  if (commentForm) {
    commentForm.addEventListener("submit", submitComment);
  }
  loadComments();
  loadRecentSidebarComments(); // Make sure this is called

  // Add smooth scroll for "View All Comments" link
  document.addEventListener("click", (e) => {
    if (e.target.closest(".view-all-comments")) {
      e.preventDefault();
      const commentsSection = document.querySelector(".comments-section");
      if (commentsSection) {
        commentsSection.scrollIntoView({ behavior: "smooth" });
      }
    }
  });

  // Add throttled scroll handler
  const throttledScroll = throttle(() => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const navbar = document.querySelector('.navbar');
    
    if (navbar) {
      if (scrollTop > 50) {
        navbar.classList.add('navbar-scrolled');
      } else {
        navbar.classList.remove('navbar-scrolled');
      }
    }
  }, 100); // Throttle to run max once per 100ms

  window.addEventListener('scroll', throttledScroll, { passive: true });

  // Implement lazy loading with Intersection Observer
  const lazyLoadImages = () => {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.classList.remove('lazy');
          observer.unobserve(img);
        }
      });
    }, {
      rootMargin: '50px 0px',
      threshold: 0.1
    });

    document.querySelectorAll('img.lazy').forEach(img => {
      imageObserver.observe(img);
    });
  };

  // Initialize lazy loading
  lazyLoadImages();

  // Re-run lazy loading when new content is added
  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      if (mutation.addedNodes.length) {
        lazyLoadImages();
      }
    });
  });

  observer.observe(document.getElementById('dynamic-sections'), {
    childList: true,
    subtree: true
  });
});

// Modified createPagination function with icons
function createPagination(totalItems, currentPage, containerId, type) {
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const container = document.getElementById(containerId);

  if (!container) return;

  let html = "";

  // First page button
  html += `
        <li class="page-item ${currentPage === 1 ? "disabled" : ""}">
            <a class="page-link" href="#" data-page="1" data-type="${type}" aria-label="First">
                <i class="fas fa-angle-double-left"></i>
            </a>
        </li>
    `;

  // Previous button
  html += `
        <li class="page-item ${currentPage === 1 ? "disabled" : ""}">
            <a class="page-link" href="#" data-page="${
              currentPage - 1
            }" data-type="${type}" aria-label="Previous">
                <i class="fas fa-angle-left"></i>
            </a>
        </li>
    `;

  // Current page indicator
  html += `
        <li class="page-item active">
            <span class="page-link">
                ${currentPage} / ${totalPages}
            </span>
        </li>
    `;

  // Next button
  html += `
        <li class="page-item ${currentPage === totalPages ? "disabled" : ""}">
            <a class="page-link" href="#" data-page="${
              currentPage + 1
            }" data-type="${type}" aria-label="Next">
                <i class="fas fa-angle-right"></i>
            </a>
        </li>
    `;

  // Last page button
  html += `
        <li class="page-item ${currentPage === totalPages ? "disabled" : ""}">
            <a class="page-link" href="#" data-page="${totalPages}" data-type="${type}" aria-label="Last">
                <i class="fas fa-angle-double-right"></i>
            </a>
        </li>
    `;

  container.innerHTML = html;

  // Add event listeners to pagination links
  container.querySelectorAll(".page-link").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      if (e.currentTarget.parentElement.classList.contains("disabled")) return;

      const newPage = parseInt(e.currentTarget.dataset.page);
      const itemType = e.currentTarget.dataset.type;

      if (isNaN(newPage)) return;

      // Handle pagination for all section types
      const items = getItemsByType(itemType);
      displayItems(items, newPage, containerId.replace("-pagination", ""));
      createPagination(items.length, newPage, containerId, itemType);
    });
  });
}

// Helper function to get items based on type
function getItemsByType(type) {
  if (type.startsWith("latest-")) {
    const baseType = type.replace("latest-", "");
    return window.allItems
      .filter((item) => item.type.toLowerCase() === baseType.toLowerCase())
      .sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated));
  } else if (type.endsWith("-recommended")) {
    const baseType = type.replace("-recommended", "");
    return getRecommendedItems(window.allItems, baseType, ITEMS_PER_PAGE);
  } else if (type === "latest") {
    return window.allItems.sort(
      (a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated)
    );
  } else {
    return window.allItems
      .filter((item) => item.type.toLowerCase() === type.toLowerCase())
      .sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated));
  }
}

// Function to display items with pagination
function displayItems(items, page, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const start = (page - 1) * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE;
  const paginatedItems = items.slice(start, end);

  if (paginatedItems.length === 0) {
    container.innerHTML = `
            <div class="col-12 text-center">
                <p class="text-muted">No items to display</p>
            </div>
        `;
    return;
  }

  container.innerHTML = paginatedItems
    .map((item) => createDonghuaCard(item))
    .join("");
}

// Function to create search overlay
function createSearchOverlay() {
  // Remove existing overlay if it exists
  const existingOverlay = document.querySelector(".search-overlay");
  if (existingOverlay) {
    existingOverlay.remove();
  }

  const overlay = document.createElement("div");
  overlay.className = "search-overlay";
  overlay.innerHTML = `
        <div class="search-container">
            <div class="search-header">
                <h2>Search Donghua</h2>
                <button class="btn-close-search" aria-label="Close search">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="search-input-container">
                <input type="text" class="search-input" placeholder="Type to search...">
                <i class="fas fa-search search-icon"></i>
            </div>
            <div class="search-results">
                <!-- Results will be displayed here -->
            </div>
        </div>
    `;
  document.body.appendChild(overlay);

  // Add event listeners
  const closeBtn = overlay.querySelector(".btn-close-search");
  const searchInput = overlay.querySelector(".search-input");
  const searchResults = overlay.querySelector(".search-results");

  // Close overlay function
  const closeOverlay = () => {
    overlay.classList.remove("active");
    searchInput.value = "";
    searchResults.innerHTML = "";
  };

  // Close button click event
  closeBtn.addEventListener("click", closeOverlay);

  // Close on escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && overlay.classList.contains("active")) {
      closeOverlay();
    }
  });

  // Close on click outside search container
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      closeOverlay();
    }
  });

  searchInput.addEventListener(
    "input",
    debounce((e) => {
      const query = e.target.value.toLowerCase().trim();
      if (query.length < 2) {
        searchResults.innerHTML = "";
        return;
      }
      performSearch(query, searchResults);
    }, 300)
  );

  return overlay;
}

// Debounce function to limit search frequency
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

// Function to perform search
function performSearch(query, resultsContainer) {
  if (!window.allItems) return;

  const results = window.allItems.filter(
    (item) =>
      item.title.toLowerCase().includes(query) ||
      item.type.toLowerCase().includes(query)
  );

  if (results.length === 0) {
    resultsContainer.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search fa-2x mb-3"></i>
                <p>No results found for "${query}"</p>
            </div>
        `;
    return;
  }

  resultsContainer.innerHTML = `
        <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
            ${results.map((item) => createSearchResultCard(item)).join("")}
        </div>
    `;
}

// Function to create search result card
function createSearchResultCard(item) {
  return `
        <div class="col">
            <div class="search-result-card">
                <img src="${item.image}" alt="${
    item.title
  }" class="result-image">
                <div class="result-info">
                    <h3 class="result-title">${item.title}</h3>
                    <div class="result-meta">
                        <span class="badge bg-primary">${item.type}</span>
                        <span class="badge ${
                          item.status === "Ongoing"
                            ? "bg-success"
                            : "bg-secondary"
                        }">${item.status}</span>
                        <span class="badge bg-info">EP ${item.episode}</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Add filter functionality
function initializeFilters() {
  const filterCheckboxes = document.querySelectorAll(".filter-checkbox");

  filterCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", applyFilters);
  });
}

function applyFilters() {
  const selectedStatus = Array.from(
    document.querySelectorAll('input[id^="status-"]:checked')
  ).map((cb) => cb.value);
  const selectedTypes = Array.from(
    document.querySelectorAll('input[id^="type-"]:checked')
  ).map((cb) => cb.value);
  const selectedRatings = Array.from(
    document.querySelectorAll('input[id^="rating-"]:checked')
  ).map((cb) => cb.value);

  const filteredItems = window.allItems.filter((item) => {
    const statusMatch =
      selectedStatus.length === 0 || selectedStatus.includes(item.status);
    const typeMatch =
      selectedTypes.length === 0 || selectedTypes.includes(item.type);
    const ratingMatch =
      selectedRatings.length === 0 ||
      checkRatingMatch(item.rating, selectedRatings);

    return statusMatch && typeMatch && ratingMatch;
  });

  // Update the display with filtered items
  updateDisplayWithFilters(filteredItems);
}

function checkRatingMatch(rating, selectedRatings) {
  if (!rating) return false;
  const numRating = parseFloat(rating);

  return selectedRatings.some((range) => {
    switch (range) {
      case "high":
        return numRating >= 8;
      case "medium":
        return numRating >= 6 && numRating < 8;
      default:
        return false;
    }
  });
}

function updateDisplayWithFilters(filteredItems) {
  const dynamicSections = document.getElementById("dynamic-sections");

  if (filteredItems.length === 0) {
    dynamicSections.innerHTML = `
            <div class="text-center py-5">
                <i class="fas fa-filter fa-3x mb-3 text-secondary"></i>
                <h3 class="text-secondary">No items match your filters</h3>
                <p class="text-muted">Try adjusting your filter criteria</p>
            </div>
        `;
    return;
  }

  // Sort items by last updated
  const sortedItems = filteredItems.sort(
    (a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated)
  );

  dynamicSections.innerHTML = createSectionHTML(
    "Filtered Results",
    sortedItems,
    "filtered-results"
  );

  if (sortedItems.length > ITEMS_PER_PAGE) {
    createPagination(
      sortedItems.length,
      1,
      "filtered-results-pagination",
      "filtered"
    );
  }
}

// Modified loadComments function
async function loadComments(page = 1) {
  const mainCommentsContainer = document.getElementById("commentsContainer");

  try {
    // Show loading state
    mainCommentsContainer.innerHTML = `
            <div class="text-center py-4">
                <div class="spinner-border" role="status">
                    <span class="visually-hidden">Loading comments...</span>
                </div>
            </div>
        `;

    const { comments, totalComments: total } =
      await FirebaseService.loadComments(page, COMMENTS_PER_PAGE);

    // Update total comments global variable
    totalComments = total;

    // Create container for comments
    const commentsListContainer = document.createElement("div");
    commentsListContainer.className = "comments-list";

    // Display comments
    displayComments(comments, commentsListContainer);

    // Clear container and add comments
    mainCommentsContainer.innerHTML = "";
    mainCommentsContainer.appendChild(commentsListContainer);

    // Add pagination if needed
    if (total > COMMENTS_PER_PAGE) {
      const paginationContainer = document.createElement("div");
      paginationContainer.className = "comments-pagination mt-4";
      paginationContainer.id = "comments-pagination";
      mainCommentsContainer.appendChild(paginationContainer);
      createCommentsPagination(total, page);
    }

    // Log for debugging
    console.log("Loaded comments:", comments);
  } catch (error) {
    console.error("Error loading comments:", error);
    mainCommentsContainer.innerHTML = `
            <div class="alert alert-danger">
                Error loading comments. Please try again later.
                <br>
                <small class="text-muted">${error.message}</small>
            </div>
        `;
  }
}

// Function to create pagination for comments
function createCommentsPagination(total, currentPage) {
  const container = document.getElementById("comments-pagination");
  const totalPages = Math.ceil(total / COMMENTS_PER_PAGE);

  let html = `
        <nav aria-label="Comments pagination">
            <ul class="pagination justify-content-center">
                <li class="page-item ${currentPage === 1 ? "disabled" : ""}">
                    <a class="page-link" href="#" data-page="1">
                        <i class="fas fa-angle-double-left"></i>
                    </a>
                </li>
                <li class="page-item ${currentPage === 1 ? "disabled" : ""}">
                    <a class="page-link" href="#" data-page="${
                      currentPage - 1
                    }">
                        <i class="fas fa-angle-left"></i>
                    </a>
                </li>
                <li class="page-item active">
                    <span class="page-link">${currentPage} / ${totalPages}</span>
                </li>
                <li class="page-item ${
                  currentPage === totalPages ? "disabled" : ""
                }">
                    <a class="page-link" href="#" data-page="${
                      currentPage + 1
                    }">
                        <i class="fas fa-angle-right"></i>
                    </a>
                </li>
                <li class="page-item ${
                  currentPage === totalPages ? "disabled" : ""
                }">
                    <a class="page-link" href="#" data-page="${totalPages}">
                        <i class="fas fa-angle-double-right"></i>
                    </a>
                </li>
            </ul>
        </nav>
    `;

  container.innerHTML = html;

  // Add event listeners to pagination buttons
  container.querySelectorAll(".page-link").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      if (e.currentTarget.parentElement.classList.contains("disabled")) return;

      const newPage = parseInt(e.currentTarget.dataset.page);
      if (isNaN(newPage)) return;

      currentCommentsPage = newPage;
      loadComments(newPage);

      // Smooth scroll to comments section
      document
        .querySelector(".comments-section")
        .scrollIntoView({ behavior: "smooth" });
    });
  });
}

// Modified loadRecentSidebarComments function
async function loadRecentSidebarComments() {
  const sidebarContainer = document.getElementById("sidebarCommentsContainer");
  if (!sidebarContainer) return;

  try {
    const comments = await FirebaseService.loadRecentComments(5);

    if (comments.length === 0) {
      sidebarContainer.innerHTML = `
                <div class="text-center">
                    <p class="text-muted small">No comments yet</p>
                </div>
            `;
      return;
    }

    const commentsHTML = comments
      .map(
        (comment) => `
            <div class="sidebar-comment-card">
                <div class="sidebar-comment-header">
                    <div class="d-flex align-items-center gap-2">
                        <span class="sidebar-commenter-name">${escapeHtml(
                          comment.name
                        )}</span>
                        <span class="badge comment-type ${comment.type.toLowerCase()}">${
          comment.type
        }</span>
                    </div>
                </div>
                <p class="sidebar-comment-text">${escapeHtml(comment.text)}</p>
            </div>
        `
      )
      .join("");

    sidebarContainer.innerHTML = commentsHTML;
  } catch (error) {
    console.error("Error loading recent comments:", error);
    sidebarContainer.innerHTML = `
            <div class="text-center">
                <p class="text-danger small">Error loading comments</p>
            </div>
        `;
  }
}

// Modified submitComment function
async function submitComment(e) {
  e.preventDefault();

  const submitButton = e.target.querySelector('button[type="submit"]');
  submitButton.disabled = true;

  const comment = {
    name: document.getElementById("commenterName").value,
    type: document.getElementById("commentType").value,
    text: document.getElementById("commentText").value,
    timestamp: Date.now(), // Add timestamp here
  };

  try {
    await FirebaseService.submitComment(comment);

    document.getElementById("commentForm").reset();
    submitButton.disabled = false;

    // Show success message
    const alert = document.createElement("div");
    alert.className = "alert alert-success mt-3";
    alert.textContent = "Comment submitted successfully!";
    e.target.appendChild(alert);

    // Remove alert after 3 seconds
    setTimeout(() => alert.remove(), 3000);

    // Reload both main comments and sidebar comments
    loadComments(1);
    loadRecentSidebarComments();
  } catch (error) {
    console.error("Error submitting comment:", error);
    submitButton.disabled = false;

    // Show error message
    const alert = document.createElement("div");
    alert.className = "alert alert-danger mt-3";
    alert.textContent = `Error submitting comment: ${error.message}`;
    e.target.appendChild(alert);

    // Remove alert after 3 seconds
    setTimeout(() => alert.remove(), 3000);
  }
}

// Helper function to escape HTML
function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Helper function to format date
function formatDate(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Add function to display sidebar comments
function displaySidebarComments(comments, container) {
  if (!container) return;

  if (comments.length === 0) {
    container.innerHTML = `
            <p class="text-secondary text-center mb-0" style="font-size: 0.8rem;">
                No comments yet
            </p>
        `;
    return;
  }

  container.innerHTML = `
        ${comments
          .map(
            (comment) => `
            <div class="sidebar-comment-card">
                <div class="sidebar-comment-header">
                    <div class="d-flex align-items-center gap-2">
                        <span class="sidebar-commenter-name">${escapeHtml(
                          comment.name
                        )}</span>
                    </div>
                </div>
                <p class="sidebar-comment-text">${escapeHtml(comment.text)}</p>
            </div>
        `
          )
          .join("")}
        <a href="#comments" class="view-all-comments">
            View All Comments <i class="fas fa-arrow-right ms-1"></i>
        </a>
    `;
}
// Modified displayComments function
function displayComments(comments, container) {
  if (!container) return;

  if (!comments || comments.length === 0) {
    container.innerHTML = `
            <div class="text-center py-4">
                <p class="text-secondary">No comments yet. Be the first to comment!</p>
            </div>
        `;
    return;
  }

  const commentsHTML = comments
    .map(
      (comment) => `
        <div class="comment-card" id="comment-${comment.id}">
            <div class="comment-header">
                <div class="d-flex align-items-center gap-2">
                    <span class="commenter-name">${escapeHtml(
                      comment.name
                    )}</span>
                    <span class="badge comment-type ${comment.type.toLowerCase()}">${
        comment.type
      }</span>
                    <span class="comment-date">${formatDate(
                      comment.timestamp
                    )}</span>
                </div>
            </div>
            <p class="comment-text">${escapeHtml(comment.text)}</p>
        </div>
    `
    )
    .join("");

  container.innerHTML = commentsHTML;
}

// Function to handle sidebar toggle
function initializeSidebar() {
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    const sidebar = document.querySelector('.sidebar');
    const closeSidebarBtn = document.querySelector('.btn-close-sidebar');

    if (sidebarToggle && sidebar && closeSidebarBtn) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
        });

        closeSidebarBtn.addEventListener('click', () => {
            sidebar.classList.remove('active');
            document.body.style.overflow = ''; // Restore scrolling
        });

        // Close sidebar when clicking outside
        document.addEventListener('click', (e) => {
            if (sidebar.classList.contains('active') && 
                !sidebar.contains(e.target) && 
                !sidebarToggle.contains(e.target)) {
                sidebar.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }
}
// Initialize sidebar functionality
document.addEventListener('DOMContentLoaded', () => {
    initializeSidebar();
});

function createCard(item) {
    const statusClass = item.status === "Ongoing" ? "bg-success" : "bg-secondary";
    return `
        <div class="col">
            <a href="/${slugify(item.type)}/${slugify(item.title)}" class="card-link">
                <div class="card h-100">
                    <!-- ...existing card content... -->
                </div>
            </a>
        </div>
    `;
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

