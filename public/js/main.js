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


// Search functionality
const searchContainer = document.querySelector('.search-container');
const searchInput = document.querySelector('.search-input');
const searchResults = document.createElement('div');
searchResults.className = 'search-results';
searchContainer.appendChild(searchResults);

let searchTimeout;

searchInput.addEventListener('input', function(e) {
    const query = e.target.value.trim();

    if (searchTimeout) {
        clearTimeout(searchTimeout);
    }

    if (!query) {
        searchResults.style.display = 'none';
        return;
    }

    searchTimeout = setTimeout(async () => {
        try {
            const response = await fetch(`/api/manga/search?q=${encodeURIComponent(query)}`);
            const data = await response.json();

            searchResults.style.display = 'block';
            searchResults.innerHTML = '';

            if (data.data && data.data.length > 0) {
                data.data.forEach(manga => {
                    const title = manga.attributes.title.en ||
                                manga.attributes.title.ja ||
                                manga.attributes.title['ja-ro'] ||
                                Object.values(manga.attributes.title)[0];

                    const coverRelationship = manga.relationships.find(rel => rel.type === 'cover_art');
                    const coverUrl = coverRelationship && coverRelationship.attributes?.fileName ?
                        `/api/manga/cover/${manga.id}/${coverRelationship.attributes.fileName}` :
                        '/images/no-image.png';

                    const resultItem = document.createElement('div');
                    resultItem.className = 'search-result-item';
                    resultItem.innerHTML = `
                        <a href="/manga-detail.html?id=${manga.id}" class="search-result-link">
                            <img src="${coverUrl}" class="search-result-cover" 
                                 onerror="this.src='/images/no-image.png'" 
                                 alt="${title}" loading="lazy">
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
    }, 300);
});

// Close search results when clicking outside
document.addEventListener('click', function(e) {
    if (!searchContainer.contains(e.target)) {
        searchResults.style.display = 'none';
    }
});

const searchBtnSearch = document.querySelector('.search-btn.search');
const searchBtnCancel = document.querySelector('.search-btn.cancel');

if (searchBtnSearch && searchBtnCancel) {
    searchBtnSearch.addEventListener('click', function() {
        searchContainer.classList.add('active');
        searchInput.focus();
    });

    searchBtnCancel.addEventListener('click', function() {
        searchContainer.classList.remove('active');
        searchInput.value = '';
        searchResults.style.display = 'none';
    });
}

// Loading state function
function showLoading(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = `
            <div class="loading-spinner">
                <div class="spinner"></div>
                <p>Loading...</p>
            </div>
        `;
    }
}

function showError(containerId, message) {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                <p>${message}</p>
            </div>
        `;
    }
}

//Improved displayManga function to handle more precise rating
function displayManga(mangaList, containerId) {
    if (!mangaList || mangaList.length === 0) return;

    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
        <div class="manga-grid">
            ${mangaList.map(manga => {
                const title = manga.attributes.title.en || manga.attributes.title['ja-ro'] || Object.values(manga.attributes.title)[0];
                const coverArt = manga.relationships.find(rel => rel.type === 'cover_art');
                const coverFile = coverArt?.attributes?.fileName;
                const rating = manga.attributes.rating?.average || 0;

                return `
                    <div class="manga-card" onclick="window.location.href='/manga-detail.html?id=${manga.id}'">
                        <div class="manga-cover-wrapper">
                            <img 
                                class="manga-cover" 
                                src="${coverFile ? `/api/manga/cover/${manga.id}/${coverFile}` : '/images/no-image.png'}"
                                alt="${title}"
                                loading="lazy"
                            />
                        </div>
                        <div class="manga-info">
                            <h3 class="manga-title">${title}</h3>
                            <div class="manga-details">
                                <span class="manga-rating">
                                    <i class="fas fa-star"></i> ${rating.toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}


// Fetch and display popular manga
async function fetchPopularManga() {
    showLoading('popular-manga');
    try {
        const response = await fetch('/api/manga/popular');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        await displayManga(data.data, 'popular-manga');
    } catch (error) {
        console.error('Error fetching popular manga:', error);
        showError('popular-manga', `Failed to load popular manga. ${error.message}`);
    }
}

// Fetch and display latest manga
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
        showError('latest-manga', `Failed to load latest manga. ${error.message}`);
    }
}

// Fetch and display top rated manga
async function fetchTopRatedManga() {
    showLoading('top-rated-manga');
    try {
        const response = await fetch('/api/manga/top-rated');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        await displayManga(data.data, 'top-rated-manga');
    } catch (error) {
        console.error('Error fetching top rated manga:', error);
        showError('top-rated-manga', `Failed to load top rated manga. ${error.message}`);
    }
}

// Fetch and display staff picks manga - replacing most viewed
async function fetchStaffPicksManga() {
    showLoading('staff-picks-manga');
    try {
        const response = await fetch('/api/manga/staff-picks');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        await displayManga(data.data, 'staff-picks-manga');
    } catch (error) {
        console.error('Error fetching staff picks manga:', error);
        showError('staff-picks-manga', `Failed to load staff picks manga. ${error.message}`);
    }
}

// Fetch and display recently added manga



// Initialize all manga sections
document.addEventListener('DOMContentLoaded', async () => {
    fetchPopularManga();
    fetchLatestManga();
    fetchTopRatedManga();
    fetchStaffPicksManga(); // Replace most viewed
    fetchRecentlyAddedManga();
});

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