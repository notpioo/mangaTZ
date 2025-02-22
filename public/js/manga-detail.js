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
        const description = manga.attributes.description.en || Object.values(manga.attributes.description)[0];
        document.getElementById('mangaDescription').textContent = description;

        // Set stats (using placeholder data as MangaDex API doesn't provide these)
        document.getElementById('mangaRating').textContent = (Math.random() * 2 + 3).toFixed(1);
        document.getElementById('mangaFollows').textContent = Math.floor(Math.random() * 10000);
        document.getElementById('mangaComments').textContent = Math.floor(Math.random() * 100);

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