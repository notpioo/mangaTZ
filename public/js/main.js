// DOM Elements
const menuButton = document.getElementById('menuButton');
const closeSidebarButton = document.getElementById('closeSidebar');
const sidebar = document.getElementById('sidebar');
const mainContent = document.querySelector('.main-content');

// Sidebar Toggle
menuButton.addEventListener('click', () => {
    sidebar.classList.add('active');
});

closeSidebarButton.addEventListener('click', () => {
    sidebar.classList.remove('active');
});

// Close sidebar when clicking outside
document.addEventListener('click', (e) => {
    if (!sidebar.contains(e.target) && 
        !menuButton.contains(e.target) && 
        sidebar.classList.contains('active')) {
        sidebar.classList.remove('active');
    }
});

let currentSlide = 0;
const bannerSlides = document.querySelectorAll('.banner-slide');
const bannerDots = document.querySelectorAll('.banner-dot');

function showSlide(index) {
    bannerSlides.forEach(slide => slide.classList.remove('active'));
    bannerDots.forEach(dot => dot.classList.remove('active'));

    bannerSlides[index].classList.add('active');
    bannerDots[index].classList.add('active');
}

function nextSlide() {
    currentSlide = (currentSlide + 1) % bannerSlides.length;
    showSlide(currentSlide);
}

// Auto advance slides every 5 seconds
setInterval(nextSlide, 5000);

// Modifikasi fungsi fetch
async function fetchPopularManga() {
    showLoading('popular-manga');
    try {
        const response = await fetch('/api/manga/popular');

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (!data.data || !Array.isArray(data.data)) {
            throw new Error('Invalid data format received');
        }

        await displayManga(data.data, 'popular-manga');
    } catch (error) {
        console.error('Error fetching popular manga:', error);
        showError('popular-manga', `Failed to load popular manga. ${error.message}`);
    }
}

async function fetchLatestManga() {
    showLoading('latest-manga');
    try {
        const response = await fetch('/api/manga/latest');

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        await displayManga(data.data, 'latest-manga');
    } catch (error) {
        console.error('Error fetching latest manga:', error);
        document.getElementById('latest-manga').innerHTML = `
            <div class="error-message">
                Failed to load latest manga. ${error.message}
            </div>
        `;
    }
}

// Update this line in main.js
async function fetchMangaCovers(manga) {
    if (!manga.relationships) return null;

    const coverRelationship = manga.relationships.find(rel => rel.type === 'cover_art');
    if (!coverRelationship) return null;

    const fileName = coverRelationship.attributes?.fileName;
    if (!fileName) return null;

    // Update URL to use relative path
    return `/api/cover/${manga.id}/${fileName}`;
}

// Di main.js, modifikasi fungsi displayManga
// Di main.js, update fungsi displayManga
async function displayManga(mangaList, containerId) {
    if (!mangaList || mangaList.length === 0) return;

    const container = document.getElementById(containerId);
    if (!container) return;

    // Create slider structure
    container.innerHTML = `
        <div class="manga-slider">
            <button class="slider-button prev">
                <i class="fas fa-chevron-left"></i>
            </button>
            <div class="manga-slider-container">
                <div class="manga-grid">
                </div>
            </div>
            <button class="slider-button next">
                <i class="fas fa-chevron-right"></i>
            </button>
        </div>
    `;

    const mangaGrid = container.querySelector('.manga-grid');
    const placeholderImage = '/images/no-image.png';

    for (const manga of mangaList) {
        try {
            const card = document.createElement('div');
            card.className = 'manga-card';

            // Get manga title
            let title = 'Unknown Title';
            if (manga.attributes?.title) {
                title = manga.attributes.title.en || 
                       manga.attributes.title.ja || 
                       manga.attributes.title['ja-ro'] ||
                       Object.values(manga.attributes.title)[0] ||
                       'Unknown Title';
            }

            // Get cover URL menggunakan route proxy baru
            let coverUrl = placeholderImage;
            if (manga.relationships) {
                const coverArt = manga.relationships.find(rel => rel.type === 'cover_art');
                if (coverArt && coverArt.attributes && coverArt.attributes.fileName) {
                    coverUrl = `/api/manga/cover/${manga.id}/${coverArt.attributes.fileName}`;
                }
            }

            card.innerHTML = `
                <div class="manga-cover-wrapper">
                    <img 
                        src="${coverUrl}" 
                        alt="${title}" 
                        class="manga-cover"
                        onerror="this.src='${placeholderImage}'"
                        loading="lazy">
                </div>
                <div class="manga-info">
                    <h3 class="manga-title">${title}</h3>
                    <div class="manga-details">
                        <span class="manga-rating">
                            <i class="fas fa-star"></i> ${(Math.random() * 2 + 3).toFixed(1)}
                        </span>
                    </div>
                </div>
            `;

            mangaGrid.appendChild(card);
        } catch (error) {
            console.error('Error creating manga card:', error);
        }
    }

    // Initialize slider functionality
    initSlider(containerId);
}

// Slider initialization function
function initSlider(containerId) {
    const container = document.getElementById(containerId);
    const slider = container.querySelector('.manga-slider-container');
    const prevBtn = container.querySelector('.slider-button.prev');
    const nextBtn = container.querySelector('.slider-button.next');

    const scrollAmount = 160 + 16; // card width + gap

    // Previous button click handler
    prevBtn.addEventListener('click', () => {
        slider.scrollBy({
            left: -scrollAmount,
            behavior: 'smooth'
        });
    });

    // Next button click handler
    nextBtn.addEventListener('click', () => {
        slider.scrollBy({
            left: scrollAmount,
            behavior: 'smooth'
        });
    });

    // Update button visibility based on scroll position
    function updateButtons() {
        const isAtStart = slider.scrollLeft === 0;
        const isAtEnd = slider.scrollLeft + slider.clientWidth >= slider.scrollWidth - 10; // small buffer

        prevBtn.style.display = isAtStart ? 'none' : 'flex';
        nextBtn.style.display = isAtEnd ? 'none' : 'flex';
    }

    // Initial button state
    updateButtons();

    // Update buttons on scroll
    slider.addEventListener('scroll', updateButtons);

    // Update buttons on window resize
    window.addEventListener('resize', updateButtons);
}

// Loading state function (unchanged)
function showLoading(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
        const loadingGrid = document.createElement('div');
        loadingGrid.className = 'manga-grid';

        for (let i = 0; i < 12; i++) {
            const loadingCard = document.createElement('div');
            loadingCard.className = 'manga-card';
            loadingCard.innerHTML = `
                <div class="manga-cover-wrapper loading"></div>
                <div class="manga-info">
                    <div class="manga-title loading" style="height: 1rem; margin-bottom: 0.5rem;"></div>
                    <div class="manga-details">
                        <div class="loading" style="height: 1rem; width: 50%;"></div>
                    </div>
                </div>
            `;
            loadingGrid.appendChild(loadingCard);
        }

        container.innerHTML = '';
        container.appendChild(loadingGrid);
    }
}

// Error display function (unchanged)
function showError(containerId, message) {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                ${message}
            </div>
        `;
    }
}

// Tambahkan fungsi untuk preload placeholder image
function preloadPlaceholder() {
    const img = new Image();
    img.src = '/images/no-image.png';
}

// Panggil preload saat dokumen dimuat
document.addEventListener('DOMContentLoaded', () => {
    preloadPlaceholder();
    fetchPopularManga().catch(err => console.error('Error in popular manga:', err));
    fetchLatestManga().catch(err => console.error('Error in latest manga:', err));
});

// Scripts
document.addEventListener('DOMContentLoaded', function() {
    const searchContainer = document.querySelector('.search-container');
    const searchInput = document.querySelector('.search-input');
    const searchBtn = document.querySelector('.search-btn');
    let searchTimeout;

    // Create search results container
    const searchResults = document.createElement('div');
    searchResults.className = 'search-results';
    searchContainer.appendChild(searchResults);

    searchInput.addEventListener('input', function(e) {
        const query = e.target.value.trim();

        // Clear previous timeout
        clearTimeout(searchTimeout);

        // Hide results if query is empty
        if (!query) {
            searchResults.style.display = 'none';
            return;
        }

        // Show loading state
        searchResults.style.display = 'block';
        searchResults.innerHTML = '<div class="search-result-item">Searching...</div>';

        // Set new timeout for search
        searchTimeout = setTimeout(async () => {
            try {
                const response = await fetch(`/api/manga/search?q=${encodeURIComponent(query)}`);
                const data = await response.json();

                // Show results container
                searchResults.style.display = 'block';

                // Clear previous results
                searchResults.innerHTML = '';

                // Display results
                if (data.data && data.data.length > 0) {
                    data.data.forEach(manga => {
                        const title = manga.attributes.title.en || 
                                    manga.attributes.title.ja || 
                                    manga.attributes.title['ja-ro'] ||
                                    Object.values(manga.attributes.title)[0];

                        const resultItem = document.createElement('div');
                        resultItem.className = 'search-result-item';
                        resultItem.innerHTML = `
                            <a href="/manga/${manga.id}" class="search-result-link">
                                <div class="search-result-title">${title}</div>
                            </a>
                        `;
                        searchResults.appendChild(resultItem);
                    });
                } else {
                    searchResults.innerHTML = '<div class="search-no-results">No results found</div>';
                }
            } catch (error) {
                console.error('Search error:', error);
                searchResults.innerHTML = '<div class="search-error">Error searching manga</div>';
            }
        }, 300); // Delay of 300ms
    });

    // Close search results when clicking outside
    document.addEventListener('click', function(e) {
        if (!searchContainer.contains(e.target)) {
            searchResults.style.display = 'none';
        }
    });

    if (window.innerWidth <= 576) {
        searchBtn.addEventListener('click', function(e) {
            e.preventDefault();
            searchContainer.classList.toggle('active');
        });
    }
});