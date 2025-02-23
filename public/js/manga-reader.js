
let currentMangaId = '';
let currentChapterId = '';
let chapters = [];

async function loadChapter(chapterId) {
    try {
        const response = await fetch(`/api/manga/chapter/${chapterId}`);
        if (!response.ok) throw new Error('Failed to fetch chapter');
        
        const data = await response.json();
        
        const imageContainer = document.getElementById('imageContainer');
        imageContainer.innerHTML = '';
        
        data.chapter.data.forEach(page => {
            const img = document.createElement('img');
            img.src = page.url;
            img.loading = 'lazy';
            img.alt = 'Manga page';
            imageContainer.appendChild(img);
        });
        
        document.getElementById('chapter-title').textContent = 
            `Chapter ${data.chapter.attributes.chapter || 'N/A'}`;
        
        currentChapterId = chapterId;
        updateNavigation();
        
        // Update URL without reloading
        const url = new URL(window.location.href);
        url.searchParams.set('chapterId', chapterId);
        window.history.pushState({}, '', url);
    } catch (error) {
        console.error('Error loading chapter:', error);
        alert('Failed to load chapter. Please try again.');
    }
}

function updateNavigation() {
    const currentIndex = chapters.findIndex(ch => ch.id === currentChapterId);
    
    const prevBtn = document.getElementById('prevChapter');
    const nextBtn = document.getElementById('nextChapter');
    
    prevBtn.disabled = currentIndex <= 0;
    nextBtn.disabled = currentIndex >= chapters.length - 1;
    
    prevBtn.onclick = () => {
        if (currentIndex > 0) {
            loadChapter(chapters[currentIndex - 1].id);
        }
    };
    
    nextBtn.onclick = () => {
        if (currentIndex < chapters.length - 1) {
            loadChapter(chapters[currentIndex + 1].id);
        }
    };
}

async function initialize() {
    const params = new URLSearchParams(window.location.search);
    currentMangaId = params.get('mangaId');
    const initialChapterId = params.get('chapterId');
    
    if (!currentMangaId || !initialChapterId) {
        window.location.href = '/';
        return;
    }
    
    try {
        const response = await fetch(`/api/manga/${currentMangaId}`);
        if (!response.ok) throw new Error('Failed to fetch manga details');
        
        const data = await response.json();
        chapters = data.chapters.data;
        
        const select = document.getElementById('chapterSelect');
        select.innerHTML = '';
        
        chapters.forEach(chapter => {
            const option = document.createElement('option');
            option.value = chapter.id;
            option.textContent = `Chapter ${chapter.attributes.chapter}`;
            select.appendChild(option);
        });
        
        select.value = initialChapterId;
        select.onchange = (e) => loadChapter(e.target.value);
        
        document.querySelector('.back-button').onclick = () => {
            window.location.href = `/manga-detail.html?id=${currentMangaId}`;
        };
        
        await loadChapter(initialChapterId);
    } catch (error) {
        console.error('Error initializing reader:', error);
        alert('Failed to initialize reader. Please try again.');
    }
}

document.addEventListener('DOMContentLoaded', initialize);
