// Di routes/manga.js, tambahkan route untuk proxy cover
const express = require('express');
const axios = require('axios');
const router = express.Router();

// Route yang sudah ada untuk popular manga
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

// Route yang sudah ada untuk latest manga
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

// Tambahkan route baru untuk proxy cover
router.get('/cover/:mangaId/:fileName', async (req, res) => {
    try {
        const { mangaId, fileName } = req.params;
        const coverUrl = `https://uploads.mangadex.org/covers/${mangaId}/${fileName}`;
        
        const response = await axios.get(coverUrl, {
            responseType: 'stream'
        });
        
        // Set header Content-Type sesuai dengan response
        res.set('Content-Type', response.headers['content-type']);
        
        // Pipe response stream ke client
        response.data.pipe(res);
    } catch (error) {
        console.error('Error fetching cover:', error.message);
        res.status(500).json({ error: 'Failed to fetch cover' });
    }
});

module.exports = router;