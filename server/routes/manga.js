const express = require('express');
const axios = require('axios');
const router = express.Router();

// Get popular manga
// Di routes/manga.js
router.get('/popular', async (req, res) => {
    try {
        const response = await axios.get('https://api.mangadex.org/manga', {
            params: {
                'order[followedCount]': 'desc',
                'limit': 12,
                'includes[]': ['cover_art', 'author'],
                'contentRating[]': ['safe', 'suggestive', 'erotica'],
                'availableTranslatedLanguage[]': ['en', 'ja']
            }
        });

        // Log untuk debugging
        console.log('Manga data received:', 
            response.data.data.map(manga => ({
                id: manga.id,
                title: manga.attributes?.title,
                hasCover: manga.relationships?.some(rel => rel.type === 'cover_art')
            }))
        );

        res.json(response.data);
    } catch (error) {
        console.error('Error fetching popular manga:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to fetch popular manga' });
    }
});

// Get latest manga
router.get('/latest', async (req, res) => {
    try {
        const response = await axios.get('https://api.mangadex.org/manga', {
            params: {
                'order[createdAt]': 'desc',
                'limit': 12,
                'includes[]': ['cover_art', 'author'],
                'contentRating[]': ['safe', 'suggestive', 'erotica']
            }
        });
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching latest manga:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to fetch latest manga' });
    }
});

module.exports = router;