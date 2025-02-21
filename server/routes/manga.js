
const express = require('express');
const axios = require('axios');
const router = express.Router();

// Search endpoint
router.get('/search', async (req, res) => {
    try {
        const query = req.query.q?.toLowerCase() || '';
        const response = await axios.get(`https://api.mangadex.org/manga`, {
            params: {
                title: query,
                limit: 5,
                order: {
                    relevance: 'desc'
                }
            }
        });
        res.json(response.data);
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ error: 'Failed to search manga' });
    }
});

// Popular manga route
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
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching popular manga:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to fetch popular manga' });
    }
});

// Latest manga route
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

// Cover proxy route
router.get('/cover/:mangaId/:fileName', async (req, res) => {
    try {
        const { mangaId, fileName } = req.params;
        const coverUrl = `https://uploads.mangadex.org/covers/${mangaId}/${fileName}`;
        
        const response = await axios.get(coverUrl, {
            responseType: 'stream'
        });
        
        res.set('Content-Type', response.headers['content-type']);
        response.data.pipe(res);
    } catch (error) {
        console.error('Error fetching cover:', error.message);
        res.status(500).json({ error: 'Failed to fetch cover' });
    }
});

module.exports = router;
