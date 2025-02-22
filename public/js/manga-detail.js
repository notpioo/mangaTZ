document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const mangaId = urlParams.get('id');

    if (!mangaId) {
        window.location.href = '/';
        return;
    }

    loadMangaDetails(mangaId);

    // Back button functionality
    document.querySelector('.back-button').addEventListener('click', () => {
        window.history.back();
    });

    // Chapter search functionality
    const searchInput = document.getElementById('chapterSearch');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const chapters = document.querySelectorAll('.chapter-item');

            chapters.forEach(chapter => {
                const chapterNumber = chapter.querySelector('.chapter-number').textContent.toLowerCase();
                const chapterTitle = chapter.querySelector('.chapter-title').textContent.toLowerCase();

                if (chapterNumber.includes(searchTerm) || chapterTitle.includes(searchTerm)) {
                    chapter.style.display = '';
                } else {
                    chapter.style.display = 'none';
                }
            });
        });
    }

    // Language toggle functionality
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const lang = btn.dataset.lang;
            document.getElementById('mangaDescriptionEn').style.display = lang === 'en' ? 'block' : 'none';
            document.getElementById('mangaDescriptionId').style.display = lang === 'id' ? 'block' : 'none';
        });
    });
});

function cleanDescription(description) {
    if (!description) return '';
    return description
        .replace(/\[.*?\]/g, '') // Remove square brackets content
        .replace(/\(.*?\)/g, '') // Remove parentheses content
        .replace(/https?:\/\/\S+/g, '') // Remove URLs
        .replace(/\n\s*\n/g, '\n') // Remove extra newlines
        .trim();
}

function displayChapters(chapters) {
    const container = document.querySelector('.chapters-container');
    container.innerHTML = '';

    if (!chapters || chapters.length === 0) {
        container.innerHTML = '<p class="no-chapters">No chapters available.</p>';
        return;
    }

    chapters.sort((a, b) => {
        const chA = parseFloat(a.attributes.chapter || 0);
        const chB = parseFloat(b.attributes.chapter || 0);
        return chB - chA; // Sort descending (newest first)
    });

    chapters.forEach(chapter => {
        const chapterNumber = chapter.attributes.chapter || 'N/A';
        const chapterTitle = chapter.attributes.title || `Chapter ${chapterNumber}`;

        const chapterElement = document.createElement('div');
        chapterElement.className = 'chapter-item';
        chapterElement.innerHTML = `
            <span class="chapter-number">Chapter ${chapterNumber}</span>
            <span class="chapter-title">${chapterTitle}</span>
        `;
        container.appendChild(chapterElement);
    });
}

async function loadMangaDetails(mangaId) {
    try {
        const response = await fetch(`/api/manga/${mangaId}`);
        const data = await response.json();

        if (!data.manga.data) {
            throw new Error('Manga not found');
        }

        const manga = data.manga.data;
        const chapters = data.chapters.data;

        // Set cover image and banner
        const coverFile = manga.relationships.find(rel => rel.type === 'cover_art')?.attributes?.fileName;
        if (coverFile) {
            const coverUrl = `/api/manga/cover/${manga.id}/${coverFile}`;
            document.getElementById('mangaCover').src = coverUrl;
            document.querySelector('.manga-banner').style.backgroundImage = `url(${coverUrl})`;
        }

        // Set titles
        const titles = manga.attributes.title;
        document.getElementById('mangaTitle').textContent = titles.en || titles['ja-ro'] || Object.values(titles)[0];
        document.getElementById('mangaTitleJp').textContent = titles.ja || '';

        // Set rating with 2 decimal places
        const rating = manga.attributes.rating?.average || 0;
        document.getElementById('mangaRating').textContent = rating.toFixed(2);

        // Set status
        document.getElementById('mangaStatus').textContent = 
            manga.attributes.status.charAt(0).toUpperCase() + 
            manga.attributes.status.slice(1);

        // Set author
        const author = manga.relationships.find(rel => rel.type === 'author');
        document.getElementById('mangaAuthor').textContent = author?.attributes?.name || 'Unknown';

        // Set descriptions
        const descEn = cleanDescription(manga.attributes.description.en);
        const descId = cleanDescription(manga.attributes.description.id);
        document.getElementById('mangaDescriptionEn').textContent = descEn;
        document.getElementById('mangaDescriptionId').textContent = descId;

        // Set tags
        const tagsContainer = document.getElementById('mangaTags');
        const tags = manga.attributes.tags.map(tag => tag.attributes.name.en);
        tagsContainer.innerHTML = tags.map(tag => `<span class="tag">${tag}</span>`).join('');

        // Display chapters
        displayChapters(chapters);

    } catch (error) {
        console.error('Error loading manga details:', error);
    }
}