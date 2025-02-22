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

        // Set status
        const statusMap = {
            'ongoing': 'Ongoing',
            'completed': 'Completed',
            'hiatus': 'On Hiatus',
            'cancelled': 'Cancelled'
        };
        const status = statusMap[manga.attributes.status] || 'Unknown';
        document.getElementById('mangaStatus').textContent = status;

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

let allChapters = [];

function displayChapters(chapters) {
    allChapters = chapters;
    const container = document.querySelector('.chapters-container');
    container.innerHTML = '';

    // Setup search functionality
    const searchInput = document.getElementById('chapterSearch');
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const filteredChapters = allChapters.filter(chapter =>
            chapter.attributes.chapter.toLowerCase().includes(searchTerm)
        );
        renderChapters(filteredChapters);
    });

    renderChapters(chapters);
}

// Tab switching
document.querySelectorAll('.tab-btn').forEach(button => {
    button.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        document.querySelectorAll('.tab-content').forEach(content => {
            content.style.display = 'none';
        });
        document.getElementById(`${button.dataset.tab}Tab`).style.display = 'block';
    });
});


function renderChapters(chapters) {
    const container = document.querySelector('.chapters-container');
    container.innerHTML = '';

    chapters.forEach(chapter => {
        const chapterItem = document.createElement('div');
        chapterItem.className = 'chapter-item';
        chapterItem.setAttribute('data-date', chapter.attributes.publishAt); // Add data-date attribute

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

document.getElementById('chapterSort').addEventListener('change', function() {
    const sortOrder = this.value;
    const chaptersContainer = document.querySelector('.chapters-container');
    const chapters = Array.from(chaptersContainer.children);

    chapters.sort((a, b) => {
        const dateA = new Date(a.getAttribute('data-date'));
        const dateB = new Date(b.getAttribute('data-date'));
        return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

    chaptersContainer.innerHTML = '';
    chapters.forEach(chapter => chaptersContainer.appendChild(chapter));
});

function filterChapters() {
    const searchQuery = document.getElementById('chapterSearch').value.toLowerCase();
    const chaptersContainer = document.querySelector('.chapters-container');
    const chapters = Array.from(chaptersContainer.children);

    //Filtering logic (This part needs more details to be implemented correctly)

}


let currentUser = {
    id: '123', // This should be replaced with actual user ID
    username: 'Current User',
    avatar: '/images/default-avatar.png'
};

document.getElementById('submitComment').addEventListener('click', function() {
    const commentText = document.getElementById('commentInput').value.trim();
    if (!commentText) return;

    const comment = {
        id: Date.now().toString(),
        userId: currentUser.id,
        username: currentUser.username,
        avatar: currentUser.avatar,
        text: commentText,
        date: new Date().toISOString()
    };

    addCommentToDOM(comment);
    document.getElementById('commentInput').value = '';
});

function addCommentToDOM(comment) {
    const commentsContainer = document.querySelector('.comments-container');
    const commentElement = document.createElement('div');
    commentElement.className = `comment-item ${comment.userId === currentUser.id ? 'own-comment' : ''}`;
    commentElement.dataset.commentId = comment.id;

    commentElement.innerHTML = `
        <img src="${comment.avatar}" alt="${comment.username}" class="comment-avatar">
        <div class="comment-content">
            <div class="comment-header">
                <span class="comment-username">${comment.username}</span>
                <span class="comment-date">${new Date(comment.date).toLocaleDateString()}</span>
            </div>
            <p class="comment-text">${comment.text}</p>
        </div>
        ${comment.userId === currentUser.id ? `
            <div class="comment-actions">
                <button onclick="deleteComment('${comment.id}')">
                    <i class="fas fa-ellipsis-v"></i>
                </button>
            </div>
        ` : ''}
    `;

    commentsContainer.prepend(commentElement);
}

function deleteComment(commentId) {
    if (confirm('Are you sure you want to delete this comment?')) {
        const commentElement = document.querySelector(`.comment-item[data-comment-id="${commentId}"]`);
        if (commentElement) {
            commentElement.remove();
        }
    }
}