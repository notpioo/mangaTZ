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
});

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

        // Set tags
        const tagsContainer = document.getElementById('mangaTags');
        manga.attributes.tags.forEach(tag => {
            const tagElem = document.createElement('span');
            tagElem.className = 'tag';
            tagElem.textContent = tag.attributes.name.en;
            tagsContainer.appendChild(tagElem);
        });

        // Set description
        const cleanDescription = (desc) => {
            return desc
                .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
                .replace(/\[[^\]]+\]/g, '')
                .replace(/https?:\/\/[^\s]+/g, '')
                .replace(/\s+/g, ' ')
                .trim();
        };
        const descEn = manga.attributes.description.en || '';
        const descId = manga.attributes.description.id || '';
        document.getElementById('mangaDescriptionEn').textContent = cleanDescription(descEn);
        document.getElementById('mangaDescriptionId').textContent = cleanDescription(descId);

        // Set rating from manga statistics
        document.getElementById('mangaRating').textContent = manga.attributes.rating?.average?.toFixed(1) || '0.0';

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

        // Display chapters
        displayChapters(chapters);

    } catch (error) {
        console.error('Error loading manga details:', error);
        // Handle error (show error message to user)
    }
}

function displayChapters(chapters) {
    const container = document.querySelector('.chapters-container');
    
    chapters.forEach(chapter => {
        const chapterItem = document.createElement('div');
        chapterItem.className = 'chapter-item';
        
        const chapterNumber = chapter.attributes.chapter;
        const chapterTitle = chapter.attributes.title;
        const uploadDate = new Date(chapter.attributes.publishAt).toLocaleDateString();

        chapterItem.innerHTML = `
            <div class="chapter-title">
                Chapter ${chapterNumber}
                ${chapterTitle ? `- ${chapterTitle}` : ''}
            </div>
            <div class="chapter-info">${uploadDate}</div>
        `;

        chapterItem.addEventListener('click', () => {
            // Handle chapter click (e.g., redirect to reader)
            console.log(`Chapter ${chapterNumber} clicked`);
        });

        container.appendChild(chapterItem);
    });
}